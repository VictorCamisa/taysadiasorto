-- Add origem_id and prioridade columns to crm_agendamentos
ALTER TABLE public.crm_agendamentos
ADD COLUMN IF NOT EXISTS origem_id uuid REFERENCES public.origens(id),
ADD COLUMN IF NOT EXISTS prioridade text DEFAULT 'medio',
ADD COLUMN IF NOT EXISTS data_previsao_fechamento date;

-- Create index for origem_id
CREATE INDEX IF NOT EXISTS idx_crm_agendamentos_origem ON public.crm_agendamentos(origem_id);

-- Create index for prioridade
CREATE INDEX IF NOT EXISTS idx_crm_agendamentos_prioridade ON public.crm_agendamentos(prioridade);