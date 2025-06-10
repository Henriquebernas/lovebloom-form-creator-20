
-- Permitir que couple_id seja NULL na tabela payments
-- O casal será criado apenas após o pagamento ser aprovado
ALTER TABLE public.payments 
ALTER COLUMN couple_id DROP NOT NULL;
