
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
    const { 
      coupleName, 
      startDate, 
      startTime, 
      message, 
      planType, 
      amount, 
      email, 
      musicUrl, 
      photosCount 
    } = await req.json();

    console.log('Dados recebidos:', { 
      coupleName, 
      planType, 
      amount, 
      email, 
      photosCount 
    });

    if (!coupleName || !startDate || !planType || !amount || !email) {
      return new Response("Campos obrigatórios em falta", { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    const mpAccessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
    if (!mpAccessToken) {
      throw new Error("Token do Mercado Pago não configurado");
    }

    // Gerar external_reference único
    const externalReference = `pending_couple_${Date.now()}`;

    // Primeiro, armazenar os dados do casal pendente (não criado ainda)
    const { data: pendingData, error: pendingError } = await supabaseClient
      .from('payments')
      .insert({
        amount: amount,
        currency: 'brl',
        status: 'pending',
        plan_type: planType,
        external_reference: externalReference,
        // Armazenar dados do casal como metadata
        payment_method: JSON.stringify({
          coupleName,
          startDate,
          startTime,
          message,
          email,
          musicUrl,
          photosCount
        })
      })
      .select()
      .single();

    if (pendingError) {
      console.error("Erro ao criar pagamento pendente:", pendingError);
      return new Response("Erro ao criar pagamento", { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    console.log('Pagamento pendente criado:', pendingData.id);

    // Criar preferência no Mercado Pago
    const preference = {
      items: [
        {
          title: `Plano ${planType === 'basic' ? 'Memórias' : 'Eternidade'} - ${coupleName}`,
          quantity: 1,
          unit_price: amount / 100, // Converter de centavos para reais
          currency_id: "BRL"
        }
      ],
      external_reference: externalReference,
      notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mercado-pago-webhook`,
      back_urls: {
        success: `${req.headers.get('origin')}/payment-success?payment_id=${pendingData.id}`,
        failure: `${req.headers.get('origin')}/payment-failure?payment_id=${pendingData.id}`,
        pending: `${req.headers.get('origin')}/payment-pending?payment_id=${pendingData.id}`
      },
      auto_return: "approved",
      payment_methods: {
        excluded_payment_types: [],
        installments: 12
      }
    };

    console.log('Criando preferência no MP...');

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mpAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preference)
    });

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text();
      console.error("Erro do Mercado Pago:", errorText);
      return new Response("Erro ao criar preferência", { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    const mpPreference = await mpResponse.json();
    console.log('Preferência criada:', mpPreference.id);

    // Salvar preferência no banco
    await supabaseClient
      .from('mercado_pago_preferences')
      .insert({
        payment_id: pendingData.id,
        preference_id: mpPreference.id,
        init_point: mpPreference.init_point,
        sandbox_init_point: mpPreference.sandbox_init_point
      });

    console.log('Retornando resultado...');

    return new Response(JSON.stringify({
      payment_id: pendingData.id,
      preference_id: mpPreference.id,
      init_point: mpPreference.init_point,
      sandbox_init_point: mpPreference.sandbox_init_point
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Erro:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
