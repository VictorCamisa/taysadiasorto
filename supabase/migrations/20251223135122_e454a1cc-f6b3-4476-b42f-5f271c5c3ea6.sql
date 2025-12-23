-- Enum para papéis de usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'medico', 'estagiario', 'recepcionista');

-- Tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  cargo TEXT,
  especialidade TEXT,
  crm TEXT,
  foto_url TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de papéis de usuários
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Tabela de termos LGPD
CREATE TABLE public.lgpd_termos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL, -- 'privacidade', 'consentimento', 'tratamento_dados'
  conteudo TEXT NOT NULL,
  versao TEXT NOT NULL,
  vigente BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de consentimentos LGPD
CREATE TABLE public.lgpd_consentimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE NOT NULL,
  termo_id UUID REFERENCES public.lgpd_termos(id) ON DELETE CASCADE NOT NULL,
  aceito BOOLEAN NOT NULL DEFAULT false,
  ip_address TEXT,
  data_aceite TIMESTAMP WITH TIME ZONE,
  data_revogacao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de documentos legais
CREATE TABLE public.documentos_legais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL, -- 'contrato', 'termo', 'politica', 'regulatorio'
  descricao TEXT,
  arquivo_url TEXT,
  vigente BOOLEAN DEFAULT true,
  data_vigencia DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de log de auditoria
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  acao TEXT NOT NULL,
  tabela TEXT NOT NULL,
  registro_id UUID,
  dados_anteriores JSONB,
  dados_novos JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lgpd_termos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lgpd_consentimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos_legais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Função para verificar papel do usuário (security definer para evitar recursão RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Função para verificar se é admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- RLS Policies para profiles
CREATE POLICY "Profiles são visíveis para todos autenticados"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins podem inserir profiles"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()) OR id = auth.uid());

CREATE POLICY "Admins podem atualizar profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()) OR id = auth.uid());

CREATE POLICY "Admins podem deletar profiles"
ON public.profiles FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- RLS Policies para user_roles
CREATE POLICY "Admins podem ver todos os papéis"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()) OR user_id = auth.uid());

CREATE POLICY "Admins podem gerenciar papéis"
ON public.user_roles FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- RLS Policies para lgpd_termos (público para leitura)
CREATE POLICY "Termos LGPD visíveis para todos"
ON public.lgpd_termos FOR SELECT
USING (true);

CREATE POLICY "Admins podem gerenciar termos LGPD"
ON public.lgpd_termos FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- RLS Policies para lgpd_consentimentos
CREATE POLICY "Consentimentos visíveis para autenticados"
ON public.lgpd_consentimentos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Consentimentos podem ser inseridos"
ON public.lgpd_consentimentos FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins podem atualizar consentimentos"
ON public.lgpd_consentimentos FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- RLS Policies para documentos_legais
CREATE POLICY "Documentos legais visíveis para autenticados"
ON public.documentos_legais FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins podem gerenciar documentos legais"
ON public.documentos_legais FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- RLS Policies para audit_logs
CREATE POLICY "Admins podem ver logs de auditoria"
ON public.audit_logs FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Sistema pode inserir logs"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Triggers para updated_at
CREATE TRIGGER update_profiles_timestamp
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER update_lgpd_termos_timestamp
BEFORE UPDATE ON public.lgpd_termos
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER update_documentos_legais_timestamp
BEFORE UPDATE ON public.documentos_legais
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- Função para criar profile automaticamente quando usuário é criado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'nome', new.raw_user_meta_data ->> 'full_name', 'Novo Usuário'),
    new.email
  );
  RETURN new;
END;
$$;

-- Trigger para criar profile quando usuário é criado
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();