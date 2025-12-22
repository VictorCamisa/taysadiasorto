-- =============================================
-- FASE 1: ADICIONAR COLUNAS FALTANTES
-- =============================================

-- Adicionar colunas faltantes em financeiro_lancamentos
ALTER TABLE financeiro_lancamentos 
ADD COLUMN IF NOT EXISTS valor_entrada NUMERIC DEFAULT 0;

ALTER TABLE financeiro_lancamentos 
ADD COLUMN IF NOT EXISTS valor_saida NUMERIC DEFAULT 0;

ALTER TABLE financeiro_lancamentos 
ADD COLUMN IF NOT EXISTS cliente TEXT;

ALTER TABLE financeiro_lancamentos 
ADD COLUMN IF NOT EXISTS quantidade INTEGER DEFAULT 1;

ALTER TABLE financeiro_lancamentos 
ADD COLUMN IF NOT EXISTS custo_tratamento NUMERIC DEFAULT 0;

ALTER TABLE financeiro_lancamentos 
ADD COLUMN IF NOT EXISTS margem NUMERIC DEFAULT 0;

ALTER TABLE financeiro_lancamentos 
ADD COLUMN IF NOT EXISTS conta_financeira_id UUID;

-- Criar Foreign Key para conta_financeira_id
ALTER TABLE financeiro_lancamentos
ADD CONSTRAINT financeiro_lancamentos_conta_financeira_id_fkey
FOREIGN KEY (conta_financeira_id) REFERENCES financeiro_contas(id) ON DELETE SET NULL;

-- =============================================
-- FASE 2: CRIAR TODAS AS FOREIGN KEYS FALTANTES
-- =============================================

