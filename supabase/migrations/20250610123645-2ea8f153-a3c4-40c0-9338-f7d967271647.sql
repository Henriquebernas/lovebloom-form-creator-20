
-- Adicionar coluna form_data na tabela payments para armazenar os dados do formulário
ALTER TABLE public.payments 
ADD COLUMN form_data JSONB;
