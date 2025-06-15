
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-CHECKOUT] ${step}${detailsStr}`);
};

// DEFINIÇÃO SEGURA DOS PREÇOS NO BACKEND
const PLAN_PRICES = {
  basic: {
    amount: 1990, // R$ 19,90 em centavos
    name: 'Plano Memórias',
    description: 'Contador personalizado com até 2 fotos'
  },
  premium: {
    amount: 2990, // R$ 29,90 em centavos  
    name: 'Plano Eternidade',
    description: 'Contador personalizado com até 5 fotos e música'
  }
} as const;

const generateUrlSlug = (coupleName: string): string => {
  const generateHash = () => {
    return Math.random().toString(36).substring(2, 7);
  };

  const nameSlug = coupleName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .trim()
    .replace(/\s+/g, '_') // Substitui espaços por underscores
    .replace(/_+/g, '_') // Remove underscores duplicados
    .replace(/^_+|_+$/g, '') || 'casal'; // Remove underscores no início/fim

  const hash = generateHash();
  return `${nameSlug}_${hash}`;
};

const uploadPhotoFromBase64 = async (base64Data: string, coupleId: string, order: number, supabaseClient: any) => {
  try {
    // Extrair dados da string base64
    const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid base64 format');
    }

    const mimeType = matches[1];
    const base64Content = matches[2];
    
    // Converter base64 para Uint8Array
    const binaryString = atob(base64Content);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Determinar extensão do arquivo
    const extension = mimeType.includes('jpeg') ? 'jpg' : 
                     mimeType.includes('png') ? 'png' : 
                     mimeType.includes('webp') ? 'webp' : 'jpg';

    const fileName = `${coupleId}-${order}-${Date.now()}.${extension}`;
    const filePath = `${coupleId}/${fileName}`;

    // Upload para o storage
    const { error: uploadError } = await supabaseClient.storage
      .from('couple-photos')
      .upload(filePath, bytes, {
        contentType: mimeType
      });

    if (uploadError) {
      console.error('Erro no upload:', uploadError);
      throw uploadError;
    }

    const { data } = supabaseClient.storage
      .from('couple-photos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    console.error('Erro ao fazer upload da foto:', err);
    // Se falhar o upload, retornar uma URL de placeholder
    return `https://placehold.co/360x640/1a1a2e/ff007f?text=Foto+${order}`;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const { planType, coupleName, formData } = await req.json();

    // VALIDAÇÃO DE SEGURANÇA: Verificar se o plano é válido
    if (!planType || !PLAN_PRICES[planType as keyof typeof PLAN_PRICES]) {
      logStep("Invalid plan type", { planType });
      return new Response("Invalid plan type", { status: 400, headers: corsHeaders });
    }

    if (!coupleName) {
      return new Response("Missing required fields", { status: 400, headers: corsHeaders });
    }

    // USAR PREÇOS SEGUROS DO BACKEND
    const planConfig = PLAN_PRICES[planType as keyof typeof PLAN_PRICES];
    const amount = planConfig.amount;

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe secret key não configurado");
    }

    logStep("Initializing Stripe", { planType, amount: planConfig.amount, coupleName });
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Gerar external_reference único
    const externalReference = `couple_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Criar pagamento no banco de dados com os dados do formulário
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        amount: amount,
        currency: 'brl',
        status: 'pending',
        plan_type: planType,
        external_reference: externalReference,
        form_data: formData
      })
      .select()
      .single();

    if (paymentError) {
      logStep("Error creating payment", { error: paymentError });
      return new Response("Error creating payment", { status: 500, headers: corsHeaders });
    }

    logStep("Payment created in database", { paymentId: payment.id });

    // Criar sessão de checkout do Stripe
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `${planConfig.name} - ${coupleName}`,
              description: planConfig.description,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/payment-success?payment_id=${payment.id}`,
      cancel_url: `${req.headers.get('origin')}/payment-failure?payment_id=${payment.id}`,
      metadata: {
        payment_id: payment.id,
        external_reference: externalReference,
      },
    });

    logStep("Stripe session created", { sessionId: session.id });

    // Atualizar pagamento com session_id do Stripe
    await supabaseClient
      .from('payments')
      .update({
        stripe_session_id: session.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id);

    return new Response(JSON.stringify({
      payment_id: payment.id,
      session_id: session.id,
      url: session.url
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    logStep("Error in function", { error: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
