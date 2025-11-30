-- Função para calcular custo do tratamento e margem ao salvar lançamentos de receita
CREATE OR REPLACE FUNCTION public.calcular_custo_e_margem_lancamento()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_custo_total numeric := 0;
  v_quantidade numeric := 1;
BEGIN
  -- Apenas para lançamentos de receita com tratamento vinculado
  IF NEW.tipo = 'receita' AND NEW.tratamento_id IS NOT NULL THEN
    -- Busca o custo total do tratamento cadastrado
    SELECT custo_total INTO v_custo_total
    FROM public.financeiro_tratamentos
    WHERE id = NEW.tratamento_id;

    -- Garante quantidade mínima 1
    IF NEW.quantidade IS NULL OR NEW.quantidade <= 0 THEN
      v_quantidade := 1;
    ELSE
      v_quantidade := NEW.quantidade;
    END IF;

    -- Calcula custo total do tratamento para o lançamento e margem
    NEW.custo_tratamento := COALESCE(v_custo_total, 0) * v_quantidade;
    NEW.margem := COALESCE(NEW.valor_entrada, 0) - COALESCE(NEW.custo_tratamento, 0);
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger para aplicar a função em inserts e updates
DROP TRIGGER IF EXISTS trg_calcular_custo_e_margem_lancamento ON public.financeiro_lancamentos;

CREATE TRIGGER trg_calcular_custo_e_margem_lancamento
BEFORE INSERT OR UPDATE ON public.financeiro_lancamentos
FOR EACH ROW
EXECUTE FUNCTION public.calcular_custo_e_margem_lancamento();

-- Backfill: atualizar lançamentos antigos de receita com tratamento e custo zerado
UPDATE public.financeiro_lancamentos l
SET 
  quantidade = COALESCE(l.quantidade, 1),
  custo_tratamento = t.custo_total * COALESCE(l.quantidade, 1),
  margem = COALESCE(l.valor_entrada, 0) - (t.custo_total * COALESCE(l.quantidade, 1))
FROM public.financeiro_tratamentos t
WHERE l.tipo = 'receita'
  AND l.tratamento_id IS NOT NULL
  AND l.tratamento_id = t.id
  AND (l.custo_tratamento IS NULL OR l.custo_tratamento = 0);