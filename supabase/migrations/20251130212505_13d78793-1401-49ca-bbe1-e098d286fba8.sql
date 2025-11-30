-- Relax RLS policies on remaining financial tables

-- PAYABLES
DROP POLICY IF EXISTS "Users can view their own payables" ON public.financeiro_contas_pagar;
DROP POLICY IF EXISTS "Users can insert their own payables" ON public.financeiro_contas_pagar;
DROP POLICY IF EXISTS "Users can update their own payables" ON public.financeiro_contas_pagar;
DROP POLICY IF EXISTS "Users can delete their own payables" ON public.financeiro_contas_pagar;

CREATE POLICY "Payables are viewable by all users"
ON public.financeiro_contas_pagar
FOR SELECT
USING (true);

CREATE POLICY "Payables can be inserted by any user"
ON public.financeiro_contas_pagar
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Payables can be updated by any user"
ON public.financeiro_contas_pagar
FOR UPDATE
USING (true);

CREATE POLICY "Payables can be deleted by any user"
ON public.financeiro_contas_pagar
FOR DELETE
USING (true);

-- TREATMENTS
DROP POLICY IF EXISTS "Users can view their own treatments" ON public.financeiro_tratamentos;
DROP POLICY IF EXISTS "Users can insert their own treatments" ON public.financeiro_tratamentos;
DROP POLICY IF EXISTS "Users can update their own treatments" ON public.financeiro_tratamentos;
DROP POLICY IF EXISTS "Users can delete their own treatments" ON public.financeiro_tratamentos;

CREATE POLICY "Treatments are viewable by all users"
ON public.financeiro_tratamentos
FOR SELECT
USING (true);

CREATE POLICY "Treatments can be inserted by any user"
ON public.financeiro_tratamentos
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Treatments can be updated by any user"
ON public.financeiro_tratamentos
FOR UPDATE
USING (true);

CREATE POLICY "Treatments can be deleted by any user"
ON public.financeiro_tratamentos
FOR DELETE
USING (true);

-- PURCHASES
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.estoque_compras;
DROP POLICY IF EXISTS "Users can insert their own purchases" ON public.estoque_compras;
DROP POLICY IF EXISTS "Users can update their own purchases" ON public.estoque_compras;
DROP POLICY IF EXISTS "Users can delete their own purchases" ON public.estoque_compras;

CREATE POLICY "Purchases are viewable by all users"
ON public.estoque_compras
FOR SELECT
USING (true);

CREATE POLICY "Purchases can be inserted by any user"
ON public.estoque_compras
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Purchases can be updated by any user"
ON public.estoque_compras
FOR UPDATE
USING (true);

CREATE POLICY "Purchases can be deleted by any user"
ON public.estoque_compras
FOR DELETE
USING (true);