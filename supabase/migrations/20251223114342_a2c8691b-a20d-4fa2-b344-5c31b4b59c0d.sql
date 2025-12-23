-- =============================================
-- MÓDULO CRM - TABELAS PRINCIPAIS
-- =============================================

-- Tabela de Pacientes
CREATE TABLE public.pacientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE,
  data_nascimento DATE,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  foto_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Anamneses
CREATE TABLE public.anamneses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  data_anamnese DATE NOT NULL DEFAULT CURRENT_DATE,
  queixa_principal TEXT,
  historico_medico TEXT,
  alergias TEXT,
  medicamentos_uso TEXT,
  cirurgias_anteriores TEXT,
  habitos TEXT,
  antecedentes_familiares TEXT,
  expectativas TEXT,
  contraindicacoes TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Prontuários (Registros de Atendimento)
CREATE TABLE public.prontuarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  tratamento_id UUID REFERENCES public.tratamentos(id) ON DELETE SET NULL,
  data_atendimento DATE NOT NULL DEFAULT CURRENT_DATE,
  descricao_procedimento TEXT,
  observacoes_clinicas TEXT,
  evolucao TEXT,
  fotos_antes TEXT[],
  fotos_depois TEXT[],
  proximos_passos TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

CREATE INDEX idx_pacientes_nome ON public.pacientes(nome);
CREATE INDEX idx_pacientes_cpf ON public.pacientes(cpf);
CREATE INDEX idx_pacientes_ativo ON public.pacientes(ativo);
CREATE INDEX idx_anamneses_paciente ON public.anamneses(paciente_id);
CREATE INDEX idx_anamneses_data ON public.anamneses(data_anamnese);
CREATE INDEX idx_prontuarios_paciente ON public.prontuarios(paciente_id);
CREATE INDEX idx_prontuarios_data ON public.prontuarios(data_atendimento);
CREATE INDEX idx_prontuarios_tratamento ON public.prontuarios(tratamento_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anamneses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prontuarios ENABLE ROW LEVEL SECURITY;

-- Políticas para pacientes (acesso público por enquanto, será restrito na Fase 3)
CREATE POLICY "Enable all access for pacientes"
ON public.pacientes FOR ALL
USING (true)
WITH CHECK (true);

-- Políticas para anamneses
CREATE POLICY "Enable all access for anamneses"
ON public.anamneses FOR ALL
USING (true)
WITH CHECK (true);

-- Políticas para prontuários
CREATE POLICY "Enable all access for prontuarios"
ON public.prontuarios FOR ALL
USING (true)
WITH CHECK (true);

-- =============================================
-- TRIGGERS PARA UPDATED_AT
-- =============================================

CREATE TRIGGER update_pacientes_updated_at
  BEFORE UPDATE ON public.pacientes
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER update_anamneses_updated_at
  BEFORE UPDATE ON public.anamneses
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER update_prontuarios_updated_at
  BEFORE UPDATE ON public.prontuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_timestamp();