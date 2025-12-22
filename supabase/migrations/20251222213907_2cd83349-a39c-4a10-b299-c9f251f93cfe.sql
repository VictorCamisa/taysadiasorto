-- =============================================
-- DADOS INICIAIS (SEEDS)
-- =============================================

-- UUID padrão para user_id (sistema sem autenticação)
DO $$
DECLARE
  v_user_id UUID := '00000000-0000-0000-0000-000000000000'::UUID;
BEGIN

  -- Inserir conta financeira padrão
  INSERT INTO financeiro_contas (user_id, nome, tipo, saldo_inicial, saldo_atual, ativa)
  VALUES 
    (v_user_id, 'Caixa Geral', 'caixa', 0, 0, true),
    (v_user_id, 'Conta Bancária Principal', 'corrente', 0, 0, true)
  ON CONFLICT DO NOTHING;

  -- Inserir categorias de receita
  INSERT INTO financeiro_categorias (user_id, tipo, categoria_sintetica, categoria_analitica, ativa)
  VALUES 
    (v_user_id, 'receita', 'Receitas de Serviços', 'Tratamentos', true),
    (v_user_id, 'receita', 'Receitas de Serviços', 'Consultas', true),
    (v_user_id, 'receita', 'Receitas de Serviços', 'Procedimentos', true),
    (v_user_id, 'receita', 'Outras Receitas', 'Venda de Produtos', true),
    (v_user_id, 'receita', 'Outras Receitas', 'Receitas Diversas', true)
  ON CONFLICT DO NOTHING;

  -- Inserir categorias de despesa
  INSERT INTO financeiro_categorias (user_id, tipo, categoria_sintetica, categoria_analitica, ativa)
  VALUES 
    (v_user_id, 'despesa', 'Custos Operacionais', 'Materiais e Insumos', true),
    (v_user_id, 'despesa', 'Custos Operacionais', 'Produtos para Revenda', true),
    (v_user_id, 'despesa', 'Despesas Administrativas', 'Aluguel', true),
    (v_user_id, 'despesa', 'Despesas Administrativas', 'Água/Luz/Internet', true),
    (v_user_id, 'despesa', 'Despesas Administrativas', 'Material de Escritório', true),
    (v_user_id, 'despesa', 'Despesas com Pessoal', 'Salários', true),
    (v_user_id, 'despesa', 'Despesas com Pessoal', 'Encargos Trabalhistas', true),
    (v_user_id, 'despesa', 'Despesas com Pessoal', 'Benefícios', true),
    (v_user_id, 'despesa', 'Despesas Financeiras', 'Taxas Bancárias', true),
    (v_user_id, 'despesa', 'Despesas Financeiras', 'Juros e Multas', true),
    (v_user_id, 'despesa', 'Despesas com Marketing', 'Publicidade', true),
    (v_user_id, 'despesa', 'Despesas com Marketing', 'Redes Sociais', true),
    (v_user_id, 'despesa', 'Impostos e Taxas', 'Impostos Municipais', true),
    (v_user_id, 'despesa', 'Impostos e Taxas', 'Impostos Estaduais', true),
    (v_user_id, 'despesa', 'Impostos e Taxas', 'Impostos Federais', true)
  ON CONFLICT DO NOTHING;

  -- Inserir formas de pagamento
  INSERT INTO financeiro_formas_pagamento (user_id, nome, tipo, taxa_percentual, dias_recebimento, ativa)
  VALUES 
    (v_user_id, 'Dinheiro', 'dinheiro', 0, 0, true),
    (v_user_id, 'PIX', 'pix', 0, 0, true),
    (v_user_id, 'Cartão de Débito', 'debito', 1.5, 1, true),
    (v_user_id, 'Cartão de Crédito à Vista', 'credito', 3.5, 30, true),
    (v_user_id, 'Cartão de Crédito Parcelado', 'credito', 4.5, 30, true),
    (v_user_id, 'Boleto', 'boleto', 0, 3, true),
    (v_user_id, 'Transferência Bancária', 'transferencia', 0, 1, true)
  ON CONFLICT DO NOTHING;

  -- Inserir origens de receita
  INSERT INTO financeiro_origens (user_id, nome, descricao, ativa)
  VALUES 
    (v_user_id, 'Indicação', 'Cliente indicado por outro cliente', true),
    (v_user_id, 'Instagram', 'Captação via Instagram', true),
    (v_user_id, 'Facebook', 'Captação via Facebook', true),
    (v_user_id, 'Google', 'Captação via Google/SEO', true),
    (v_user_id, 'WhatsApp', 'Captação via WhatsApp', true),
    (v_user_id, 'Presencial', 'Cliente que veio presencialmente', true),
    (v_user_id, 'Retorno', 'Cliente que retornou', true),
    (v_user_id, 'Outros', 'Outras origens', true)
  ON CONFLICT DO NOTHING;

  -- Inserir alguns tratamentos de exemplo
  INSERT INTO financeiro_tratamentos (user_id, nome, grupo, preco, custo_estimado, duracao_minutos, ativo)
  VALUES 
    (v_user_id, 'Limpeza de Pele', 'Faciais', 150.00, 25.00, 60, true),
    (v_user_id, 'Peeling Químico', 'Faciais', 250.00, 40.00, 45, true),
    (v_user_id, 'Hidratação Facial', 'Faciais', 120.00, 20.00, 30, true),
    (v_user_id, 'Massagem Relaxante', 'Corporais', 180.00, 15.00, 60, true),
    (v_user_id, 'Drenagem Linfática', 'Corporais', 160.00, 10.00, 50, true),
    (v_user_id, 'Depilação a Laser', 'Depilação', 300.00, 50.00, 40, true),
    (v_user_id, 'Design de Sobrancelha', 'Sobrancelhas', 80.00, 8.00, 30, true),
    (v_user_id, 'Microblading', 'Sobrancelhas', 800.00, 120.00, 120, true)
  ON CONFLICT DO NOTHING;

  -- Inserir alguns fornecedores de exemplo
  INSERT INTO financeiro_fornecedores (user_id, nome, razao_social, cnpj, telefone, email, ativo)
  VALUES 
    (v_user_id, 'Beleza Total Distribuidora', 'Beleza Total Ltda', '12.345.678/0001-90', '(11) 98765-4321', 'contato@belezatotal.com', true),
    (v_user_id, 'Estética & Cia', 'Estética e Cia Comércio Ltda', '98.765.432/0001-10', '(11) 91234-5678', 'vendas@esteticaecia.com', true),
    (v_user_id, 'Cosméticos Premium', 'Premium Cosméticos ME', '11.222.333/0001-44', '(11) 99876-5432', 'contato@cosmeticospremium.com', true)
  ON CONFLICT DO NOTHING;

  -- Inserir alguns produtos de exemplo
  INSERT INTO estoque_produtos (user_id, nome, categoria, unidade_medida, estoque_atual, estoque_minimo, custo_medio, ativo)
  VALUES 
    (v_user_id, 'Ácido Glicólico 10%', 'Ácidos', 'ml', 500, 100, 0.50, true),
    (v_user_id, 'Ácido Salicílico 2%', 'Ácidos', 'ml', 300, 50, 0.40, true),
    (v_user_id, 'Máscara Hidratante', 'Máscaras', 'un', 20, 5, 15.00, true),
    (v_user_id, 'Protetor Solar FPS 50', 'Protetores', 'un', 30, 10, 25.00, true),
    (v_user_id, 'Óleo de Massagem', 'Óleos', 'ml', 2000, 500, 0.08, true),
    (v_user_id, 'Cera Depilatória', 'Depilação', 'kg', 5, 2, 45.00, true),
    (v_user_id, 'Algodão', 'Descartáveis', 'un', 1000, 200, 0.05, true),
    (v_user_id, 'Luvas Descartáveis', 'Descartáveis', 'un', 500, 100, 0.15, true)
  ON CONFLICT DO NOTHING;

END $$;