-- Criar ENUM para tipos de categoria
CREATE TYPE public.categoria_tipo AS ENUM ('fixa', 'variavel', 'impostos', 'estruturais', 'comissoes', 'marketing', 'servicos');

-- Criar ENUM para tipos de lançamento
CREATE TYPE public.lancamento_tipo AS ENUM ('receita', 'despesa', 'transferencia', 'ajuste');

-- Criar ENUM para status de conta a pagar
CREATE TYPE public.conta_pagar_status AS ENUM ('aberto', 'pago', 'atrasado', 'cancelado');

-- Criar ENUM para tipo de conta financeira
CREATE TYPE public.conta_financeira_tipo AS ENUM ('caixa_fisico', 'conta_bancaria', 'cartao', 'conta_socio');

-- 1. CATEGORIAS DE DESPESA
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

-- 2. FORMAS DE PAGAMENTO
CREATE TABLE public.financeiro_formas_pagamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    nome TEXT NOT NULL,
    permite_parcelamento BOOLEAN DEFAULT false,
    ativa BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ORIGEM/PROCEDÊNCIA DE RECEITA
CREATE TABLE public.financeiro_origens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    nome TEXT NOT NULL,
    ativa BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CONTAS FINANCEIRAS
CREATE TABLE public.financeiro_contas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    nome TEXT NOT NULL,
    tipo conta_financeira_tipo NOT NULL,
    saldo_inicial DECIMAL(15,2) DEFAULT 0,
    saldo_atual DECIMAL(15,2) DEFAULT 0,
    ativa BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. FORNECEDORES
CREATE TABLE public.financeiro_fornecedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    nome TEXT NOT NULL,
    cnpj_cpf TEXT,
    telefone TEXT,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. PRODUTOS DE ESTOQUE
CREATE TABLE public.estoque_produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    nome TEXT NOT NULL,
    categoria TEXT NOT NULL,
    unidade_medida TEXT NOT NULL,
    fornecedor_id UUID REFERENCES public.financeiro_fornecedores(id),
    custo_medio DECIMAL(15,2) DEFAULT 0,
    estoque_atual DECIMAL(15,3) DEFAULT 0,
    estoque_minimo DECIMAL(15,3) DEFAULT 0,
    lote TEXT,
    validade DATE,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. TRATAMENTOS
CREATE TABLE public.financeiro_tratamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    nome TEXT NOT NULL,
    grupo TEXT NOT NULL,
    preco_venda DECIMAL(15,2) NOT NULL DEFAULT 0,
    custo_total DECIMAL(15,2) DEFAULT 0,
    margem_bruta DECIMAL(15,2) DEFAULT 0,
    margem_contribuicao DECIMAL(5,2) DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. FICHA TÉCNICA DE TRATAMENTOS
