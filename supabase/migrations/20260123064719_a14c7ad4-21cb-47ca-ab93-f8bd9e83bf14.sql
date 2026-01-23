-- Tabela para instâncias da Evolution API
CREATE TABLE public.whatsapp_instances (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    instance_name TEXT NOT NULL UNIQUE,
    instance_id TEXT,
    status TEXT DEFAULT 'disconnected',
    qrcode TEXT,
    webhook_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para conversas do WhatsApp
CREATE TABLE public.whatsapp_conversas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    instance_id UUID REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE,
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE SET NULL,
    remote_jid TEXT NOT NULL,
    nome_contato TEXT,
    foto_url TEXT,
    ultima_mensagem TEXT,
    ultima_mensagem_at TIMESTAMP WITH TIME ZONE,
    nao_lidas INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(instance_id, remote_jid)
);

-- Tabela para mensagens do WhatsApp
CREATE TABLE public.whatsapp_mensagens (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    conversa_id UUID NOT NULL REFERENCES public.whatsapp_conversas(id) ON DELETE CASCADE,
    message_id TEXT UNIQUE,
    from_me BOOLEAN NOT NULL DEFAULT false,
    tipo TEXT DEFAULT 'text',
    conteudo TEXT,
    media_url TEXT,
    media_mimetype TEXT,
    status TEXT DEFAULT 'sent',
    timestamp_msg TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_whatsapp_conversas_instance ON public.whatsapp_conversas(instance_id);
CREATE INDEX idx_whatsapp_conversas_paciente ON public.whatsapp_conversas(paciente_id);
CREATE INDEX idx_whatsapp_conversas_remote_jid ON public.whatsapp_conversas(remote_jid);
CREATE INDEX idx_whatsapp_mensagens_conversa ON public.whatsapp_mensagens(conversa_id);
CREATE INDEX idx_whatsapp_mensagens_timestamp ON public.whatsapp_mensagens(timestamp_msg DESC);

-- Enable RLS
ALTER TABLE public.whatsapp_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_mensagens ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - usuários autenticados podem acessar
CREATE POLICY "Authenticated users can manage instances"
ON public.whatsapp_instances
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage conversations"
ON public.whatsapp_conversas
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage messages"
ON public.whatsapp_mensagens
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Trigger para updated_at
CREATE TRIGGER update_whatsapp_instances_updated_at
BEFORE UPDATE ON public.whatsapp_instances
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_whatsapp_conversas_updated_at
BEFORE UPDATE ON public.whatsapp_conversas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();