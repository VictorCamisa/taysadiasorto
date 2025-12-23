-- Adicionar campo observacoes para guardar detalhes que estavam incorretamente em fornecedor
ALTER TABLE public.td_fluxo_de_caixa 
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Comentário para documentar
COMMENT ON COLUMN public.td_fluxo_de_caixa.observacoes IS 'Observações adicionais do lançamento';