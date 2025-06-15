
-- Tabela para preços personalizados por parceiro
CREATE TABLE public.partner_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES public.partners(id) NOT NULL,
  plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('basic', 'premium')),
  custom_price INTEGER NOT NULL, -- Preço em centavos
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(partner_id, plan_type)
);

-- Índices para melhor performance
CREATE INDEX idx_partner_pricing_partner_id ON public.partner_pricing(partner_id);
CREATE INDEX idx_partner_pricing_plan_type ON public.partner_pricing(plan_type);
CREATE INDEX idx_partner_pricing_active ON public.partner_pricing(is_active);

-- Habilitar RLS
ALTER TABLE public.partner_pricing ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública (necessário para mostrar preços)
CREATE POLICY "partner_pricing_select_public" ON public.partner_pricing
  FOR SELECT USING (is_active = true);

-- Política para inserção/atualização por serviços (futuras funcionalidades admin)
CREATE POLICY "partner_pricing_insert_service" ON public.partner_pricing
  FOR INSERT WITH CHECK (true);

CREATE POLICY "partner_pricing_update_service" ON public.partner_pricing
  FOR UPDATE USING (true);

-- Inserir alguns preços de exemplo para os parceiros existentes
INSERT INTO public.partner_pricing (partner_id, plan_type, custom_price) 
SELECT p.id, 'basic', 2490 -- R$ 24,90
FROM public.partners p 
WHERE p.referral_code = 'PARC001';

INSERT INTO public.partner_pricing (partner_id, plan_type, custom_price) 
SELECT p.id, 'premium', 3490 -- R$ 34,90
FROM public.partners p 
WHERE p.referral_code = 'PARC001';

INSERT INTO public.partner_pricing (partner_id, plan_type, custom_price) 
SELECT p.id, 'basic', 2790 -- R$ 27,90
FROM public.partners p 
WHERE p.referral_code = 'PARC002';

INSERT INTO public.partner_pricing (partner_id, plan_type, custom_price) 
SELECT p.id, 'premium', 3790 -- R$ 37,90
FROM public.partners p 
WHERE p.referral_code = 'PARC002';
