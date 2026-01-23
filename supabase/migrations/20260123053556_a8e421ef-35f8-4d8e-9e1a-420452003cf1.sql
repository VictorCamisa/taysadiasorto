-- Tabela de contratos/termos do paciente
CREATE TABLE public.contratos_paciente (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL,
  descricao TEXT,
  arquivo_url TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  data_assinatura TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de exames do paciente
CREATE TABLE public.exames_paciente (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT '',
  data_exame DATE NOT NULL DEFAULT CURRENT_DATE,
  laboratorio TEXT,
  resultado TEXT,
  observacoes TEXT,
  arquivo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de fotos do paciente
CREATE TABLE public.fotos_paciente (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'Outros',
  descricao TEXT,
  data_foto DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de receituário digital
CREATE TABLE public.receituario_digital (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  data_prescricao DATE NOT NULL DEFAULT CURRENT_DATE,
  medicamentos TEXT NOT NULL,
  posologia TEXT NOT NULL,
  orientacoes TEXT,
  validade_dias INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contratos_paciente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exames_paciente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fotos_paciente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receituario_digital ENABLE ROW LEVEL SECURITY;

-- Policies para contratos_paciente
CREATE POLICY "Authenticated users can view contratos" ON public.contratos_paciente FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert contratos" ON public.contratos_paciente FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update contratos" ON public.contratos_paciente FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete contratos" ON public.contratos_paciente FOR DELETE USING (auth.role() = 'authenticated');

-- Policies para exames_paciente
CREATE POLICY "Authenticated users can view exames" ON public.exames_paciente FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert exames" ON public.exames_paciente FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update exames" ON public.exames_paciente FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete exames" ON public.exames_paciente FOR DELETE USING (auth.role() = 'authenticated');

-- Policies para fotos_paciente
CREATE POLICY "Authenticated users can view fotos" ON public.fotos_paciente FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert fotos" ON public.fotos_paciente FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update fotos" ON public.fotos_paciente FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete fotos" ON public.fotos_paciente FOR DELETE USING (auth.role() = 'authenticated');

-- Policies para receituario_digital
CREATE POLICY "Authenticated users can view receituario" ON public.receituario_digital FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert receituario" ON public.receituario_digital FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update receituario" ON public.receituario_digital FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete receituario" ON public.receituario_digital FOR DELETE USING (auth.role() = 'authenticated');

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('contratos', 'contratos', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('fotos-pacientes', 'fotos-pacientes', true) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated can upload contratos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'contratos' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated can view contratos" ON storage.objects FOR SELECT USING (bucket_id = 'contratos' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated can delete contratos" ON storage.objects FOR DELETE USING (bucket_id = 'contratos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated can upload fotos-pacientes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'fotos-pacientes' AND auth.role() = 'authenticated');
CREATE POLICY "Anyone can view fotos-pacientes" ON storage.objects FOR SELECT USING (bucket_id = 'fotos-pacientes');
CREATE POLICY "Authenticated can delete fotos-pacientes" ON storage.objects FOR DELETE USING (bucket_id = 'fotos-pacientes' AND auth.role() = 'authenticated');

-- Indexes
CREATE INDEX idx_contratos_paciente_id ON public.contratos_paciente(paciente_id);
CREATE INDEX idx_exames_paciente_id ON public.exames_paciente(paciente_id);
CREATE INDEX idx_fotos_paciente_id ON public.fotos_paciente(paciente_id);
CREATE INDEX idx_receituario_paciente_id ON public.receituario_digital(paciente_id);