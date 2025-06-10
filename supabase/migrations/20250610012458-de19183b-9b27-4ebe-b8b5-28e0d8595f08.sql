
-- Adicionar coluna email na tabela couples
ALTER TABLE public.couples 
ADD COLUMN email TEXT;

-- Criar índice para busca por email
CREATE INDEX idx_couples_email ON public.couples(email);

-- Adicionar coluna url_slug para armazenar o slug único da URL
ALTER TABLE public.couples 
ADD COLUMN url_slug TEXT UNIQUE;

-- Criar índice para busca por slug
CREATE INDEX idx_couples_url_slug ON public.couples(url_slug);
