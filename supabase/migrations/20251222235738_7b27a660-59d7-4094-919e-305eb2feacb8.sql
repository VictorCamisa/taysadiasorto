-- Expandir tabela tratamentos com novos campos
ALTER TABLE tratamentos 
ADD COLUMN IF NOT EXISTS e_cirurgico boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS unidade_medida text DEFAULT 'sessão',
ADD COLUMN IF NOT EXISTS custo_cirurgico numeric DEFAULT 0;

-- Comentários para documentação
COMMENT ON COLUMN tratamentos.e_cirurgico IS 'Indica se o tratamento é cirúrgico (S/N)';
COMMENT ON COLUMN tratamentos.unidade_medida IS 'Unidade de medida: U (unidades), ml, Sessão';
COMMENT ON COLUMN tratamentos.custo_cirurgico IS 'Custo fixo de estrutura cirúrgica';