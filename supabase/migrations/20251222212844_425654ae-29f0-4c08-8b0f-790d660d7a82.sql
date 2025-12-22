-- =============================================
-- ENUMS
-- =============================================
CREATE TYPE public.categoria_tipo AS ENUM ('receita', 'despesa');
CREATE TYPE public.activity_type AS ENUM ('call', 'email', 'meeting', 'note');
CREATE TYPE public.appointment_type AS ENUM ('consultation', 'procedure', 'return');
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'lost');
CREATE TYPE public.opportunity_status AS ENUM ('prospecting', 'proposal', 'negotiation', 'won', 'lost');

-- =============================================
-- MÓDULO FINANCEIRO
-- =============================================

-- Tabela: financeiro_categorias
CREATE TABLE public.financeiro_categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  categoria_sintetica TEXT NOT NULL,
  categoria_analitica TEXT,
  tipo categoria_tipo NOT NULL,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.financeiro_categorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on financeiro_categorias" ON public.financeiro_categorias FOR SELECT USING (true);
CREATE POLICY "Allow public insert on financeiro_categorias" ON public.financeiro_categorias FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on financeiro_categorias" ON public.financeiro_categorias FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on financeiro_categorias" ON public.financeiro_categorias FOR DELETE USING (true);

-- Tabela: financeiro_contas
CREATE TABLE public.financeiro_contas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'corrente',
  banco TEXT,
  agencia TEXT,
  conta TEXT,
  saldo_inicial NUMERIC DEFAULT 0,
  saldo_atual NUMERIC DEFAULT 0,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.financeiro_contas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on financeiro_contas" ON public.financeiro_contas FOR SELECT USING (true);
CREATE POLICY "Allow public insert on financeiro_contas" ON public.financeiro_contas FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on financeiro_contas" ON public.financeiro_contas FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on financeiro_contas" ON public.financeiro_contas FOR DELETE USING (true);

-- Tabela: financeiro_formas_pagamento
CREATE TABLE public.financeiro_formas_pagamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT DEFAULT 'outros',
  taxa_percentual NUMERIC DEFAULT 0,
  dias_recebimento INTEGER DEFAULT 0,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.financeiro_formas_pagamento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on financeiro_formas_pagamento" ON public.financeiro_formas_pagamento FOR SELECT USING (true);
CREATE POLICY "Allow public insert on financeiro_formas_pagamento" ON public.financeiro_formas_pagamento FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on financeiro_formas_pagamento" ON public.financeiro_formas_pagamento FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on financeiro_formas_pagamento" ON public.financeiro_formas_pagamento FOR DELETE USING (true);

-- Tabela: financeiro_origens
CREATE TABLE public.financeiro_origens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.financeiro_origens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on financeiro_origens" ON public.financeiro_origens FOR SELECT USING (true);
CREATE POLICY "Allow public insert on financeiro_origens" ON public.financeiro_origens FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on financeiro_origens" ON public.financeiro_origens FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on financeiro_origens" ON public.financeiro_origens FOR DELETE USING (true);

-- Tabela: financeiro_fornecedores
CREATE TABLE public.financeiro_fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  razao_social TEXT,
  cnpj TEXT,
  email TEXT,
  telefone TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.financeiro_fornecedores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on financeiro_fornecedores" ON public.financeiro_fornecedores FOR SELECT USING (true);
CREATE POLICY "Allow public insert on financeiro_fornecedores" ON public.financeiro_fornecedores FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on financeiro_fornecedores" ON public.financeiro_fornecedores FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on financeiro_fornecedores" ON public.financeiro_fornecedores FOR DELETE USING (true);

-- Tabela: financeiro_tratamentos
CREATE TABLE public.financeiro_tratamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  grupo TEXT,
  descricao TEXT,
  preco NUMERIC DEFAULT 0,
  custo_estimado NUMERIC DEFAULT 0,
  duracao_minutos INTEGER DEFAULT 60,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.financeiro_tratamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on financeiro_tratamentos" ON public.financeiro_tratamentos FOR SELECT USING (true);
CREATE POLICY "Allow public insert on financeiro_tratamentos" ON public.financeiro_tratamentos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on financeiro_tratamentos" ON public.financeiro_tratamentos FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on financeiro_tratamentos" ON public.financeiro_tratamentos FOR DELETE USING (true);

