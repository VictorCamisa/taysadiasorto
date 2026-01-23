-- =============================================
-- AI AGENTS PLATFORM - Complete Schema
-- =============================================

-- Enable vector extension for RAG/embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Table: AI Agents
CREATE TABLE public.ai_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  system_prompt TEXT NOT NULL DEFAULT 'Você é um assistente útil e profissional.',
  model TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  temperature NUMERIC(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 4096,
  
  -- Memory settings
  memory_enabled BOOLEAN DEFAULT true,
  memory_window INTEGER DEFAULT 20, -- last N messages to include
  
  -- RAG settings
  rag_enabled BOOLEAN DEFAULT false,
  rag_similarity_threshold NUMERIC(3,2) DEFAULT 0.7,
  rag_max_results INTEGER DEFAULT 5,
  
  -- Database connection settings
  db_connection_enabled BOOLEAN DEFAULT false,
  db_tables_access TEXT[] DEFAULT '{}', -- tables the agent can query
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false, -- can be shared via link
  public_slug TEXT UNIQUE,
  
  -- Metadata
  total_conversations INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: AI Agent Documents (for RAG)
CREATE TABLE public.ai_agent_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'file', 'url', 'text'
  source_url TEXT, -- original URL if type is 'url'
  file_path TEXT, -- storage path if type is 'file'
  content TEXT, -- extracted text content
  metadata JSONB DEFAULT '{}',
  chunk_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'ready', 'error'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: Document Chunks (for vector search)
CREATE TABLE public.ai_agent_document_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.ai_agent_documents(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding vector(1536), -- OpenAI ada-002 embeddings
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: AI Agent Conversations
CREATE TABLE public.ai_agent_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  user_id UUID,
  session_id TEXT, -- for anonymous users
  title TEXT NOT NULL DEFAULT 'Nova Conversa',
  summary TEXT, -- auto-generated summary
  is_active BOOLEAN DEFAULT true,
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: AI Agent Messages
CREATE TABLE public.ai_agent_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.ai_agent_conversations(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER,
  model_used TEXT,
  sources JSONB DEFAULT '[]', -- RAG sources used for this response
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: AI Agent Memory (long-term facts/preferences)
CREATE TABLE public.ai_agent_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  user_id UUID,
  session_id TEXT,
  memory_type TEXT NOT NULL DEFAULT 'fact', -- 'fact', 'preference', 'context'
  content TEXT NOT NULL,
  importance NUMERIC(3,2) DEFAULT 0.5, -- 0-1 scale
  embedding vector(1536),
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  access_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_ai_agents_user_id ON public.ai_agents(user_id);
CREATE INDEX idx_ai_agents_public_slug ON public.ai_agents(public_slug) WHERE public_slug IS NOT NULL;
CREATE INDEX idx_ai_agent_documents_agent_id ON public.ai_agent_documents(agent_id);
CREATE INDEX idx_ai_agent_document_chunks_agent_id ON public.ai_agent_document_chunks(agent_id);
CREATE INDEX idx_ai_agent_document_chunks_document_id ON public.ai_agent_document_chunks(document_id);
CREATE INDEX idx_ai_agent_conversations_agent_id ON public.ai_agent_conversations(agent_id);
CREATE INDEX idx_ai_agent_conversations_user_id ON public.ai_agent_conversations(user_id);
CREATE INDEX idx_ai_agent_messages_conversation_id ON public.ai_agent_messages(conversation_id);
CREATE INDEX idx_ai_agent_memory_agent_id ON public.ai_agent_memory(agent_id);

-- Vector index for similarity search
CREATE INDEX idx_ai_agent_document_chunks_embedding ON public.ai_agent_document_chunks 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_ai_agent_memory_embedding ON public.ai_agent_memory 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Enable RLS
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_memory ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_agents
CREATE POLICY "Users can view their own agents" ON public.ai_agents
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own agents" ON public.ai_agents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents" ON public.ai_agents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents" ON public.ai_agents
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for ai_agent_documents
CREATE POLICY "Users can manage documents of their agents" ON public.ai_agent_documents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.ai_agents WHERE id = agent_id AND user_id = auth.uid())
  );

-- RLS Policies for ai_agent_document_chunks
CREATE POLICY "Users can view chunks of their agents" ON public.ai_agent_document_chunks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.ai_agents WHERE id = agent_id AND user_id = auth.uid())
  );

-- RLS Policies for ai_agent_conversations
CREATE POLICY "Users can view conversations of their agents or their own" ON public.ai_agent_conversations
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.ai_agents WHERE id = agent_id AND (user_id = auth.uid() OR is_public = true))
  );

CREATE POLICY "Users can create conversations" ON public.ai_agent_conversations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their conversations" ON public.ai_agent_conversations
  FOR UPDATE USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can delete their conversations" ON public.ai_agent_conversations
  FOR DELETE USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.ai_agents WHERE id = agent_id AND user_id = auth.uid())
  );

-- RLS Policies for ai_agent_messages
CREATE POLICY "Users can view messages of accessible conversations" ON public.ai_agent_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ai_agent_conversations c
      WHERE c.id = conversation_id AND (
        c.user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.ai_agents a WHERE a.id = c.agent_id AND (a.user_id = auth.uid() OR a.is_public = true))
      )
    )
  );

CREATE POLICY "Users can insert messages in their conversations" ON public.ai_agent_messages
  FOR INSERT WITH CHECK (true);

-- RLS Policies for ai_agent_memory
CREATE POLICY "Users can manage memory of their agents" ON public.ai_agent_memory
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.ai_agents WHERE id = agent_id AND user_id = auth.uid())
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_ai_agents_updated_at
  BEFORE UPDATE ON public.ai_agents
  FOR EACH ROW EXECUTE FUNCTION update_ai_updated_at();

CREATE TRIGGER update_ai_agent_documents_updated_at
  BEFORE UPDATE ON public.ai_agent_documents
  FOR EACH ROW EXECUTE FUNCTION update_ai_updated_at();

CREATE TRIGGER update_ai_agent_conversations_updated_at
  BEFORE UPDATE ON public.ai_agent_conversations
  FOR EACH ROW EXECUTE FUNCTION update_ai_updated_at();

-- Function for vector similarity search
CREATE OR REPLACE FUNCTION search_document_chunks(
  p_agent_id UUID,
  p_embedding vector(1536),
  p_match_threshold FLOAT DEFAULT 0.7,
  p_match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  similarity FLOAT,
  document_name TEXT,
  metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.content,
    1 - (c.embedding <=> p_embedding) as similarity,
    d.name as document_name,
    c.metadata
  FROM public.ai_agent_document_chunks c
  JOIN public.ai_agent_documents d ON d.id = c.document_id
  WHERE c.agent_id = p_agent_id
    AND c.embedding IS NOT NULL
    AND 1 - (c.embedding <=> p_embedding) > p_match_threshold
  ORDER BY c.embedding <=> p_embedding
  LIMIT p_match_count;
END;
$$;

-- Function to search memory
CREATE OR REPLACE FUNCTION search_agent_memory(
  p_agent_id UUID,
  p_user_id UUID,
  p_embedding vector(1536),
  p_match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  memory_type TEXT,
  importance FLOAT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.content,
    m.memory_type,
    m.importance::FLOAT,
    1 - (m.embedding <=> p_embedding) as similarity
  FROM public.ai_agent_memory m
  WHERE m.agent_id = p_agent_id
    AND (m.user_id = p_user_id OR m.user_id IS NULL)
    AND m.embedding IS NOT NULL
  ORDER BY m.embedding <=> p_embedding
  LIMIT p_match_count;
END;
$$;