import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Camera, X, Upload, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

const prontuarioSchema = z.object({
  data_atendimento: z.string().min(1, "Data é obrigatória"),
  tratamento_id: z.string().optional(),
  descricao_procedimento: z.string().optional(),
  evolucao: z.string().optional(),
  observacoes_clinicas: z.string().optional(),
  proximos_passos: z.string().optional(),
});

type ProntuarioFormData = z.infer<typeof prontuarioSchema>;

interface ProntuarioFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prontuario?: Tables<"prontuarios"> | null;
  pacienteId: string;
  pacienteNome: string;
  onSave: (data: ProntuarioFormData & { 
    paciente_id: string; 
    fotos_antes: string[];
    fotos_depois: string[];
  }) => void;
  isLoading?: boolean;
}

export function ProntuarioForm({
  open,
  onOpenChange,
  prontuario,
  pacienteId,
  pacienteNome,
  onSave,
  isLoading,
}: ProntuarioFormProps) {
  const [fotosAntes, setFotosAntes] = useState<string[]>([]);
  const [fotosDepois, setFotosDepois] = useState<string[]>([]);
  const [uploadingAntes, setUploadingAntes] = useState(false);
  const [uploadingDepois, setUploadingDepois] = useState(false);
  
  const fileInputAntesRef = useRef<HTMLInputElement>(null);
  const fileInputDepoisRef = useRef<HTMLInputElement>(null);

  // Reset state when dialog opens with new prontuario
  useEffect(() => {
    if (open) {
      setFotosAntes(prontuario?.fotos_antes || []);
      setFotosDepois(prontuario?.fotos_depois || []);
    }
  }, [open, prontuario]);

  const { data: tratamentos = [] } = useQuery({
    queryKey: ["tratamentos-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tratamentos")
        .select("id, nome")
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<ProntuarioFormData>({
    resolver: zodResolver(prontuarioSchema),
    defaultValues: {
      data_atendimento: prontuario?.data_atendimento || format(new Date(), "yyyy-MM-dd"),
      tratamento_id: prontuario?.tratamento_id || "",
      descricao_procedimento: prontuario?.descricao_procedimento || "",
      evolucao: prontuario?.evolucao || "",
      observacoes_clinicas: prontuario?.observacoes_clinicas || "",
      proximos_passos: prontuario?.proximos_passos || "",
    },
  });

  // Reset form when prontuario changes
  useEffect(() => {
    if (open) {
      form.reset({
        data_atendimento: prontuario?.data_atendimento || format(new Date(), "yyyy-MM-dd"),
        tratamento_id: prontuario?.tratamento_id || "",
        descricao_procedimento: prontuario?.descricao_procedimento || "",
        evolucao: prontuario?.evolucao || "",
        observacoes_clinicas: prontuario?.observacoes_clinicas || "",
        proximos_passos: prontuario?.proximos_passos || "",
      });
    }
  }, [open, prontuario, form]);

  const handleSubmit = (data: ProntuarioFormData) => {
    onSave({ 
      ...data, 
      paciente_id: pacienteId,
      tratamento_id: data.tratamento_id || null,
      fotos_antes: fotosAntes,
      fotos_depois: fotosDepois,
    });
  };

  const uploadFile = async (file: File, tipo: 'antes' | 'depois'): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${pacienteId}/${tipo}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('prontuarios-fotos')
      .upload(fileName, file);
    
    if (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
    
    const { data: urlData } = supabase.storage
      .from('prontuarios-fotos')
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
  };

  const handleFileUpload = async (files: FileList | null, tipo: 'antes' | 'depois') => {
    if (!files || files.length === 0) return;
    
    const setUploading = tipo === 'antes' ? setUploadingAntes : setUploadingDepois;
    const setFotos = tipo === 'antes' ? setFotosAntes : setFotosDepois;
    const currentFotos = tipo === 'antes' ? fotosAntes : fotosDepois;
    
    setUploading(true);
    
    const uploadPromises = Array.from(files).map(file => uploadFile(file, tipo));
    const urls = await Promise.all(uploadPromises);
    const validUrls = urls.filter((url): url is string => url !== null);
    
    if (validUrls.length > 0) {
      setFotos([...currentFotos, ...validUrls]);
      toast({
        title: `${validUrls.length} foto(s) enviada(s)`,
        description: `Fotos ${tipo} adicionadas com sucesso`,
      });
    }
    
    setUploading(false);
  };

  const removeFoto = async (index: number, tipo: 'antes' | 'depois') => {
    const fotos = tipo === 'antes' ? fotosAntes : fotosDepois;
    const setFotos = tipo === 'antes' ? setFotosAntes : setFotosDepois;
    const fotoUrl = fotos[index];
    
    // Try to delete from storage
    try {
      const path = fotoUrl.split('/prontuarios-fotos/')[1];
      if (path) {
        await supabase.storage.from('prontuarios-fotos').remove([path]);
      }
    } catch (e) {
      console.warn('Could not delete file from storage:', e);
    }
    
    setFotos(fotos.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {prontuario ? "Editar Prontuário" : "Novo Prontuário"} - {pacienteNome}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="data_atendimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data do Atendimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tratamento_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tratamento/Procedimento</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || "none"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um tratamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {tratamentos.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Tabs defaultValue="procedimento" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="procedimento">Procedimento</TabsTrigger>
                <TabsTrigger value="evolucao">Evolução</TabsTrigger>
                <TabsTrigger value="fotos">Fotos</TabsTrigger>
              </TabsList>

              <TabsContent value="procedimento" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="descricao_procedimento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição do Procedimento</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva o procedimento realizado..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="observacoes_clinicas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações Clínicas</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observações clínicas relevantes..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="evolucao" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="evolucao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evolução Clínica</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva a evolução do paciente..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="proximos_passos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Próximos Passos</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Próximas etapas do tratamento..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="fotos" className="space-y-6 mt-4">
                {/* Fotos Antes */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-muted-foreground" />
                    <h4 className="font-medium">Fotos Antes</h4>
                  </div>
                  
                  <input
                    ref={fileInputAntesRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files, 'antes')}
                  />
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputAntesRef.current?.click()}
                    disabled={uploadingAntes}
                  >
                    {uploadingAntes ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Selecionar Fotos (Antes)
                      </>
                    )}
                  </Button>

                  {fotosAntes.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {fotosAntes.map((foto, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={foto}
                            alt={`Antes ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=Erro";
                            }}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeFoto(index, 'antes')}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Fotos Depois */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-muted-foreground" />
                    <h4 className="font-medium">Fotos Depois</h4>
                  </div>
                  
                  <input
                    ref={fileInputDepoisRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files, 'depois')}
                  />
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputDepoisRef.current?.click()}
                    disabled={uploadingDepois}
                  >
                    {uploadingDepois ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Selecionar Fotos (Depois)
                      </>
                    )}
                  </Button>

                  {fotosDepois.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {fotosDepois.map((foto, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={foto}
                            alt={`Depois ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=Erro";
                            }}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeFoto(index, 'depois')}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  * Formatos aceitos: JPEG, PNG, WebP. Tamanho máximo: 5MB por foto.
                </p>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || uploadingAntes || uploadingDepois}>
                {isLoading ? "Salvando..." : "Salvar Prontuário"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
