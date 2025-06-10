
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MP-WEBHOOK] ${step}${detailsStr}`);
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
    logStep("Webhook recebido", { method: req.method });

    const mpAccessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
    const webhookSecret = Deno.env.get("MERCADO_PAGO_WEBHOOK_SECRET");

    if (!mpAccessToken || !webhookSecret) {
      throw new Error("Credenciais do Mercado Pago não configuradas");
    }

    const body = await req.text();
    let data;
    try {
      data = JSON.parse(body);
    } catch {
      logStep("Erro ao parsear JSON do webhook");
      return new Response("Invalid JSON", { status: 400, headers: corsHeaders });
    }

    logStep("Dados do webhook", { action: data.action, type: data.type, id: data.data?.id });

    // Salvar webhook no banco para auditoria
    await supabaseClient
      .from('mercado_pago_webhooks')
      .insert({
        webhook_id: data.id,
        topic: data.type,
        payment_id: data.data?.id?.toString(),
        merchant_order_id: data.data?.merchant_order_id?.toString(),
        raw_data: data
      });

    // Processar apenas notificações de pagamento
    if (data.type === "payment") {
      const paymentId = data.data?.id;
      
      if (!paymentId) {
        logStep("ID do pagamento não encontrado");
        return new Response("Payment ID not found", { status: 400, headers: corsHeaders });
      }

      // Buscar detalhes do pagamento no Mercado Pago
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${mpAccessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!paymentResponse.ok) {
        logStep("Erro ao buscar pagamento no MP", { status: paymentResponse.status });
        return new Response("Error fetching payment", { status: 500, headers: corsHeaders });
      }

      const payment = await paymentResponse.json();
      logStep("Detalhes do pagamento", { 
        id: payment.id, 
        status: payment.status, 
        externalReference: payment.external_reference 
      });

      // Buscar o pagamento no banco de dados usando external_reference
      const { data: dbPayment, error: dbError } = await supabaseClient
        .from('payments')
        .select('*')
        .eq('external_reference', payment.external_reference)
        .single();

      if (dbError) {
        logStep("Erro ao buscar pagamento no banco", { error: dbError.message });
        return new Response("Payment not found in database", { status: 404, headers: corsHeaders });
      }

      // Mapear status do Mercado Pago para nosso sistema
      let paymentStatus = 'pending';
      switch (payment.status) {
        case 'approved':
          paymentStatus = 'succeeded';
          break;
        case 'rejected':
        case 'cancelled':
          paymentStatus = 'failed';
          break;
        case 'pending':
        case 'in_process':
          paymentStatus = 'processing';
          break;
      }

      // Se o pagamento foi aprovado e ainda não criamos o casal, criar agora
      if (paymentStatus === 'succeeded' && !dbPayment.couple_id && dbPayment.form_data) {
        logStep("Criando casal após pagamento aprovado");
        
        const formData = dbPayment.form_data;
        
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
          logStep("Erro ao criar casal", { error: coupleError.message });
        } else {
          logStep("Casal criado com sucesso", { coupleId: couple.id, urlSlug: urlSlug });

          // Upload das fotos se existirem
          if (formData.photosBase64 && formData.photosBase64.length > 0) {
            logStep("Fazendo upload das fotos", { count: formData.photosBase64.length });
            
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

                logStep(`Foto ${i + 1} salva com sucesso`);
              } catch (photoError) {
                logStep(`Erro no upload da foto ${i + 1}`, { error: photoError });
              }
            }
          }

          // Atualizar o pagamento com o ID do casal
          await supabaseClient
            .from('payments')
            .update({
              couple_id: couple.id,
              status: paymentStatus,
              mercado_pago_payment_id: payment.id.toString(),
              mercado_pago_status: payment.status,
              payment_method: payment.payment_method_id || 'mercado_pago',
              updated_at: new Date().toISOString()
            })
            .eq('id', dbPayment.id);

          logStep("Pagamento atualizado com casal criado", { 
            paymentId: dbPayment.id, 
            coupleId: couple.id,
            urlSlug: urlSlug
          });
        }
      } else {
        // Apenas atualizar status do pagamento
        const { error: updateError } = await supabaseClient
          .from('payments')
          .update({
            status: paymentStatus,
            mercado_pago_payment_id: payment.id.toString(),
            mercado_pago_status: payment.status,
            payment_method: payment.payment_method_id || 'mercado_pago',
            updated_at: new Date().toISOString()
          })
          .eq('id', dbPayment.id);

        if (updateError) {
          logStep("Erro ao atualizar pagamento", { error: updateError.message });
          return new Response("Error updating payment", { status: 500, headers: corsHeaders });
        }

        logStep("Pagamento atualizado", { 
          paymentId: dbPayment.id, 
          newStatus: paymentStatus 
        });
      }

      // Marcar webhook como processado
      await supabaseClient
        .from('mercado_pago_webhooks')
        .update({ processed: true })
        .eq('payment_id', paymentId.toString());
    }

    return new Response("OK", { status: 200, headers: corsHeaders });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Erro no webhook", { error: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
