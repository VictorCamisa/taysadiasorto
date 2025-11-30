-- Função para calcular margens e lucro dos tratamentos
CREATE OR REPLACE FUNCTION public.calcular_margens_tratamento()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Calcular lucro por sessão
  NEW.lucro_sessao = NEW.preco_venda - NEW.custo_total;
  
  -- Calcular margem bruta (%)
  IF NEW.preco_venda > 0 THEN
    NEW.margem_bruta = ((NEW.preco_venda - NEW.custo_total) / NEW.preco_venda) * 100;
  ELSE
    NEW.margem_bruta = 0;
  END IF;
  
  -- Calcular margem de contribuição (%)
  IF NEW.preco_venda > 0 THEN
    NEW.margem_contribuicao = ((NEW.preco_venda - NEW.custo_total - NEW.custo_operacional) / NEW.preco_venda) * 100;
  ELSE
    NEW.margem_contribuicao = 0;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para calcular margens automaticamente
DROP TRIGGER IF EXISTS trigger_calcular_margens_tratamento ON public.financeiro_tratamentos;

CREATE TRIGGER trigger_calcular_margens_tratamento
  BEFORE INSERT OR UPDATE ON public.financeiro_tratamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.calcular_margens_tratamento();

-- Atualizar tratamentos existentes para calcular suas margens
UPDATE public.financeiro_tratamentos
SET preco_venda = preco_venda
WHERE margem_bruta = 0 OR margem_contribuicao = 0;