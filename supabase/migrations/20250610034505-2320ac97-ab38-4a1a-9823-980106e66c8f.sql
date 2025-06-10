
-- Criar tabela para armazenar preferências do Mercado Pago
CREATE TABLE public.mercado_pago_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id UUID REFERENCES public.payments(id) NOT NULL,
  preference_id TEXT NOT NULL UNIQUE,
  init_point TEXT NOT NULL,
  sandbox_init_point TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Criar tabela para logs de webhook do Mercado Pago
CREATE TABLE public.mercado_pago_webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id TEXT,
  topic TEXT,
  payment_id TEXT,
  merchant_order_id TEXT,
  raw_data JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar índices para melhor performance
CREATE INDEX idx_mp_preferences_payment_id ON public.mercado_pago_preferences(payment_id);
CREATE INDEX idx_mp_preferences_preference_id ON public.mercado_pago_preferences(preference_id);
CREATE INDEX idx_mp_webhooks_payment_id ON public.mercado_pago_webhooks(payment_id);
CREATE INDEX idx_mp_webhooks_processed ON public.mercado_pago_webhooks(processed);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.mercado_pago_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mercado_pago_webhooks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para mercado_pago_preferences
CREATE POLICY "Anyone can view preferences" 
  ON public.mercado_pago_preferences 
  FOR SELECT 
  USING (true);

CREATE POLICY "Service role can manage preferences" 
  ON public.mercado_pago_preferences 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Políticas RLS para mercado_pago_webhooks (apenas service role)
CREATE POLICY "Service role can manage webhooks" 
  ON public.mercado_pago_webhooks 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Atualizar a tabela payments para incluir campos específicos do Mercado Pago
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS mercado_pago_payment_id TEXT,
ADD COLUMN IF NOT EXISTS mercado_pago_status TEXT,
ADD COLUMN IF NOT EXISTS external_reference TEXT;

-- Criar índice para external_reference
CREATE INDEX IF NOT EXISTS idx_payments_external_reference ON public.payments(external_reference);
