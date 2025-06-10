
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
    console.log('Iniciando criação de pagamento...');
    
    const { coupleId, planType, amount, coupleName } = await req.json();
    
    console.log('Dados recebidos:', { coupleId, planType, amount, coupleName });

    if (!coupleId || !planType || !amount) {
      console.error('Campos obrigatórios ausentes:', { coupleId, planType, amount });
      return new Response(JSON.stringify({ error: "Missing required fields" }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const mpAccessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
    if (!mpAccessToken) {
      console.error("MERCADO_PAGO_ACCESS_TOKEN não configurado");
      throw new Error("Mercado Pago access token não configurado");
    }

    console.log('Token MP encontrado:', mpAccessToken ? 'Sim' : 'Não');

    // Gerar external_reference único
    const externalReference = `couple_${coupleId}_${Date.now()}`;
    console.log('External reference gerado:', externalReference);

    // Criar pagamento no banco de dados
    console.log('Criando pagamento no banco...');
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        couple_id: coupleId,
        amount: amount,
        currency: 'brl',
        status: 'pending',
        plan_type: planType,
        external_reference: externalReference
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Erro ao criar pagamento no banco:", paymentError);
      return new Response(JSON.stringify({ error: "Error creating payment" }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    console.log('Pagamento criado no banco com ID:', payment.id);

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
        success: `${req.headers.get('origin')}/payment-success?payment_id=${payment.id}`,
        failure: `${req.headers.get('origin')}/payment-failure?payment_id=${payment.id}`,
        pending: `${req.headers.get('origin')}/payment-pending?payment_id=${payment.id}`
      },
      auto_return: "approved",
      payment_methods: {
        excluded_payment_types: [],
        installments: 12
      }
    };

    console.log('Criando preferência no MP:', JSON.stringify(preference, null, 2));

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mpAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preference)
    });

    console.log('Resposta do MP status:', mpResponse.status);

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text();
      console.error("Erro do Mercado Pago:", errorText);
      return new Response(JSON.stringify({ error: "Error creating preference", details: errorText }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const mpPreference = await mpResponse.json();
    console.log('Preferência criada:', mpPreference);

    // Salvar preferência no banco
    const { error: prefError } = await supabaseClient
      .from('mercado_pago_preferences')
      .insert({
        payment_id: payment.id,
        preference_id: mpPreference.id,
        init_point: mpPreference.init_point,
        sandbox_init_point: mpPreference.sandbox_init_point
      });

    if (prefError) {
      console.error('Erro ao salvar preferência:', prefError);
    }

    const result = {
      payment_id: payment.id,
      preference_id: mpPreference.id,
      init_point: mpPreference.init_point,
      sandbox_init_point: mpPreference.sandbox_init_point
    };

    console.log('Retornando resultado:', result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Erro geral:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
