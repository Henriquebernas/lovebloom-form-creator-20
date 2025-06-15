
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

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
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe secret key não configurado");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    let event;
    try {
      // Para produção, você deve verificar a assinatura do webhook
      event = JSON.parse(body);
      logStep("Event parsed", { type: event.type, id: event.id });
    } catch (err) {
      logStep("Error parsing webhook", { error: err.message });
      return new Response("Webhook error", { status: 400, headers: corsHeaders });
    }

    // Processar diferentes tipos de eventos
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      logStep("Processing checkout session completed", { sessionId: session.id });

      // Buscar o pagamento no banco de dados
      const { data: payment, error: paymentError } = await supabaseClient
        .from('payments')
        .select('*')
        .eq('stripe_session_id', session.id)
        .single();

      if (paymentError || !payment) {
        logStep("Payment not found", { sessionId: session.id, error: paymentError });
        return new Response("Payment not found", { status: 404, headers: corsHeaders });
      }

      // Se o pagamento foi bem-sucedido e ainda não criamos o casal, criar agora
      if (!payment.couple_id && payment.form_data) {
        logStep("Creating couple after successful payment");
        
        const formData = payment.form_data;
        
        // Gerar slug único
        let urlSlug = generateUrlSlug(formData.coupleName);
        let counter = 1;

        // Verificar se o slug já existe
        while (counter <= 10) {
          const { data: existing } = await supabaseClient
            .from('couples')
            .select('id')
            .eq('url_slug', urlSlug)
            .single();

          if (!existing) {
            break; // Slug disponível
          }

          urlSlug = generateUrlSlug(formData.coupleName);
          counter++;
        }

        // Criar o casal
        const { data: couple, error: coupleError } = await supabaseClient
          .from('couples')
          .insert({
            couple_name: formData.coupleName,
            start_date: formData.startDate,
            start_time: formData.startTime || null,
            message: formData.message || null,
            selected_plan: formData.selectedPlan,
            music_url: formData.musicUrl || null,
            email: formData.email,
            url_slug: urlSlug
          })
          .select()
          .single();

        if (coupleError) {
          logStep("Error creating couple", { error: coupleError.message });
        } else {
          logStep("Couple created successfully", { coupleId: couple.id, urlSlug: urlSlug });

          // Upload das fotos se existirem
          if (formData.photosBase64 && formData.photosBase64.length > 0) {
            logStep("Uploading photos", { count: formData.photosBase64.length });
            
            for (let i = 0; i < formData.photosBase64.length; i++) {
              try {
                const photoUrl = await uploadPhotoFromBase64(
                  formData.photosBase64[i], 
                  couple.id, 
                  i + 1, 
                  supabaseClient
                );

                // Salvar referência da foto no banco
                await supabaseClient
                  .from('couple_photos')
                  .insert({
                    couple_id: couple.id,
                    photo_url: photoUrl,
                    photo_order: i + 1,
                    file_name: `photo_${i + 1}.jpg`,
                    file_size: 0
                  });

                logStep(`Photo ${i + 1} saved successfully`);
              } catch (photoError) {
                logStep(`Error uploading photo ${i + 1}`, { error: photoError });
              }
            }
          }

          // Atualizar o pagamento com o ID do casal
          await supabaseClient
            .from('payments')
            .update({
              couple_id: couple.id,
              status: 'succeeded',
              stripe_payment_intent_id: session.payment_intent,
              payment_method: session.payment_method_types?.[0] || 'card',
              updated_at: new Date().toISOString()
            })
            .eq('id', payment.id);

          logStep("Payment updated with couple created", { 
            paymentId: payment.id, 
            coupleId: couple.id,
            urlSlug: urlSlug
          });
        }
      }
    }

    return new Response("OK", { status: 200, headers: corsHeaders });

  } catch (error) {
    logStep("Error in webhook", { error: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
