-- Mover os nomes dos fornecedores incorretos para o campo observacoes
UPDATE td_fluxo_de_caixa t
SET observacoes = cf.nome,
    cliente_fornecedor_id = NULL
FROM clientes_fornecedores cf
WHERE t.cliente_fornecedor_id = cf.id
  AND cf.tipo = 'fornecedor';

-- Deletar todos os registros incorretos de fornecedores (os 391 que são descrições de despesa)
DELETE FROM clientes_fornecedores 
WHERE tipo = 'fornecedor';

-- Inserir os 3 fornecedores reais da tabela antiga
INSERT INTO clientes_fornecedores (id, nome, cpf_cnpj, tipo, data_criacao, data_atualizacao)
SELECT id, nome, cnpj, 'fornecedor', created_at, updated_at
FROM financeiro_fornecedores_old
ON CONFLICT (id) DO NOTHING;