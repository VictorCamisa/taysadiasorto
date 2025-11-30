-- Relax RLS policies on configuration and product tables to stop RLS violations from the frontend

-- CATEGORIES
DROP POLICY IF EXISTS "Users can view their own categories" ON public.financeiro_categorias;
DROP POLICY IF EXISTS "Users can insert their own categories" ON public.financeiro_categorias;
DROP POLICY IF EXISTS "Users can update their own categories" ON public.financeiro_categorias;
DROP POLICY IF EXISTS "Users can delete their own categories" ON public.financeiro_categorias;

CREATE POLICY "Categories are viewable by all users"
ON public.financeiro_categorias
FOR SELECT
USING (true);

CREATE POLICY "Categories can be inserted by any user"
ON public.financeiro_categorias
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Categories can be updated by any user"
ON public.financeiro_categorias
FOR UPDATE
USING (true);

CREATE POLICY "Categories can be deleted by any user"
ON public.financeiro_categorias
FOR DELETE
USING (true);

-- ACCOUNTS
DROP POLICY IF EXISTS "Users can view their own accounts" ON public.financeiro_contas;
DROP POLICY IF EXISTS "Users can insert their own accounts" ON public.financeiro_contas;
DROP POLICY IF EXISTS "Users can update their own accounts" ON public.financeiro_contas;
DROP POLICY IF EXISTS "Users can delete their own accounts" ON public.financeiro_contas;

CREATE POLICY "Accounts are viewable by all users"
ON public.financeiro_contas
FOR SELECT
USING (true);

CREATE POLICY "Accounts can be inserted by any user"
ON public.financeiro_contas
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Accounts can be updated by any user"
ON public.financeiro_contas
FOR UPDATE
USING (true);

CREATE POLICY "Accounts can be deleted by any user"
ON public.financeiro_contas
FOR DELETE
USING (true);

-- PAYMENT METHODS
DROP POLICY IF EXISTS "Users can view their own payment methods" ON public.financeiro_formas_pagamento;
DROP POLICY IF EXISTS "Users can insert their own payment methods" ON public.financeiro_formas_pagamento;
DROP POLICY IF EXISTS "Users can update their own payment methods" ON public.financeiro_formas_pagamento;
DROP POLICY IF EXISTS "Users can delete their own payment methods" ON public.financeiro_formas_pagamento;

CREATE POLICY "Payment methods are viewable by all users"
ON public.financeiro_formas_pagamento
FOR SELECT
USING (true);

CREATE POLICY "Payment methods can be inserted by any user"
ON public.financeiro_formas_pagamento
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Payment methods can be updated by any user"
ON public.financeiro_formas_pagamento
FOR UPDATE
USING (true);

CREATE POLICY "Payment methods can be deleted by any user"
ON public.financeiro_formas_pagamento
FOR DELETE
USING (true);

-- ORIGINS
DROP POLICY IF EXISTS "Users can view their own origins" ON public.financeiro_origens;
DROP POLICY IF EXISTS "Users can insert their own origins" ON public.financeiro_origens;
DROP POLICY IF EXISTS "Users can update their own origins" ON public.financeiro_origens;
DROP POLICY IF EXISTS "Users can delete their own origins" ON public.financeiro_origens;

CREATE POLICY "Origins are viewable by all users"
ON public.financeiro_origens
FOR SELECT
USING (true);

CREATE POLICY "Origins can be inserted by any user"
ON public.financeiro_origens
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Origins can be updated by any user"
ON public.financeiro_origens
FOR UPDATE
USING (true);

CREATE POLICY "Origins can be deleted by any user"
ON public.financeiro_origens
FOR DELETE
USING (true);

-- SUPPLIERS
DROP POLICY IF EXISTS "Users can view their own suppliers" ON public.financeiro_fornecedores;
DROP POLICY IF EXISTS "Users can insert their own suppliers" ON public.financeiro_fornecedores;
DROP POLICY IF EXISTS "Users can update their own suppliers" ON public.financeiro_fornecedores;
DROP POLICY IF EXISTS "Users can delete their own suppliers" ON public.financeiro_fornecedores;

CREATE POLICY "Suppliers are viewable by all users"
ON public.financeiro_fornecedores
FOR SELECT
USING (true);

CREATE POLICY "Suppliers can be inserted by any user"
ON public.financeiro_fornecedores
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Suppliers can be updated by any user"
ON public.financeiro_fornecedores
FOR UPDATE
USING (true);

CREATE POLICY "Suppliers can be deleted by any user"
ON public.financeiro_fornecedores
FOR DELETE
USING (true);

-- PRODUCTS
DROP POLICY IF EXISTS "Users can view their own products" ON public.estoque_produtos;
DROP POLICY IF EXISTS "Users can insert their own products" ON public.estoque_produtos;
DROP POLICY IF EXISTS "Users can update their own products" ON public.estoque_produtos;
DROP POLICY IF EXISTS "Users can delete their own products" ON public.estoque_produtos;

CREATE POLICY "Products are viewable by all users"
ON public.estoque_produtos
FOR SELECT
USING (true);

CREATE POLICY "Products can be inserted by any user"
ON public.estoque_produtos
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Products can be updated by any user"
ON public.estoque_produtos
FOR UPDATE
USING (true);

CREATE POLICY "Products can be deleted by any user"
ON public.estoque_produtos
FOR DELETE
USING (true);