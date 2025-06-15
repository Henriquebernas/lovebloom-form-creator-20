
-- Tabela de parceiros
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  document VARCHAR(50), -- CPF/CNPJ
  referral_code VARCHAR(50) NOT NULL UNIQUE,
  commission_percentage DECIMAL(5,2) DEFAULT 10.00, -- Percentual de comissão (ex: 10.50 = 10,5%)
  stripe_account_id VARCHAR(255), -- ID da conta conectada no Stripe
  status VARCHAR(20) DEFAULT 'pending', -- pending, active, suspended, inactive
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para registrar comissões
CREATE TABLE public.commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES public.partners(id) NOT NULL,
  payment_id UUID REFERENCES public.payments(id) NOT NULL,
  commission_amount INTEGER NOT NULL, -- Valor da comissão em centavos
  commission_percentage DECIMAL(5,2) NOT NULL, -- Percentual usado no cálculo
  status VARCHAR(20) DEFAULT 'pending', -- pending, paid, cancelled
  stripe_transfer_id VARCHAR(255), -- ID da transferência no Stripe
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar campo partner_id na tabela payments para rastrear vendas de parceiros
ALTER TABLE public.payments 
ADD COLUMN partner_id UUID REFERENCES public.partners(id);

-- Adicionar campo referral_code para identificar o parceiro na venda
ALTER TABLE public.payments 
ADD COLUMN referral_code VARCHAR(50);

-- Índices para melhor performance
CREATE INDEX idx_partners_referral_code ON public.partners(referral_code);
CREATE INDEX idx_partners_status ON public.partners(status);
CREATE INDEX idx_commissions_partner_id ON public.commissions(partner_id);
CREATE INDEX idx_commissions_payment_id ON public.commissions(payment_id);
CREATE INDEX idx_commissions_status ON public.commissions(status);
CREATE INDEX idx_payments_partner_id ON public.payments(partner_id);
CREATE INDEX idx_payments_referral_code ON public.payments(referral_code);

-- Alguns parceiros de exemplo (opcional)
INSERT INTO public.partners (name, email, referral_code, commission_percentage, status) VALUES
('Parceiro Exemplo 1', 'parceiro1@exemplo.com', 'PARC001', 15.00, 'active'),
('Parceiro Exemplo 2', 'parceiro2@exemplo.com', 'PARC002', 12.50, 'active');
