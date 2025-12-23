-- 1. Adicionar campo natureza_dre à tabela categorias
ALTER TABLE public.categorias 
ADD COLUMN IF NOT EXISTS natureza_dre TEXT DEFAULT 'opex';

-- Atualizar categorias de receita para usar 'receita'
UPDATE public.categorias 
SET natureza_dre = 'receita' 
WHERE tipo = 'receita';

-- Atualizar algumas categorias de despesa como custo variável (material direto)
UPDATE public.categorias 
SET natureza_dre = 'custo' 
WHERE tipo = 'despesa' 
AND (
  LOWER(nome_sintetico) LIKE '%material%' 
  OR LOWER(nome_sintetico) LIKE '%insumo%'
  OR LOWER(nome_sintetico) LIKE '%produto%'
  OR LOWER(nome_analitico) LIKE '%material%'
  OR LOWER(nome_analitico) LIKE '%insumo%'
);

-- 2. Criar função para obter custo do tratamento (prioriza ficha técnica, fallback para custo_estimado)
CREATE OR REPLACE FUNCTION public.obter_custo_tratamento(p_tratamento_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_custo_ficha NUMERIC;
  v_custo_estimado NUMERIC;
BEGIN
  -- Primeiro tenta buscar da ficha técnica
  SELECT COALESCE(SUM(custo_total), 0) INTO v_custo_ficha
  FROM tratamentos_ficha_tecnica
  WHERE tratamento_id = p_tratamento_id;
  
  -- Se a ficha técnica tem custo, usa ela
  IF v_custo_ficha > 0 THEN
    RETURN v_custo_ficha;
  END IF;
  
  -- Senão, busca o custo_estimado do tratamento
  SELECT COALESCE(custo_estimado, 0) INTO v_custo_estimado
  FROM tratamentos
  WHERE id = p_tratamento_id;
  
  RETURN COALESCE(v_custo_estimado, 0);
END;
$$;

-- 3. Criar trigger para preencher custo_material automaticamente
CREATE OR REPLACE FUNCTION public.preencher_custo_material()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Se é uma receita com tratamento, calcula o custo automaticamente
  IF NEW.tipo = 'receita' AND NEW.tratamento_id IS NOT NULL THEN
    -- Se custo_material não foi informado ou é zero, calcula automaticamente
    IF NEW.custo_material IS NULL OR NEW.custo_material = 0 THEN
      NEW.custo_material := obter_custo_tratamento(NEW.tratamento_id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar o trigger
DROP TRIGGER IF EXISTS trigger_preencher_custo_material ON td_fluxo_de_caixa;
CREATE TRIGGER trigger_preencher_custo_material
  BEFORE INSERT OR UPDATE ON td_fluxo_de_caixa
  FOR EACH ROW
  EXECUTE FUNCTION preencher_custo_material();

-- 4. Backfill: atualizar lançamentos históricos com custo zerado
UPDATE td_fluxo_de_caixa
SET custo_material = obter_custo_tratamento(tratamento_id)
WHERE tipo = 'receita' 
  AND tratamento_id IS NOT NULL 
  AND (custo_material IS NULL OR custo_material = 0);

-- 5. Adicionar políticas RLS para INSERT, UPDATE e DELETE em td_fluxo_de_caixa
CREATE POLICY "Enable insert for all users" 
ON public.td_fluxo_de_caixa 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update for all users" 
ON public.td_fluxo_de_caixa 
FOR UPDATE 
USING (true);

CREATE POLICY "Enable delete for all users" 
ON public.td_fluxo_de_caixa 
FOR DELETE 
USING (true);

-- 6. Adicionar políticas RLS para as outras tabelas novas que estão sem RLS
-- categorias
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for categorias" ON public.categorias FOR ALL USING (true) WITH CHECK (true);

-- contas_financeiras
ALTER TABLE public.contas_financeiras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for contas_financeiras" ON public.contas_financeiras FOR ALL USING (true) WITH CHECK (true);

-- clientes_fornecedores
ALTER TABLE public.clientes_fornecedores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for clientes_fornecedores" ON public.clientes_fornecedores FOR ALL USING (true) WITH CHECK (true);

-- formas_pagamento
ALTER TABLE public.formas_pagamento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for formas_pagamento" ON public.formas_pagamento FOR ALL USING (true) WITH CHECK (true);

-- origens
ALTER TABLE public.origens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for origens" ON public.origens FOR ALL USING (true) WITH CHECK (true);

-- tratamentos
ALTER TABLE public.tratamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for tratamentos" ON public.tratamentos FOR ALL USING (true) WITH CHECK (true);