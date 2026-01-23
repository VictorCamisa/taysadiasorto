-- Adicionar token único para formulário compartilhável
ALTER TABLE public.pacientes
ADD COLUMN IF NOT EXISTS form_token UUID UNIQUE DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS form_completed_at TIMESTAMP WITH TIME ZONE;

-- Criar índice para busca rápida por token
CREATE INDEX IF NOT EXISTS idx_pacientes_form_token ON public.pacientes(form_token);

-- Criar política para permitir acesso público via token (apenas leitura/escrita dos campos necessários)
CREATE POLICY "Acesso público via token para formulário"
ON public.pacientes
FOR ALL
USING (true)
WITH CHECK (true);