-- Foreign keys para financeiro_lancamentos (as que faltam)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'financeiro_lancamentos_categoria_id_fkey') THEN
    ALTER TABLE financeiro_lancamentos
    ADD CONSTRAINT financeiro_lancamentos_categoria_id_fkey
    FOREIGN KEY (categoria_id) REFERENCES financeiro_categorias(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'financeiro_lancamentos_conta_id_fkey') THEN
    ALTER TABLE financeiro_lancamentos
    ADD CONSTRAINT financeiro_lancamentos_conta_id_fkey
    FOREIGN KEY (conta_id) REFERENCES financeiro_contas(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'financeiro_lancamentos_forma_pagamento_id_fkey') THEN
    ALTER TABLE financeiro_lancamentos
    ADD CONSTRAINT financeiro_lancamentos_forma_pagamento_id_fkey
    FOREIGN KEY (forma_pagamento_id) REFERENCES financeiro_formas_pagamento(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'financeiro_lancamentos_origem_id_fkey') THEN
    ALTER TABLE financeiro_lancamentos
    ADD CONSTRAINT financeiro_lancamentos_origem_id_fkey
    FOREIGN KEY (origem_id) REFERENCES financeiro_origens(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'financeiro_lancamentos_fornecedor_id_fkey') THEN
    ALTER TABLE financeiro_lancamentos
    ADD CONSTRAINT financeiro_lancamentos_fornecedor_id_fkey
    FOREIGN KEY (fornecedor_id) REFERENCES financeiro_fornecedores(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'financeiro_lancamentos_tratamento_id_fkey') THEN
    ALTER TABLE financeiro_lancamentos
    ADD CONSTRAINT financeiro_lancamentos_tratamento_id_fkey
    FOREIGN KEY (tratamento_id) REFERENCES financeiro_tratamentos(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Foreign keys para estoque_compras
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'estoque_compras_fornecedor_id_fkey') THEN
    ALTER TABLE estoque_compras
    ADD CONSTRAINT estoque_compras_fornecedor_id_fkey
    FOREIGN KEY (fornecedor_id) REFERENCES financeiro_fornecedores(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'estoque_compras_forma_pagamento_id_fkey') THEN
    ALTER TABLE estoque_compras
    ADD CONSTRAINT estoque_compras_forma_pagamento_id_fkey
    FOREIGN KEY (forma_pagamento_id) REFERENCES financeiro_formas_pagamento(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'estoque_compras_conta_financeira_id_fkey') THEN
    ALTER TABLE estoque_compras
    ADD CONSTRAINT estoque_compras_conta_financeira_id_fkey
    FOREIGN KEY (conta_financeira_id) REFERENCES financeiro_contas(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Foreign keys para estoque_compras_itens
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'estoque_compras_itens_compra_id_fkey') THEN
    ALTER TABLE estoque_compras_itens
    ADD CONSTRAINT estoque_compras_itens_compra_id_fkey
    FOREIGN KEY (compra_id) REFERENCES estoque_compras(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'estoque_compras_itens_produto_id_fkey') THEN
    ALTER TABLE estoque_compras_itens
    ADD CONSTRAINT estoque_compras_itens_produto_id_fkey
    FOREIGN KEY (produto_id) REFERENCES estoque_produtos(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Foreign keys para estoque_movimentacoes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'estoque_movimentacoes_produto_id_fkey') THEN
    ALTER TABLE estoque_movimentacoes
    ADD CONSTRAINT estoque_movimentacoes_produto_id_fkey
    FOREIGN KEY (produto_id) REFERENCES estoque_produtos(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'estoque_movimentacoes_compra_id_fkey') THEN
    ALTER TABLE estoque_movimentacoes
    ADD CONSTRAINT estoque_movimentacoes_compra_id_fkey
    FOREIGN KEY (compra_id) REFERENCES estoque_compras(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'estoque_movimentacoes_lancamento_id_fkey') THEN
    ALTER TABLE estoque_movimentacoes
    ADD CONSTRAINT estoque_movimentacoes_lancamento_id_fkey
    FOREIGN KEY (lancamento_id) REFERENCES financeiro_lancamentos(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Foreign keys para estoque_produtos
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'estoque_produtos_fornecedor_id_fkey') THEN
    ALTER TABLE estoque_produtos
    ADD CONSTRAINT estoque_produtos_fornecedor_id_fkey
    FOREIGN KEY (fornecedor_id) REFERENCES financeiro_fornecedores(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Foreign keys para financeiro_contas_pagar
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'financeiro_contas_pagar_fornecedor_id_fkey') THEN
    ALTER TABLE financeiro_contas_pagar
    ADD CONSTRAINT financeiro_contas_pagar_fornecedor_id_fkey
    FOREIGN KEY (fornecedor_id) REFERENCES financeiro_fornecedores(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'financeiro_contas_pagar_categoria_id_fkey') THEN
    ALTER TABLE financeiro_contas_pagar
    ADD CONSTRAINT financeiro_contas_pagar_categoria_id_fkey
    FOREIGN KEY (categoria_id) REFERENCES financeiro_categorias(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'financeiro_contas_pagar_forma_pagamento_id_fkey') THEN
    ALTER TABLE financeiro_contas_pagar
    ADD CONSTRAINT financeiro_contas_pagar_forma_pagamento_id_fkey
    FOREIGN KEY (forma_pagamento_id) REFERENCES financeiro_formas_pagamento(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'financeiro_contas_pagar_conta_id_fkey') THEN
    ALTER TABLE financeiro_contas_pagar
    ADD CONSTRAINT financeiro_contas_pagar_conta_id_fkey
    FOREIGN KEY (conta_id) REFERENCES financeiro_contas(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Foreign keys para tratamentos_ficha_tecnica
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tratamentos_ficha_tecnica_tratamento_id_fkey') THEN
    ALTER TABLE tratamentos_ficha_tecnica
    ADD CONSTRAINT tratamentos_ficha_tecnica_tratamento_id_fkey
    FOREIGN KEY (tratamento_id) REFERENCES financeiro_tratamentos(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tratamentos_ficha_tecnica_produto_id_fkey') THEN
    ALTER TABLE tratamentos_ficha_tecnica
    ADD CONSTRAINT tratamentos_ficha_tecnica_produto_id_fkey
    FOREIGN KEY (produto_id) REFERENCES estoque_produtos(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Foreign keys para chat_messages
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chat_messages_conversation_id_fkey') THEN
    ALTER TABLE chat_messages
    ADD CONSTRAINT chat_messages_conversation_id_fkey
    FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Foreign keys para CRM (activities, appointments, opportunities)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'activities_lead_id_fkey') THEN
    ALTER TABLE activities
    ADD CONSTRAINT activities_lead_id_fkey
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'activities_opportunity_id_fkey') THEN
    ALTER TABLE activities
    ADD CONSTRAINT activities_opportunity_id_fkey
    FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointments_lead_id_fkey') THEN
    ALTER TABLE appointments
    ADD CONSTRAINT appointments_lead_id_fkey
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointments_opportunity_id_fkey') THEN
    ALTER TABLE appointments
    ADD CONSTRAINT appointments_opportunity_id_fkey
    FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'opportunities_lead_id_fkey') THEN
    ALTER TABLE opportunities
    ADD CONSTRAINT opportunities_lead_id_fkey
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL;
  END IF;
