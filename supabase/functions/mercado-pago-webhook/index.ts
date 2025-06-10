
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createHash } from "https://deno.land/std@0.190.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MP-WEBHOOK] ${step}${detailsStr}`);
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

    // Verificar assinatura do webhook (se necessário)
    const signature = req.headers.get("x-signature");
    const requestId = req.headers.get("x-request-id");
    
    const body = await req.text();
    let data;
    try {
      data = JSON.parse(body);
    } catch {
      logStep("Erro ao parsear JSON do webhook");
      return new Response("Invalid JSON", { status: 400, headers: corsHeaders });
    }

    logStep("Dados do webhook", { action: data.action, type: data.type, id: data.data?.id });

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
        .eq('stripe_session_id', payment.external_reference) // Usando este campo para armazenar MP reference
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

      // Atualizar status do pagamento
      const { error: updateError } = await supabaseClient
        .from('payments')
        .update({
          status: paymentStatus,
          stripe_payment_intent_id: payment.id.toString(),
          payment_method: payment.payment_method_id || 'mercado_pago',
          updated_at: new Date().toISOString()
        })
        .eq('id', dbPayment.id);

      if (updateError) {
        logStep("Erro ao atualizar pagamento", { error: updateError.message });
        return new Response("Error updating payment", { status: 500, headers: corsHeaders });
      }

      logStep("Pagamento atualizado com sucesso", { 
        paymentId: dbPayment.id, 
        newStatus: paymentStatus 
      });
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
