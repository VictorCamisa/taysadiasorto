-- Tabela para solicitações de acesso (registros pendentes)
CREATE TABLE public.solicitacoes_acesso (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL,
    email text NOT NULL UNIQUE,
    senha_hash text NOT NULL,
    telefone text,
    status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
    motivo_rejeicao text,
    aprovado_por uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.solicitacoes_acesso ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Qualquer um pode criar uma solicitação
CREATE POLICY "Permitir criar solicitações" 
ON public.solicitacoes_acesso 
FOR INSERT 
WITH CHECK (true);

-- Apenas admins podem ver solicitações
CREATE POLICY "Admins podem ver solicitações" 
ON public.solicitacoes_acesso 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Apenas admins podem atualizar solicitações
CREATE POLICY "Admins podem atualizar solicitações" 
ON public.solicitacoes_acesso 
FOR UPDATE 
USING (is_admin(auth.uid()));

-- Apenas admins podem deletar solicitações
CREATE POLICY "Admins podem deletar solicitações" 
ON public.solicitacoes_acesso 
FOR DELETE 
USING (is_admin(auth.uid()));

-- Função para verificar se email já existe
CREATE OR REPLACE FUNCTION public.check_email_exists(check_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = check_email
    UNION
    SELECT 1 FROM public.solicitacoes_acesso WHERE email = check_email AND status = 'pendente'
  )
$$;