-- Tabela: financeiro_lancamentos
CREATE TABLE public.financeiro_lancamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  descricao TEXT,
  valor NUMERIC NOT NULL DEFAULT 0,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  data_vencimento DATE,
  data_pagamento DATE,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'cancelado')),
  categoria_id UUID REFERENCES public.financeiro_categorias(id),
  conta_id UUID REFERENCES public.financeiro_contas(id),
  forma_pagamento_id UUID REFERENCES public.financeiro_formas_pagamento(id),
  origem_id UUID REFERENCES public.financeiro_origens(id),
  fornecedor_id UUID REFERENCES public.financeiro_fornecedores(id),
  tratamento_id UUID REFERENCES public.financeiro_tratamentos(id),
  parcela_atual INTEGER,
  total_parcelas INTEGER,
  lancamento_pai_id UUID REFERENCES public.financeiro_lancamentos(id),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.financeiro_lancamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on financeiro_lancamentos" ON public.financeiro_lancamentos FOR SELECT USING (true);
CREATE POLICY "Allow public insert on financeiro_lancamentos" ON public.financeiro_lancamentos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on financeiro_lancamentos" ON public.financeiro_lancamentos FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on financeiro_lancamentos" ON public.financeiro_lancamentos FOR DELETE USING (true);

-- Tabela: financeiro_contas_pagar
CREATE TABLE public.financeiro_contas_pagar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  fornecedor_id UUID REFERENCES public.financeiro_fornecedores(id),
  categoria_id UUID REFERENCES public.financeiro_categorias(id),
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido', 'cancelado')),
  forma_pagamento_id UUID REFERENCES public.financeiro_formas_pagamento(id),
  conta_id UUID REFERENCES public.financeiro_contas(id),
  numero_documento TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.financeiro_contas_pagar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on financeiro_contas_pagar" ON public.financeiro_contas_pagar FOR SELECT USING (true);
CREATE POLICY "Allow public insert on financeiro_contas_pagar" ON public.financeiro_contas_pagar FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on financeiro_contas_pagar" ON public.financeiro_contas_pagar FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on financeiro_contas_pagar" ON public.financeiro_contas_pagar FOR DELETE USING (true);

-- =============================================
-- MÓDULO ESTOQUE
-- =============================================

-- Tabela: estoque_produtos
CREATE TABLE public.estoque_produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  unidade_medida TEXT NOT NULL DEFAULT 'un',
  estoque_atual NUMERIC DEFAULT 0,
  estoque_minimo NUMERIC DEFAULT 0,
  custo_medio NUMERIC DEFAULT 0,
  fornecedor_id UUID REFERENCES public.financeiro_fornecedores(id),
  lote TEXT,
  validade DATE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.estoque_produtos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on estoque_produtos" ON public.estoque_produtos FOR SELECT USING (true);
CREATE POLICY "Allow public insert on estoque_produtos" ON public.estoque_produtos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on estoque_produtos" ON public.estoque_produtos FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on estoque_produtos" ON public.estoque_produtos FOR DELETE USING (true);

-- Tabela: estoque_compras
CREATE TABLE public.estoque_compras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  fornecedor_id UUID REFERENCES public.financeiro_fornecedores(id),
  data_compra DATE NOT NULL DEFAULT CURRENT_DATE,
  numero_nf TEXT,
  valor_total NUMERIC DEFAULT 0,
  forma_pagamento_id UUID REFERENCES public.financeiro_formas_pagamento(id),
  conta_financeira_id UUID REFERENCES public.financeiro_contas(id),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.estoque_compras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on estoque_compras" ON public.estoque_compras FOR SELECT USING (true);
CREATE POLICY "Allow public insert on estoque_compras" ON public.estoque_compras FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on estoque_compras" ON public.estoque_compras FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on estoque_compras" ON public.estoque_compras FOR DELETE USING (true);

