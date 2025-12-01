-- Criar categoria "Despesa de Venda" se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM financeiro_categorias 
    WHERE categoria_sintetica = 'Despesa de Venda' 
    AND tipo = 'variavel'
  ) THEN
    INSERT INTO financeiro_categorias (
      categoria_sintetica,
      tipo,
      ativa,
      user_id
    )
    SELECT 
      'Despesa de Venda',
      'variavel',
      true,
      user_id
    FROM financeiro_categorias
    LIMIT 1;
  END IF;
END $$;

-- Criar função para lançar despesa automaticamente ao registrar receita com tratamento
CREATE OR REPLACE FUNCTION public.criar_despesa_custo_tratamento()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_categoria_id uuid;
BEGIN
  -- Apenas para lançamentos de receita com tratamento vinculado e custo > 0
  IF NEW.tipo = 'receita' AND NEW.tratamento_id IS NOT NULL AND COALESCE(NEW.custo_tratamento, 0) > 0 THEN
    
    -- Buscar categoria "Despesa de Venda"
    SELECT id INTO v_categoria_id
    FROM financeiro_categorias
    WHERE categoria_sintetica = 'Despesa de Venda' 
    AND tipo = 'variavel'
    AND user_id = NEW.user_id
    LIMIT 1;
    
    -- Criar lançamento de despesa automaticamente
    INSERT INTO financeiro_lancamentos (
      user_id,
      tipo,
      data,
      valor_saida,
      categoria_id,
      conta_financeira_id,
      observacoes,
      cliente,
      tratamento_id
    ) VALUES (
      NEW.user_id,
      'despesa',
      NEW.data,
      NEW.custo_tratamento,
      v_categoria_id,
      NEW.conta_financeira_id,
      CONCAT('Custo automático do tratamento - Cliente: ', COALESCE(NEW.cliente, 'N/A')),
      NEW.cliente,
      NEW.tratamento_id
    );
    
    -- Atualizar saldo da conta financeira (se especificada)
    IF NEW.conta_financeira_id IS NOT NULL THEN
      UPDATE financeiro_contas
      SET saldo_atual = saldo_atual - NEW.custo_tratamento,
          updated_at = NOW()
      WHERE id = NEW.conta_financeira_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para executar após inserir receita
DROP TRIGGER IF EXISTS trigger_criar_despesa_custo_tratamento ON financeiro_lancamentos;

CREATE TRIGGER trigger_criar_despesa_custo_tratamento
  AFTER INSERT ON financeiro_lancamentos
  FOR EACH ROW
  EXECUTE FUNCTION criar_despesa_custo_tratamento();