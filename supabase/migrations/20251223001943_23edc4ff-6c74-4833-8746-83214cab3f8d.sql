-- Remover FK antiga que aponta para financeiro_tratamentos_old
ALTER TABLE tratamentos_ficha_tecnica 
DROP CONSTRAINT IF EXISTS tratamentos_ficha_tecnica_tratamento_id_fkey;

-- Criar nova FK apontando para tratamentos
ALTER TABLE tratamentos_ficha_tecnica 
ADD CONSTRAINT tratamentos_ficha_tecnica_tratamento_id_fkey 
FOREIGN KEY (tratamento_id) REFERENCES tratamentos(id) ON DELETE CASCADE;