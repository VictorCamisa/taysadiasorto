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
import { Camera, X, Plus } from "lucide-react";
import { useState } from "react";

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
  const [fotosAntes, setFotosAntes] = useState<string[]>(prontuario?.fotos_antes || []);
  const [fotosDepois, setFotosDepois] = useState<string[]>(prontuario?.fotos_depois || []);
  const [novaFotoAntes, setNovaFotoAntes] = useState("");
  const [novaFotoDepois, setNovaFotoDepois] = useState("");

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

  const handleSubmit = (data: ProntuarioFormData) => {
    onSave({ 
      ...data, 
      paciente_id: pacienteId,
      tratamento_id: data.tratamento_id || null,
      fotos_antes: fotosAntes,
      fotos_depois: fotosDepois,
    });
  };

  const addFotoAntes = () => {
    if (novaFotoAntes.trim()) {
      setFotosAntes([...fotosAntes, novaFotoAntes.trim()]);
      setNovaFotoAntes("");
    }
  };

  const addFotoDepois = () => {
    if (novaFotoDepois.trim()) {
      setFotosDepois([...fotosDepois, novaFotoDepois.trim()]);
      setNovaFotoDepois("");
    }
  };

  const removeFotoAntes = (index: number) => {
    setFotosAntes(fotosAntes.filter((_, i) => i !== index));
  };

  const removeFotoDepois = (index: number) => {
    setFotosDepois(fotosDepois.filter((_, i) => i !== index));
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
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um tratamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Nenhum</SelectItem>
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
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Cole a URL da imagem..."
                      value={novaFotoAntes}
                      onChange={(e) => setNovaFotoAntes(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFotoAntes())}
                    />
                    <Button type="button" variant="outline" onClick={addFotoAntes}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

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
                            onClick={() => removeFotoAntes(index)}
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
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Cole a URL da imagem..."
                      value={novaFotoDepois}
                      onChange={(e) => setNovaFotoDepois(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFotoDepois())}
                    />
                    <Button type="button" variant="outline" onClick={addFotoDepois}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

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
                            onClick={() => removeFotoDepois(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  * Cole URLs de imagens para adicionar fotos. Futuramente será possível fazer upload direto.
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar Prontuário"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
