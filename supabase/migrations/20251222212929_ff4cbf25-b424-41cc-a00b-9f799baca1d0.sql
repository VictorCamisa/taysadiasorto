-- Fix security definer views by recreating them with SECURITY INVOKER
DROP VIEW IF EXISTS public.financeiro_categorias_sinteticas;
DROP VIEW IF EXISTS public.financeiro_categorias_dropdown;

-- Recreate views with SECURITY INVOKER (default, explicit for clarity)
CREATE VIEW public.financeiro_categorias_sinteticas 
WITH (security_invoker = true) AS
SELECT DISTINCT categoria_sintetica, tipo
FROM public.financeiro_categorias
WHERE ativa = true
ORDER BY categoria_sintetica;

CREATE VIEW public.financeiro_categorias_dropdown 
WITH (security_invoker = true) AS
SELECT 
  id,
  categoria_sintetica,
  categoria_analitica,
  tipo,
  COALESCE(categoria_analitica, categoria_sintetica) as nome_completo
FROM public.financeiro_categorias
WHERE ativa = true
ORDER BY categoria_sintetica, categoria_analitica;