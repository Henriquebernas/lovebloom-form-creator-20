
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
    const { coupleId, planType, amount, coupleName, formData } = await req.json();

    if (!planType || !amount || !coupleName) {
      return new Response("Missing required fields", { status: 400, headers: corsHeaders });
    }

    const mpAccessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
    if (!mpAccessToken) {
      throw new Error("Mercado Pago access token não configurado");
    }

    // Gerar external_reference único
    const externalReference = `couple_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Criar pagamento no banco de dados com os dados do formulário
    // couple_id será NULL inicialmente e será preenchido após o pagamento
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        amount: amount,
        currency: 'brl',
        status: 'pending',
        plan_type: planType,
        external_reference: externalReference,
        // Armazenar dados do formulário como JSONB para usar no webhook
        form_data: formData
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Erro ao criar pagamento:", paymentError);
      return new Response("Error creating payment", { status: 500, headers: corsHeaders });
    }

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
      return new Response("Error creating preference", { status: 500, headers: corsHeaders });
    }

    const mpPreference = await mpResponse.json();

    // Salvar preferência no banco
    await supabaseClient
      .from('mercado_pago_preferences')
      .insert({
        payment_id: payment.id,
        preference_id: mpPreference.id,
        init_point: mpPreference.init_point,
        sandbox_init_point: mpPreference.sandbox_init_point
      });

    return new Response(JSON.stringify({
      payment_id: payment.id,
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
