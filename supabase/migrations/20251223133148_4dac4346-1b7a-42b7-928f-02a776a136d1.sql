-- Expand allowed values for crm_agendamentos.status
ALTER TABLE public.crm_agendamentos
  DROP CONSTRAINT IF EXISTS crm_agendamentos_status_check;

ALTER TABLE public.crm_agendamentos
  ADD CONSTRAINT crm_agendamentos_status_check
  CHECK (status IN (
    'lead',
    'em_negociacao',
    'orcamento_enviado',
    'agendado',
    'confirmado',
    'realizado',
    'cancelado',
    'no_show',
    'perdido',
    'reativacao'
  ));