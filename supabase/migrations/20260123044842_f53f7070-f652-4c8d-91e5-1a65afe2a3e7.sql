-- Create storage bucket for agent documents (PDFs, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'agent-documents', 
  'agent-documents', 
  false, 
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'text/plain', 'text/markdown', 'application/json']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for agent-documents bucket
CREATE POLICY "Users can upload documents for their agents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'agent-documents' AND
  EXISTS (
    SELECT 1 FROM ai_agents 
    WHERE id::text = (storage.foldername(name))[1] 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can view documents for their agents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'agent-documents' AND
  EXISTS (
    SELECT 1 FROM ai_agents 
    WHERE id::text = (storage.foldername(name))[1] 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete documents for their agents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'agent-documents' AND
  EXISTS (
    SELECT 1 FROM ai_agents 
    WHERE id::text = (storage.foldername(name))[1] 
    AND user_id = auth.uid()
  )
);