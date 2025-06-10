
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const body = await req.json();
    console.log('Webhook recebido:', JSON.stringify(body, null, 2));

    // Salvar webhook raw
    await supabaseClient
      .from('mercado_pago_webhooks')
      .insert({
        raw_data: body,
        topic: body.topic,
        webhook_id: body.id?.toString(),
        payment_id: body.data?.id?.toString(),
        processed: false
      });

    if (body.topic === 'payment') {
      const paymentId = body.data?.id;
      if (!paymentId) {
        console.log('Payment ID não encontrado no webhook');
        return new Response('Payment ID não encontrado', { status: 400 });
      }

      console.log(`Processando pagamento: ${paymentId}`);

      // Buscar detalhes do pagamento no Mercado Pago
      const mpAccessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
      if (!mpAccessToken) {
        throw new Error("Token do Mercado Pago não configurado");
      }

      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${mpAccessToken}`
        }
      });

      if (!paymentResponse.ok) {
        console.error('Erro ao buscar pagamento no MP');
        return new Response('Erro ao buscar pagamento', { status: 500 });
      }

      const paymentData = await paymentResponse.json();
      console.log('Dados do pagamento:', JSON.stringify(paymentData, null, 2));

      const externalReference = paymentData.external_reference;
      const status = paymentData.status;

      if (!externalReference) {
        console.log('External reference não encontrado');
        return new Response('External reference não encontrado', { status: 400 });
      }

      // Buscar o pagamento no nosso banco
      const { data: payment, error: paymentError } = await supabaseClient
        .from('payments')
        .select('*')
        .eq('external_reference', externalReference)
        .single();

      if (paymentError || !payment) {
        console.error('Pagamento não encontrado no banco:', paymentError);
        return new Response('Pagamento não encontrado', { status: 404 });
      }

      console.log('Pagamento encontrado no banco:', payment.id);

      // Atualizar status do pagamento
      let newStatus = 'pending';
      if (status === 'approved') {
        newStatus = 'succeeded';
      } else if (status === 'rejected' || status === 'cancelled') {
        newStatus = 'failed';
      }

      await supabaseClient
        .from('payments')
        .update({
          status: newStatus,
          mercado_pago_payment_id: paymentId.toString(),
          mercado_pago_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.id);

      console.log(`Status do pagamento atualizado para: ${newStatus}`);

      // Se o pagamento foi aprovado, criar o casal
      if (status === 'approved') {
        console.log('Pagamento aprovado, criando casal...');

        try {
          // Extrair dados do casal do payment_method (onde salvamos como JSON)
          const coupleData = JSON.parse(payment.payment_method || '{}');
          
          if (!coupleData.coupleName || !coupleData.startDate) {
            console.error('Dados do casal incompletos:', coupleData);
            return new Response('Dados do casal incompletos', { status: 400 });
          }

          // Gerar URL slug único
          const baseSlug = coupleData.coupleName
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 30);
          
          const urlSlug = `${baseSlug}-${Date.now()}`;

          // Criar o casal
          const { data: couple, error: coupleError } = await supabaseClient
            .from('couples')
            .insert({
              couple_name: coupleData.coupleName,
              start_date: coupleData.startDate,
              start_time: coupleData.startTime || null,
              message: coupleData.message || null,
              selected_plan: payment.plan_type,
              music_url: coupleData.musicUrl || null,
              email: coupleData.email,
              url_slug: urlSlug
            })
            .select()
            .single();

          if (coupleError) {
            console.error('Erro ao criar casal:', coupleError);
            return new Response('Erro ao criar casal', { status: 500 });
          }

          console.log('Casal criado com sucesso:', couple.id);

          // Atualizar o pagamento com o couple_id
          await supabaseClient
            .from('payments')
            .update({ couple_id: couple.id })
            .eq('id', payment.id);

          console.log('Payment atualizado com couple_id');

        } catch (createError) {
          console.error('Erro ao criar casal após pagamento aprovado:', createError);
          // Não retornar erro aqui para não afetar o webhook do MP
        }
      }

      // Marcar webhook como processado
      await supabaseClient
        .from('mercado_pago_webhooks')
        .update({ processed: true })
        .eq('webhook_id', body.id?.toString());

    }

    return new Response('OK', { 
      status: 200,
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('Erro no webhook:', error);
    return new Response('Erro interno', { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
