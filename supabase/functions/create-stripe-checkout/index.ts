
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

    const { planType, coupleName, formData, referralCode } = await req.json();

    // VALIDAÇÃO DE SEGURANÇA: Verificar se o plano é válido
    if (!planType || !PLAN_PRICES[planType as keyof typeof PLAN_PRICES]) {
      logStep("Invalid plan type", { planType });
      return new Response("Invalid plan type", { status: 400, headers: corsHeaders });
    }

    if (!coupleName) {
      return new Response("Missing required fields", { status: 400, headers: corsHeaders });
    }

    // Verificar se o código de parceiro é válido (se fornecido)
    let partner = null;
    if (referralCode && referralCode.trim()) {
      logStep("Validating referral code", { referralCode });
      
      const { data: partnerData, error: partnerError } = await supabaseClient
        .from('partners')
        .select('*')
        .eq('referral_code', referralCode.toUpperCase())
        .eq('status', 'active')
        .single();

      if (partnerError) {
        logStep("Invalid referral code", { referralCode, error: partnerError.message });
        return new Response("Código de parceiro inválido", { status: 400, headers: corsHeaders });
      }

      partner = partnerData;
      logStep("Partner found", { partnerId: partner.id, partnerName: partner.name });
    }

    // USAR PREÇOS SEGUROS DO BACKEND
    const planConfig = PLAN_PRICES[planType as keyof typeof PLAN_PRICES];
    const amount = planConfig.amount;

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe secret key não configurado");
    }

    logStep("Initializing Stripe", { planType, amount: planConfig.amount, coupleName, hasPartner: !!partner });
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Gerar external_reference único
    const externalReference = `couple_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Criar pagamento no banco de dados com os dados do formulário e parceiro
    const paymentData = {
      amount: amount,
      currency: 'brl',
      status: 'pending',
      plan_type: planType,
      external_reference: externalReference,
      form_data: formData,
      partner_id: partner?.id || null,
      referral_code: partner?.referral_code || null
    };

    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .insert(paymentData)
      .select()
      .single();

    if (paymentError) {
      logStep("Error creating payment", { error: paymentError });
      return new Response("Error creating payment", { status: 500, headers: corsHeaders });
    }

    logStep("Payment created in database", { paymentId: payment.id, partnerId: partner?.id });

    // Calcular taxa de aplicação se houver parceiro
    let applicationFeeAmount = 0;
    if (partner) {
      // A taxa de aplicação será o valor que FICA na plataforma
      const commissionAmount = Math.round(amount * (partner.commission_percentage / 100));
      applicationFeeAmount = amount - commissionAmount; // O que sobra para a plataforma
      
      logStep("Commission calculation", { 
        totalAmount: amount, 
        commissionPercentage: partner.commission_percentage,
        commissionAmount: commissionAmount,
        applicationFeeAmount: applicationFeeAmount
      });
    }

    // Configurar parâmetros do Stripe baseado na presença de parceiro
    const sessionParams: any = {
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
        partner_id: partner?.id || '',
        referral_code: partner?.referral_code || ''
      },
    };

    // Se houver parceiro e conta conectada, usar transferência direta
    if (partner && partner.stripe_account_id) {
      sessionParams.payment_intent_data = {
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: partner.stripe_account_id,
        },
      };
    }

    // Criar sessão de checkout do Stripe
    const session = await stripe.checkout.sessions.create(sessionParams);

    logStep("Stripe session created", { sessionId: session.id, hasTransfer: !!(partner && partner.stripe_account_id) });

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
      url: session.url,
      partner_name: partner?.name || null
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
