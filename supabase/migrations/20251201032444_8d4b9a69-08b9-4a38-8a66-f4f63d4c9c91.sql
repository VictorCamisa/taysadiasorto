-- Criar tabela de movimentações de estoque
CREATE TABLE IF NOT EXISTS public.estoque_movimentacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  produto_id uuid NOT NULL REFERENCES public.estoque_produtos(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('entrada', 'saida', 'ajuste')),
  quantidade numeric NOT NULL,
  data date NOT NULL DEFAULT CURRENT_DATE,
  origem text NOT NULL CHECK (origem IN ('compra', 'venda', 'ajuste_manual')),
  lancamento_id uuid REFERENCES public.financeiro_lancamentos(id) ON DELETE SET NULL,
  compra_id uuid REFERENCES public.estoque_compras(id) ON DELETE SET NULL,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS policies para estoque_movimentacoes
ALTER TABLE public.estoque_movimentacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Movements are viewable by all users"
  ON public.estoque_movimentacoes FOR SELECT
  USING (true);

CREATE POLICY "Movements can be inserted by any user"
  ON public.estoque_movimentacoes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Movements can be updated by any user"
  ON public.estoque_movimentacoes FOR UPDATE
  USING (true);

CREATE POLICY "Movements can be deleted by any user"
  ON public.estoque_movimentacoes FOR DELETE
  USING (true);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_movimentacoes_produto ON public.estoque_movimentacoes(produto_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_lancamento ON public.estoque_movimentacoes(lancamento_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_data ON public.estoque_movimentacoes(data);

-- Função para dar baixa no estoque quando houver venda com tratamento
CREATE OR REPLACE FUNCTION public.processar_baixa_estoque_por_tratamento()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_item RECORD;
  v_quantidade_lancamento numeric := 1;
BEGIN
  -- Apenas para lançamentos de receita com tratamento vinculado
  IF NEW.tipo = 'receita' AND NEW.tratamento_id IS NOT NULL THEN
    
    -- Pega a quantidade do lançamento (padrão 1)
    v_quantidade_lancamento := COALESCE(NEW.quantidade, 1);
    
    -- Para cada item da ficha técnica do tratamento
    FOR v_item IN 
      SELECT produto_id, quantidade, custo_unitario
      FROM public.tratamentos_ficha_tecnica
      WHERE tratamento_id = NEW.tratamento_id
    LOOP
      -- Calcula quantidade total a ser baixada
      DECLARE
        v_qtd_baixa numeric := v_item.quantidade * v_quantidade_lancamento;
      BEGIN
        -- Atualiza o estoque do produto
        UPDATE public.estoque_produtos
        SET estoque_atual = estoque_atual - v_qtd_baixa,
            updated_at = now()
        WHERE id = v_item.produto_id;
        
        -- Registra a movimentação de saída
        INSERT INTO public.estoque_movimentacoes (
          user_id,
          produto_id,
          tipo,
          quantidade,
          data,
          origem,
          lancamento_id,
          observacoes
        ) VALUES (
          NEW.user_id,
          v_item.produto_id,
          'saida',
          v_qtd_baixa,
          NEW.data,
          'venda',
          NEW.id,
          'Baixa automática - Venda de tratamento'
        );
      END;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para processar baixa após inserir lançamento
DROP TRIGGER IF EXISTS trg_processar_baixa_estoque ON public.financeiro_lancamentos;

CREATE TRIGGER trg_processar_baixa_estoque
AFTER INSERT ON public.financeiro_lancamentos
FOR EACH ROW
EXECUTE FUNCTION public.processar_baixa_estoque_por_tratamento();

-- Registrar movimentações históricas de compras já existentes
INSERT INTO public.estoque_movimentacoes (
  user_id,
  produto_id,
  tipo,
  quantidade,
  data,
  origem,
  compra_id,
  observacoes
)
SELECT 
  c.user_id,
  ci.produto_id,
  'entrada' as tipo,
  ci.quantidade,
  c.data_compra as data,
  'compra' as origem,
  c.id as compra_id,
  'Movimentação histórica importada' as observacoes
FROM public.estoque_compras c
INNER JOIN public.estoque_compras_itens ci ON ci.compra_id = c.id
WHERE NOT EXISTS (
  SELECT 1 FROM public.estoque_movimentacoes m 
  WHERE m.compra_id = c.id AND m.produto_id = ci.produto_id
);