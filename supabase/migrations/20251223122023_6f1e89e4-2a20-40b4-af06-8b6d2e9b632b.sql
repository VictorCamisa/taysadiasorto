-- Criar bucket para fotos de prontuários
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'prontuarios-fotos', 
  'prontuarios-fotos', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
);

-- Política para leitura pública das fotos
CREATE POLICY "Fotos de prontuários são públicas para visualização"
ON storage.objects
FOR SELECT
USING (bucket_id = 'prontuarios-fotos');

-- Política para upload de fotos (qualquer usuário pode fazer upload)
CREATE POLICY "Permitir upload de fotos de prontuários"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'prontuarios-fotos');

-- Política para deletar fotos
CREATE POLICY "Permitir deletar fotos de prontuários"
ON storage.objects
FOR DELETE
USING (bucket_id = 'prontuarios-fotos');

-- Política para atualizar fotos
CREATE POLICY "Permitir atualizar fotos de prontuários"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'prontuarios-fotos');