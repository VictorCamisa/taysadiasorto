-- Adicionar novos campos na tabela crm_agendamentos
ALTER TABLE crm_agendamentos 
ADD COLUMN IF NOT EXISTS data_ultimo_contato TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS proxima_acao TEXT,
ADD COLUMN IF NOT EXISTS data_proxima_acao DATE,
ADD COLUMN IF NOT EXISTS responsavel TEXT;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_crm_agendamentos_status ON crm_agendamentos(status);
CREATE INDEX IF NOT EXISTS idx_crm_agendamentos_prioridade ON crm_agendamentos(prioridade);
CREATE INDEX IF NOT EXISTS idx_crm_agendamentos_origem ON crm_agendamentos(origem_id);
CREATE INDEX IF NOT EXISTS idx_crm_agendamentos_data_proxima_acao ON crm_agendamentos(data_proxima_acao);

-- Criar tabela de interações/histórico de contatos
CREATE TABLE IF NOT EXISTS crm_interacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id UUID NOT NULL REFERENCES crm_agendamentos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- 'whatsapp', 'ligacao', 'email', 'reuniao', 'nota'
  observacao TEXT,
  data_contato TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela de interações
ALTER TABLE crm_interacoes ENABLE ROW LEVEL SECURITY;

-- Política de acesso público (mesma das outras tabelas)
CREATE POLICY "Enable all access for crm_interacoes" ON crm_interacoes
FOR ALL USING (true) WITH CHECK (true);

-- Índices para a tabela de interações
CREATE INDEX IF NOT EXISTS idx_crm_interacoes_agendamento ON crm_interacoes(agendamento_id);
CREATE INDEX IF NOT EXISTS idx_crm_interacoes_tipo ON crm_interacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_crm_interacoes_data ON crm_interacoes(data_contato);