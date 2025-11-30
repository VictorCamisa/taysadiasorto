-- Relax RLS policies on financeiro_lancamentos to allow full access

DROP POLICY IF EXISTS "Users can view their own transactions" ON public.financeiro_lancamentos;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.financeiro_lancamentos;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.financeiro_lancamentos;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.financeiro_lancamentos;

CREATE POLICY "Transactions are viewable by all users"
ON public.financeiro_lancamentos
FOR SELECT
USING (true);

CREATE POLICY "Transactions can be inserted by any user"
ON public.financeiro_lancamentos
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Transactions can be updated by any user"
ON public.financeiro_lancamentos
FOR UPDATE
USING (true);

CREATE POLICY "Transactions can be deleted by any user"
ON public.financeiro_lancamentos
FOR DELETE
USING (true);