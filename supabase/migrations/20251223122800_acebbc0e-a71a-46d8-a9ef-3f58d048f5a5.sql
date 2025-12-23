-- Tabela de agendamentos/oportunidades de pacientes
CREATE TABLE public.crm_agendamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  tratamento_id UUID REFERENCES public.tratamentos(id) ON DELETE SET NULL,
  
  -- Status do pipeline (kanban)
  status TEXT NOT NULL DEFAULT 'lead' CHECK (status IN ('lead', 'agendado', 'confirmado', 'realizado', 'cancelado', 'no_show')),
  
  -- Dados do agendamento
  data_agendamento TIMESTAMPTZ,
  duracao_minutos INTEGER DEFAULT 60,
  
  -- Valores
  valor_previsto NUMERIC DEFAULT 0,
  valor_realizado NUMERIC DEFAULT 0,
  
  -- Observações
  observacoes TEXT,
  motivo_cancelamento TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crm_agendamentos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Enable all access for crm_agendamentos"
ON public.crm_agendamentos
FOR ALL
USING (true)
WITH CHECK (true);

-- Trigger para updated_at
CREATE TRIGGER update_crm_agendamentos_updated_at
BEFORE UPDATE ON public.crm_agendamentos
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- Índices para performance
CREATE INDEX idx_crm_agendamentos_paciente ON public.crm_agendamentos(paciente_id);
CREATE INDEX idx_crm_agendamentos_tratamento ON public.crm_agendamentos(tratamento_id);
CREATE INDEX idx_crm_agendamentos_status ON public.crm_agendamentos(status);
CREATE INDEX idx_crm_agendamentos_data ON public.crm_agendamentos(data_agendamento);