-- Criar tabela de orçamentos (períodos)
CREATE TABLE public.orcamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'ativo', 'encerrado')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de itens do orçamento
CREATE TABLE public.orcamento_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id UUID NOT NULL REFERENCES public.orcamentos(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
  tratamento_id UUID REFERENCES public.tratamentos(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  valor_orcado NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamento_itens ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público (como as demais tabelas)
CREATE POLICY "Enable all access for orcamentos" ON public.orcamentos
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for orcamento_itens" ON public.orcamento_itens
FOR ALL USING (true) WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_orcamentos_updated_at
  BEFORE UPDATE ON public.orcamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER update_orcamento_itens_updated_at
  BEFORE UPDATE ON public.orcamento_itens
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_timestamp();

-- Índices para performance
CREATE INDEX idx_orcamento_itens_orcamento ON public.orcamento_itens(orcamento_id);
CREATE INDEX idx_orcamento_itens_categoria ON public.orcamento_itens(categoria_id);
CREATE INDEX idx_orcamento_itens_tratamento ON public.orcamento_itens(tratamento_id);
CREATE INDEX idx_orcamentos_status ON public.orcamentos(status);
CREATE INDEX idx_orcamentos_periodo ON public.orcamentos(periodo_inicio, periodo_fim);