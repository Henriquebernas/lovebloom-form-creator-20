
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MP-PAYMENT] ${step}${detailsStr}`);
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
    logStep("Criando pagamento Mercado Pago");

    const mpAccessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
    if (!mpAccessToken) {
      throw new Error("MERCADO_PAGO_ACCESS_TOKEN não configurado");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Token de autorização necessário");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user?.email) {
      throw new Error("Usuário não autenticado");
    }

    const { coupleId, planType } = await req.json();
    logStep("Dados recebidos", { coupleId, planType });

    if (!coupleId || !planType) {
      throw new Error("coupleId e planType são obrigatórios");
    }

    // Verificar se o casal existe
    const { data: couple, error: coupleError } = await supabaseClient
      .from('couples')
      .select('*')
      .eq('id', coupleId)
      .single();

    if (coupleError || !couple) {
      throw new Error("Casal não encontrado");
    }

    // Definir preços
    const prices = {
      basic: { amount: 19.90, description: "Plano Memórias - LoveBloom" },
      premium: { amount: 29.90, description: "Plano Eternidade - LoveBloom" }
    };

    const planInfo = prices[planType as keyof typeof prices];
    if (!planInfo) {
      throw new Error("Tipo de plano inválido");
    }

    // Gerar ID único para o pagamento
    const paymentReference = `${coupleId}_${Date.now()}`;

    // Criar registro de pagamento no banco
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        couple_id: coupleId,
        amount: Math.round(planInfo.amount * 100), // Converter para centavos
        currency: 'brl',
        status: 'pending',
        plan_type: planType,
        stripe_session_id: paymentReference, // Usando para armazenar referência do MP
        payment_method: 'mercado_pago'
      })
      .select()
      .single();

    if (paymentError) {
      logStep("Erro ao criar pagamento no banco", { error: paymentError });
      throw new Error("Erro ao criar registro de pagamento");
    }

    logStep("Pagamento criado no banco", { paymentId: payment.id });

    // Criar preferência no Mercado Pago
    const preference = {
      items: [
        {
          title: planInfo.description,
          quantity: 1,
          unit_price: planInfo.amount,
          currency_id: 'BRL'
        }
      ],
      payer: {
        email: userData.user.email,
        name: couple.couple_name
      },
      external_reference: paymentReference,
      notification_url: `${req.headers.get("origin")?.replace("http://", "https://").replace("localhost:8080", "curgukttyfrhvwokjtxb.supabase.co")}/functions/v1/mercado-pago-webhook`,
      back_urls: {
        success: `${req.headers.get("origin")}/payment-success?couple=${coupleId}`,
        failure: `${req.headers.get("origin")}/payment-failure?couple=${coupleId}`,
        pending: `${req.headers.get("origin")}/payment-pending?couple=${coupleId}`
      },
      auto_return: "approved"
    };

    logStep("Criando preferência no MP", { preference });

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mpAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preference)
    });

    if (!response.ok) {
      const errorText = await response.text();
      logStep("Erro na API do MP", { status: response.status, error: errorText });
      throw new Error(`Erro do Mercado Pago: ${response.status}`);
    }

    const mpResponse = await response.json();
    logStep("Preferência criada", { id: mpResponse.id, initPoint: mpResponse.init_point });

    return new Response(JSON.stringify({
      preference_id: mpResponse.id,
      init_point: mpResponse.init_point,
      payment_id: payment.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Erro ao criar pagamento", { error: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
