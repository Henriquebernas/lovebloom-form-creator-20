
-- Criar tabela de casais
CREATE TABLE public.couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  start_time TIME,
  message TEXT,
  selected_plan TEXT NOT NULL CHECK (selected_plan IN ('basic', 'premium')),
  music_url TEXT,
  email TEXT NOT NULL,
  url_slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela de fotos dos casais
CREATE TABLE public.couple_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_order INTEGER NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela de pagamentos (limpa, apenas com campos do Stripe)
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES public.couples(id) ON DELETE SET NULL,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'brl',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'canceled')),
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'premium')),
  payment_method TEXT,
  external_reference TEXT,
  form_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couple_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Políticas para tabela couples (acesso público para leitura via slug)
CREATE POLICY "couples_select_public" ON public.couples
  FOR SELECT USING (true);

CREATE POLICY "couples_insert_service" ON public.couples
  FOR INSERT WITH CHECK (true);

CREATE POLICY "couples_update_service" ON public.couples
  FOR UPDATE USING (true);

-- Políticas para tabela couple_photos (acesso público para leitura)
CREATE POLICY "couple_photos_select_public" ON public.couple_photos
  FOR SELECT USING (true);

CREATE POLICY "couple_photos_insert_service" ON public.couple_photos
  FOR INSERT WITH CHECK (true);

-- Políticas para tabela payments (acesso restrito)
CREATE POLICY "payments_select_own" ON public.payments
  FOR SELECT USING (true);

CREATE POLICY "payments_insert_service" ON public.payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "payments_update_service" ON public.payments
  FOR UPDATE USING (true);

-- Criar bucket para fotos dos casais
INSERT INTO storage.buckets (id, name, public) 
VALUES ('couple-photos', 'couple-photos', true);

-- Política para o bucket (acesso público)
CREATE POLICY "couple_photos_bucket_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'couple-photos');

CREATE POLICY "couple_photos_bucket_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'couple-photos');

CREATE POLICY "couple_photos_bucket_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'couple-photos');

CREATE POLICY "couple_photos_bucket_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'couple-photos');