END $$;

-- =============================================
-- FASE 3: CRIAR TRIGGERS PARA AUTOMAÇÃO
-- =============================================

-- Trigger para atualizar saldo da conta quando lançamento for marcado como pago
CREATE OR REPLACE FUNCTION public.atualizar_saldo_apos_lancamento()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o lançamento foi pago
  IF NEW.status = 'pago' AND (OLD.status IS NULL OR OLD.status != 'pago') THEN
    -- Atualiza a conta financeira
    IF NEW.conta_financeira_id IS NOT NULL THEN
      IF NEW.tipo = 'receita' THEN
        UPDATE financeiro_contas 
        SET saldo_atual = saldo_atual + COALESCE(NEW.valor_entrada, NEW.valor, 0)
        WHERE id = NEW.conta_financeira_id;
      ELSIF NEW.tipo = 'despesa' THEN
        UPDATE financeiro_contas 
        SET saldo_atual = saldo_atual - COALESCE(NEW.valor_saida, NEW.valor, 0)
        WHERE id = NEW.conta_financeira_id;
      END IF;
    ELSIF NEW.conta_id IS NOT NULL THEN
      IF NEW.tipo = 'receita' THEN
        UPDATE financeiro_contas 
        SET saldo_atual = saldo_atual + COALESCE(NEW.valor_entrada, NEW.valor, 0)
        WHERE id = NEW.conta_id;
      ELSIF NEW.tipo = 'despesa' THEN
        UPDATE financeiro_contas 
        SET saldo_atual = saldo_atual - COALESCE(NEW.valor_saida, NEW.valor, 0)
        WHERE id = NEW.conta_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS trigger_atualizar_saldo_lancamento ON financeiro_lancamentos;
CREATE TRIGGER trigger_atualizar_saldo_lancamento
  AFTER INSERT OR UPDATE ON financeiro_lancamentos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_saldo_apos_lancamento();

-- Trigger para calcular custo e margem automaticamente
CREATE OR REPLACE FUNCTION public.calcular_custo_margem_lancamento()
RETURNS TRIGGER AS $$
DECLARE
  v_custo NUMERIC := 0;
BEGIN
  -- Só calcular para receitas com tratamento
  IF NEW.tipo = 'receita' AND NEW.tratamento_id IS NOT NULL THEN
    -- Buscar custo estimado do tratamento
    SELECT COALESCE(custo_estimado, 0) INTO v_custo
    FROM financeiro_tratamentos
    WHERE id = NEW.tratamento_id;
    
    -- Calcular custo e margem
    NEW.custo_tratamento := v_custo * COALESCE(NEW.quantidade, 1);
    NEW.margem := COALESCE(NEW.valor_entrada, NEW.valor, 0) - NEW.custo_tratamento;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trigger_calcular_custo_margem ON financeiro_lancamentos;
CREATE TRIGGER trigger_calcular_custo_margem
  BEFORE INSERT OR UPDATE ON financeiro_lancamentos
  FOR EACH ROW
  EXECUTE FUNCTION calcular_custo_margem_lancamento();

-- Trigger para atualizar estoque quando houver movimentação
CREATE OR REPLACE FUNCTION public.atualizar_estoque_apos_movimentacao()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tipo = 'entrada' THEN
    UPDATE estoque_produtos 
    SET estoque_atual = estoque_atual + NEW.quantidade
    WHERE id = NEW.produto_id;
  ELSIF NEW.tipo = 'saida' THEN
    UPDATE estoque_produtos 
    SET estoque_atual = estoque_atual - NEW.quantidade
    WHERE id = NEW.produto_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_atualizar_estoque ON estoque_movimentacoes;
CREATE TRIGGER trigger_atualizar_estoque
  AFTER INSERT ON estoque_movimentacoes
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_estoque_apos_movimentacao();