-- Tabela: estoque_compras_itens
CREATE TABLE public.estoque_compras_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  compra_id UUID NOT NULL REFERENCES public.estoque_compras(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.estoque_produtos(id),
  quantidade NUMERIC NOT NULL DEFAULT 1,
  valor_unitario NUMERIC NOT NULL DEFAULT 0,
  valor_total NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.estoque_compras_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on estoque_compras_itens" ON public.estoque_compras_itens FOR SELECT USING (true);
CREATE POLICY "Allow public insert on estoque_compras_itens" ON public.estoque_compras_itens FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on estoque_compras_itens" ON public.estoque_compras_itens FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on estoque_compras_itens" ON public.estoque_compras_itens FOR DELETE USING (true);

-- Tabela: estoque_movimentacoes
CREATE TABLE public.estoque_movimentacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  produto_id UUID NOT NULL REFERENCES public.estoque_produtos(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida', 'ajuste')),
  origem TEXT NOT NULL,
  quantidade NUMERIC NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  compra_id UUID REFERENCES public.estoque_compras(id),
  lancamento_id UUID REFERENCES public.financeiro_lancamentos(id),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.estoque_movimentacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on estoque_movimentacoes" ON public.estoque_movimentacoes FOR SELECT USING (true);
CREATE POLICY "Allow public insert on estoque_movimentacoes" ON public.estoque_movimentacoes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on estoque_movimentacoes" ON public.estoque_movimentacoes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on estoque_movimentacoes" ON public.estoque_movimentacoes FOR DELETE USING (true);

-- Tabela: tratamentos_ficha_tecnica
CREATE TABLE public.tratamentos_ficha_tecnica (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tratamento_id UUID NOT NULL REFERENCES public.financeiro_tratamentos(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.estoque_produtos(id),
  quantidade_utilizada NUMERIC NOT NULL DEFAULT 1,
  custo_unitario NUMERIC DEFAULT 0,
  custo_total NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.tratamentos_ficha_tecnica ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on tratamentos_ficha_tecnica" ON public.tratamentos_ficha_tecnica FOR SELECT USING (true);
CREATE POLICY "Allow public insert on tratamentos_ficha_tecnica" ON public.tratamentos_ficha_tecnica FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on tratamentos_ficha_tecnica" ON public.tratamentos_ficha_tecnica FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on tratamentos_ficha_tecnica" ON public.tratamentos_ficha_tecnica FOR DELETE USING (true);

-- =============================================
-- MÓDULO CRM
-- =============================================

-- Tabela: leads
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  source TEXT,
  status lead_status DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on leads" ON public.leads FOR SELECT USING (true);
CREATE POLICY "Allow public insert on leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on leads" ON public.leads FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on leads" ON public.leads FOR DELETE USING (true);

-- Tabela: opportunities
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lead_id UUID REFERENCES public.leads(id),
  title TEXT NOT NULL,
  value NUMERIC DEFAULT 0,
  status opportunity_status DEFAULT 'prospecting',
  expected_close_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on opportunities" ON public.opportunities FOR SELECT USING (true);
CREATE POLICY "Allow public insert on opportunities" ON public.opportunities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on opportunities" ON public.opportunities FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on opportunities" ON public.opportunities FOR DELETE USING (true);

-- Tabela: activities
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lead_id UUID REFERENCES public.leads(id),
  opportunity_id UUID REFERENCES public.opportunities(id),
  type activity_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on activities" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Allow public insert on activities" ON public.activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on activities" ON public.activities FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on activities" ON public.activities FOR DELETE USING (true);

-- Tabela: appointments
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lead_id UUID REFERENCES public.leads(id),
  opportunity_id UUID REFERENCES public.opportunities(id),
  client_name TEXT NOT NULL,
  procedure TEXT NOT NULL,
  appointment_date TIMESTAMPTZ NOT NULL,
  type appointment_type DEFAULT 'consultation',
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on appointments" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Allow public insert on appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on appointments" ON public.appointments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on appointments" ON public.appointments FOR DELETE USING (true);

-- Tabela: campaigns
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  lead_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on campaigns" ON public.campaigns FOR SELECT USING (true);
CREATE POLICY "Allow public insert on campaigns" ON public.campaigns FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on campaigns" ON public.campaigns FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on campaigns" ON public.campaigns FOR DELETE USING (true);

-- =============================================
-- MÓDULO CHAT IA
-- =============================================

-- Tabela: chat_conversations
CREATE TABLE public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on chat_conversations" ON public.chat_conversations FOR SELECT USING (true);
CREATE POLICY "Allow public insert on chat_conversations" ON public.chat_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on chat_conversations" ON public.chat_conversations FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on chat_conversations" ON public.chat_conversations FOR DELETE USING (true);

-- Tabela: chat_messages
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on chat_messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert on chat_messages" ON public.chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on chat_messages" ON public.chat_messages FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on chat_messages" ON public.chat_messages FOR DELETE USING (true);

-- =============================================
-- VIEWS
-- =============================================

-- View: financeiro_categorias_sinteticas
CREATE VIEW public.financeiro_categorias_sinteticas AS
SELECT DISTINCT categoria_sintetica, tipo
FROM public.financeiro_categorias
WHERE ativa = true
ORDER BY categoria_sintetica;

-- View: financeiro_categorias_dropdown
CREATE VIEW public.financeiro_categorias_dropdown AS
SELECT 
  id,
  categoria_sintetica,
  categoria_analitica,
  tipo,
  COALESCE(categoria_analitica, categoria_sintetica) as nome_completo
FROM public.financeiro_categorias
WHERE ativa = true
ORDER BY categoria_sintetica, categoria_analitica;

-- =============================================
-- FUNÇÕES
-- =============================================

-- Função: recalcular_saldo_conta
CREATE OR REPLACE FUNCTION public.recalcular_saldo_conta(p_conta_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_saldo_inicial NUMERIC;
  v_total_entradas NUMERIC;
  v_total_saidas NUMERIC;
  v_saldo_atual NUMERIC;
BEGIN
  -- Buscar saldo inicial
  SELECT COALESCE(saldo_inicial, 0) INTO v_saldo_inicial
  FROM financeiro_contas WHERE id = p_conta_id;
  
  -- Calcular entradas (receitas pagas)
  SELECT COALESCE(SUM(valor), 0) INTO v_total_entradas
  FROM financeiro_lancamentos
  WHERE conta_id = p_conta_id 
    AND tipo = 'receita' 
    AND status = 'pago';
  
  -- Calcular saídas (despesas pagas)
  SELECT COALESCE(SUM(valor), 0) INTO v_total_saidas
  FROM financeiro_lancamentos
  WHERE conta_id = p_conta_id 
    AND tipo = 'despesa' 
    AND status = 'pago';
  
  -- Calcular saldo atual
  v_saldo_atual := v_saldo_inicial + v_total_entradas - v_total_saidas;
  
  -- Atualizar saldo na conta
  UPDATE financeiro_contas 
  SET saldo_atual = v_saldo_atual, updated_at = now()
  WHERE id = p_conta_id;
  
  RETURN v_saldo_atual;
END;
$$;

-- =============================================
-- TRIGGERS para updated_at
-- =============================================

CREATE TRIGGER update_financeiro_categorias_updated_at BEFORE UPDATE ON public.financeiro_categorias FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();
CREATE TRIGGER update_financeiro_contas_updated_at BEFORE UPDATE ON public.financeiro_contas FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();
CREATE TRIGGER update_financeiro_formas_pagamento_updated_at BEFORE UPDATE ON public.financeiro_formas_pagamento FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();
CREATE TRIGGER update_financeiro_origens_updated_at BEFORE UPDATE ON public.financeiro_origens FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();
CREATE TRIGGER update_financeiro_fornecedores_updated_at BEFORE UPDATE ON public.financeiro_fornecedores FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();
CREATE TRIGGER update_financeiro_tratamentos_updated_at BEFORE UPDATE ON public.financeiro_tratamentos FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();
CREATE TRIGGER update_financeiro_lancamentos_updated_at BEFORE UPDATE ON public.financeiro_lancamentos FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();
CREATE TRIGGER update_financeiro_contas_pagar_updated_at BEFORE UPDATE ON public.financeiro_contas_pagar FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();
CREATE TRIGGER update_estoque_produtos_updated_at BEFORE UPDATE ON public.estoque_produtos FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();
CREATE TRIGGER update_estoque_compras_updated_at BEFORE UPDATE ON public.estoque_compras FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();
CREATE TRIGGER update_estoque_movimentacoes_updated_at BEFORE UPDATE ON public.estoque_movimentacoes FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();
CREATE TRIGGER update_tratamentos_ficha_tecnica_updated_at BEFORE UPDATE ON public.tratamentos_ficha_tecnica FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON public.opportunities FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();
CREATE TRIGGER update_chat_conversations_updated_at BEFORE UPDATE ON public.chat_conversations FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();