CREATE TABLE public.tratamentos_ficha_tecnica (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tratamento_id UUID NOT NULL REFERENCES public.financeiro_tratamentos(id) ON DELETE CASCADE,
    produto_id UUID NOT NULL REFERENCES public.estoque_produtos(id),
    quantidade DECIMAL(15,3) NOT NULL,
    custo_unitario DECIMAL(15,2) DEFAULT 0,
    custo_total DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. COMPRAS (ENTRADA DE ESTOQUE)
CREATE TABLE public.estoque_compras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    fornecedor_id UUID REFERENCES public.financeiro_fornecedores(id),
    numero_nf TEXT,
    data_compra DATE NOT NULL,
    valor_total DECIMAL(15,2) DEFAULT 0,
    forma_pagamento_id UUID REFERENCES public.financeiro_formas_pagamento(id),
    conta_financeira_id UUID REFERENCES public.financeiro_contas(id),
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. ITENS DE COMPRA
CREATE TABLE public.estoque_compras_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    compra_id UUID NOT NULL REFERENCES public.estoque_compras(id) ON DELETE CASCADE,
    produto_id UUID NOT NULL REFERENCES public.estoque_produtos(id),
    quantidade DECIMAL(15,3) NOT NULL,
    valor_unitario DECIMAL(15,2) NOT NULL,
    valor_total DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. CONTAS A PAGAR
CREATE TABLE public.financeiro_contas_pagar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    fornecedor_id UUID REFERENCES public.financeiro_fornecedores(id),
    compra_id UUID REFERENCES public.estoque_compras(id),
    categoria_id UUID REFERENCES public.financeiro_categorias(id),
    descricao TEXT NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    vencimento DATE NOT NULL,
    forma_pagamento_id UUID REFERENCES public.financeiro_formas_pagamento(id),
    conta_financeira_id UUID REFERENCES public.financeiro_contas(id),
    status conta_pagar_status DEFAULT 'aberto',
    data_pagamento DATE,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. DIÁRIO DE CAIXA (LANÇAMENTOS)
CREATE TABLE public.financeiro_lancamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    data DATE NOT NULL,
    tipo lancamento_tipo NOT NULL,
    cliente TEXT,
    fornecedor_id UUID REFERENCES public.financeiro_fornecedores(id),
    origem_id UUID REFERENCES public.financeiro_origens(id),
    tratamento_id UUID REFERENCES public.financeiro_tratamentos(id),
    quantidade INTEGER DEFAULT 1,
    valor_entrada DECIMAL(15,2) DEFAULT 0,
    valor_saida DECIMAL(15,2) DEFAULT 0,
    forma_pagamento_id UUID REFERENCES public.financeiro_formas_pagamento(id),
    conta_financeira_id UUID REFERENCES public.financeiro_contas(id),
    categoria_id UUID REFERENCES public.financeiro_categorias(id),
    custo_tratamento DECIMAL(15,2) DEFAULT 0,
    margem DECIMAL(15,2) DEFAULT 0,
    observacoes TEXT,
    conta_pagar_id UUID REFERENCES public.financeiro_contas_pagar(id),
    conta_origem_id UUID REFERENCES public.financeiro_contas(id),
    conta_destino_id UUID REFERENCES public.financeiro_contas(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- HABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE public.financeiro_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro_formas_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro_origens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro_contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro_fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro_tratamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tratamentos_ficha_tecnica ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_compras_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro_contas_pagar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro_lancamentos ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS PARA CATEGORIAS
CREATE POLICY "Users can view their own categories" ON public.financeiro_categorias FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own categories" ON public.financeiro_categorias FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own categories" ON public.financeiro_categorias FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own categories" ON public.financeiro_categorias FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS RLS PARA FORMAS DE PAGAMENTO
CREATE POLICY "Users can view their own payment methods" ON public.financeiro_formas_pagamento FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own payment methods" ON public.financeiro_formas_pagamento FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own payment methods" ON public.financeiro_formas_pagamento FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own payment methods" ON public.financeiro_formas_pagamento FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS RLS PARA ORIGENS
CREATE POLICY "Users can view their own origins" ON public.financeiro_origens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own origins" ON public.financeiro_origens FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own origins" ON public.financeiro_origens FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own origins" ON public.financeiro_origens FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS RLS PARA CONTAS FINANCEIRAS
CREATE POLICY "Users can view their own accounts" ON public.financeiro_contas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own accounts" ON public.financeiro_contas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own accounts" ON public.financeiro_contas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own accounts" ON public.financeiro_contas FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS RLS PARA FORNECEDORES
CREATE POLICY "Users can view their own suppliers" ON public.financeiro_fornecedores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own suppliers" ON public.financeiro_fornecedores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own suppliers" ON public.financeiro_fornecedores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own suppliers" ON public.financeiro_fornecedores FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS RLS PARA PRODUTOS
CREATE POLICY "Users can view their own products" ON public.estoque_produtos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own products" ON public.estoque_produtos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own products" ON public.estoque_produtos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own products" ON public.estoque_produtos FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS RLS PARA TRATAMENTOS
CREATE POLICY "Users can view their own treatments" ON public.financeiro_tratamentos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own treatments" ON public.financeiro_tratamentos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own treatments" ON public.financeiro_tratamentos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own treatments" ON public.financeiro_tratamentos FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS RLS PARA FICHA TÉCNICA
CREATE POLICY "Users can view treatment items" ON public.tratamentos_ficha_tecnica FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.financeiro_tratamentos WHERE id = tratamento_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert treatment items" ON public.tratamentos_ficha_tecnica FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.financeiro_tratamentos WHERE id = tratamento_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update treatment items" ON public.tratamentos_ficha_tecnica FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.financeiro_tratamentos WHERE id = tratamento_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete treatment items" ON public.tratamentos_ficha_tecnica FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.financeiro_tratamentos WHERE id = tratamento_id AND user_id = auth.uid())
);

-- POLÍTICAS RLS PARA COMPRAS
CREATE POLICY "Users can view their own purchases" ON public.estoque_compras FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own purchases" ON public.estoque_compras FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own purchases" ON public.estoque_compras FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own purchases" ON public.estoque_compras FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS RLS PARA ITENS DE COMPRA
CREATE POLICY "Users can view purchase items" ON public.estoque_compras_itens FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.estoque_compras WHERE id = compra_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert purchase items" ON public.estoque_compras_itens FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.estoque_compras WHERE id = compra_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update purchase items" ON public.estoque_compras_itens FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.estoque_compras WHERE id = compra_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete purchase items" ON public.estoque_compras_itens FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.estoque_compras WHERE id = compra_id AND user_id = auth.uid())
);

-- POLÍTICAS RLS PARA CONTAS A PAGAR
CREATE POLICY "Users can view their own payables" ON public.financeiro_contas_pagar FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own payables" ON public.financeiro_contas_pagar FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own payables" ON public.financeiro_contas_pagar FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own payables" ON public.financeiro_contas_pagar FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS RLS PARA LANÇAMENTOS
CREATE POLICY "Users can view their own transactions" ON public.financeiro_lancamentos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON public.financeiro_lancamentos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.financeiro_lancamentos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON public.financeiro_lancamentos FOR DELETE USING (auth.uid() = user_id);

-- TRIGGER PARA ATUALIZAR updated_at
CREATE TRIGGER update_financeiro_categorias_updated_at BEFORE UPDATE ON public.financeiro_categorias
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financeiro_formas_pagamento_updated_at BEFORE UPDATE ON public.financeiro_formas_pagamento
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financeiro_origens_updated_at BEFORE UPDATE ON public.financeiro_origens
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financeiro_contas_updated_at BEFORE UPDATE ON public.financeiro_contas
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financeiro_fornecedores_updated_at BEFORE UPDATE ON public.financeiro_fornecedores
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_estoque_produtos_updated_at BEFORE UPDATE ON public.estoque_produtos
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financeiro_tratamentos_updated_at BEFORE UPDATE ON public.financeiro_tratamentos
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tratamentos_ficha_tecnica_updated_at BEFORE UPDATE ON public.tratamentos_ficha_tecnica
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_estoque_compras_updated_at BEFORE UPDATE ON public.estoque_compras
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financeiro_contas_pagar_updated_at BEFORE UPDATE ON public.financeiro_contas_pagar
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financeiro_lancamentos_updated_at BEFORE UPDATE ON public.financeiro_lancamentos
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();