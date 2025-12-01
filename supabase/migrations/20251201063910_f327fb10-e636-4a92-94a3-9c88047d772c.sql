-- Corrigir cálculo de margem nos tratamentos
-- O problema: a função estava subtraindo custo_operacional duas vezes
-- porque custo_total JÁ inclui custo_operacional

CREATE OR REPLACE FUNCTION public.calcular_margens_tratamento()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Calcular lucro por sessão (valor absoluto em R$)
  NEW.lucro_sessao = NEW.preco_venda - NEW.custo_total;
  
  -- Calcular margem bruta (valor absoluto em R$)
  NEW.margem_bruta = NEW.preco_venda - NEW.custo_total;
  
  -- Calcular margem de contribuição (porcentagem %)
  IF NEW.preco_venda > 0 THEN
    NEW.margem_contribuicao = (NEW.margem_bruta / NEW.preco_venda) * 100;
  ELSE
    NEW.margem_contribuicao = 0;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Atualizar todos os tratamentos existentes com os cálculos corretos
UPDATE public.financeiro_tratamentos
SET preco_venda = preco_venda
WHERE id IS NOT NULL;