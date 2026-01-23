-- Criar função para atualizar updated_at (se não existir)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Tabela de definição de itens de checklist por etapa do pipeline
CREATE TABLE public.pipeline_checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  etapa VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  obrigatorio BOOLEAN NOT NULL DEFAULT true,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de progresso do checklist por agendamento/lead
CREATE TABLE public.pipeline_checklist_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agendamento_id UUID NOT NULL REFERENCES public.crm_agendamentos(id) ON DELETE CASCADE,
  checklist_item_id UUID NOT NULL REFERENCES public.pipeline_checklist_items(id) ON DELETE CASCADE,
  concluido BOOLEAN NOT NULL DEFAULT false,
  concluido_em TIMESTAMP WITH TIME ZONE,
  concluido_por UUID,
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(agendamento_id, checklist_item_id)
);

-- Índices para performance
CREATE INDEX idx_checklist_items_etapa ON public.pipeline_checklist_items(etapa) WHERE ativo = true;
CREATE INDEX idx_checklist_progress_agendamento ON public.pipeline_checklist_progress(agendamento_id);
CREATE INDEX idx_checklist_progress_item ON public.pipeline_checklist_progress(checklist_item_id);

-- Enable RLS
ALTER TABLE public.pipeline_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_checklist_progress ENABLE ROW LEVEL SECURITY;

-- Políticas para checklist_items
CREATE POLICY "Todos podem ver itens de checklist ativos"
ON public.pipeline_checklist_items
FOR SELECT
USING (true);

CREATE POLICY "Usuários autenticados podem gerenciar itens de checklist"
ON public.pipeline_checklist_items
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas para checklist_progress
CREATE POLICY "Todos podem ver progresso de checklist"
ON public.pipeline_checklist_progress
FOR SELECT
USING (true);

CREATE POLICY "Usuários autenticados podem gerenciar progresso"
ON public.pipeline_checklist_progress
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_checklist_items_updated_at
BEFORE UPDATE ON public.pipeline_checklist_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_checklist_progress_updated_at
BEFORE UPDATE ON public.pipeline_checklist_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir itens de exemplo para cada etapa
INSERT INTO public.pipeline_checklist_items (etapa, titulo, descricao, ordem, obrigatorio) VALUES
-- Lead
('lead', 'Contato inicial realizado', 'Primeiro contato com o paciente foi feito', 1, true),
('lead', 'Interesse confirmado', 'Paciente demonstrou interesse no tratamento', 2, true),
('lead', 'Dados básicos coletados', 'Nome, telefone e email cadastrados', 3, true),

-- Em Negociação
('em_negociacao', 'Necessidades mapeadas', 'Entender exatamente o que o paciente busca', 1, true),
('em_negociacao', 'Tratamento recomendado', 'Indicar o melhor tratamento para o caso', 2, true),
('em_negociacao', 'Objeções tratadas', 'Responder dúvidas e preocupações', 3, false),

-- Orçamento Enviado
('orcamento_enviado', 'Orçamento apresentado', 'Valores e condições explicados ao paciente', 1, true),
('orcamento_enviado', 'Follow-up realizado', 'Acompanhamento após envio do orçamento', 2, true),
('orcamento_enviado', 'Negociação finalizada', 'Acordo sobre valores e condições', 3, true),

-- Agendado
('agendado', 'Data confirmada', 'Paciente confirmou disponibilidade', 1, true),
('agendado', 'Orientações enviadas', 'Instruções pré-procedimento enviadas', 2, true),
('agendado', 'Lembrete agendado', 'Sistema de lembrete configurado', 3, false),

-- Confirmado
('confirmado', 'Confirmação 24h antes', 'Reconfirmar presença um dia antes', 1, true),
('confirmado', 'Pagamento confirmado', 'Pagamento ou entrada confirmada', 2, true),
('confirmado', 'Documentação pronta', 'Termos e documentos preparados', 3, true);