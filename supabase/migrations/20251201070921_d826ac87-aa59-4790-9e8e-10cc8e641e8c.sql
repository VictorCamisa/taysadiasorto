
-- Função para recalcular saldo de uma conta baseado nos lançamentos
CREATE OR REPLACE FUNCTION public.recalcular_saldo_conta(conta_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_saldo_inicial numeric;
  v_total_entradas numeric;
  v_total_saidas numeric;
  v_saldo_correto numeric;
BEGIN
  -- Buscar saldo inicial e calcular movimentações
  SELECT 
    c.saldo_inicial,
    COALESCE(SUM(CASE WHEN l.tipo = 'receita' THEN l.valor_entrada ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN l.tipo = 'despesa' THEN l.valor_saida ELSE 0 END), 0)
  INTO v_saldo_inicial, v_total_entradas, v_total_saidas
  FROM financeiro_contas c
  LEFT JOIN financeiro_lancamentos l ON l.conta_financeira_id = c.id
  WHERE c.id = conta_id
  GROUP BY c.saldo_inicial;
  
  -- Calcular saldo correto
  v_saldo_correto := v_saldo_inicial + v_total_entradas - v_total_saidas;
  
  -- Atualizar saldo da conta
  UPDATE financeiro_contas
  SET saldo_atual = v_saldo_correto,
      updated_at = NOW()
  WHERE id = conta_id;
  
  RAISE NOTICE 'Saldo recalculado para conta %: R$ %', conta_id, v_saldo_correto;
END;
$$;

-- Recalcular saldo da conta Nubank
SELECT public.recalcular_saldo_conta('da54fd5e-4c50-4aed-9baa-be4f5aad4487');

-- Adicionar trigger para recalcular saldo ao deletar lançamentos
CREATE OR REPLACE FUNCTION public.ajustar_saldo_ao_deletar_lancamento()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se o lançamento tinha conta financeira vinculada
  IF OLD.conta_financeira_id IS NOT NULL THEN
    -- Reverter o impacto do lançamento no saldo
    IF OLD.tipo = 'receita' THEN
      UPDATE financeiro_contas
      SET saldo_atual = saldo_atual - OLD.valor_entrada,
          updated_at = NOW()
      WHERE id = OLD.conta_financeira_id;
    ELSIF OLD.tipo = 'despesa' THEN
      UPDATE financeiro_contas
      SET saldo_atual = saldo_atual + OLD.valor_saida,
          updated_at = NOW()
      WHERE id = OLD.conta_financeira_id;
    END IF;
  END IF;
  
  RETURN OLD;
END;
$$;

-- Criar trigger para ajustar saldo ao deletar
DROP TRIGGER IF EXISTS trigger_ajustar_saldo_ao_deletar ON financeiro_lancamentos;
CREATE TRIGGER trigger_ajustar_saldo_ao_deletar
  BEFORE DELETE ON financeiro_lancamentos
  FOR EACH ROW
  EXECUTE FUNCTION ajustar_saldo_ao_deletar_lancamento();
