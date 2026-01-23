-- Create table for treatment plans
CREATE TABLE public.planos_tratamento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  itens JSONB NOT NULL DEFAULT '[]',
  valor_total NUMERIC DEFAULT 0,
  pdf_url TEXT,
  status TEXT DEFAULT 'ativo'
);

-- Enable Row Level Security
ALTER TABLE public.planos_tratamento ENABLE ROW LEVEL SECURITY;

-- Create policies for access
CREATE POLICY "Authenticated users can view treatment plans" 
ON public.planos_tratamento 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create treatment plans" 
ON public.planos_tratamento 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update treatment plans" 
ON public.planos_tratamento 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete treatment plans" 
ON public.planos_tratamento 
FOR DELETE 
TO authenticated
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_planos_tratamento_updated_at
BEFORE UPDATE ON public.planos_tratamento
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for treatment plan PDFs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('planos-tratamento', 'planos-tratamento', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view treatment plan PDFs"
ON storage.objects FOR SELECT
USING (bucket_id = 'planos-tratamento');

CREATE POLICY "Authenticated users can upload treatment plan PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'planos-tratamento');

CREATE POLICY "Authenticated users can update treatment plan PDFs"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'planos-tratamento');

CREATE POLICY "Authenticated users can delete treatment plan PDFs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'planos-tratamento');