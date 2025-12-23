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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";

const anamneseSchema = z.object({
  data_anamnese: z.string().min(1, "Data é obrigatória"),
  queixa_principal: z.string().optional(),
  historico_medico: z.string().optional(),
  alergias: z.string().optional(),
  medicamentos_uso: z.string().optional(),
  cirurgias_anteriores: z.string().optional(),
  antecedentes_familiares: z.string().optional(),
  habitos: z.string().optional(),
  contraindicacoes: z.string().optional(),
  expectativas: z.string().optional(),
  observacoes: z.string().optional(),
});

type AnamneseFormData = z.infer<typeof anamneseSchema>;

interface AnamneseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anamnese?: Tables<"anamneses"> | null;
  pacienteId: string;
  pacienteNome: string;
  onSave: (data: AnamneseFormData & { paciente_id: string }) => void;
  isLoading?: boolean;
}

export function AnamneseForm({
  open,
  onOpenChange,
  anamnese,
  pacienteId,
  pacienteNome,
  onSave,
  isLoading,
}: AnamneseFormProps) {
  const form = useForm<AnamneseFormData>({
    resolver: zodResolver(anamneseSchema),
    defaultValues: {
      data_anamnese: anamnese?.data_anamnese || format(new Date(), "yyyy-MM-dd"),
      queixa_principal: anamnese?.queixa_principal || "",
      historico_medico: anamnese?.historico_medico || "",
      alergias: anamnese?.alergias || "",
      medicamentos_uso: anamnese?.medicamentos_uso || "",
      cirurgias_anteriores: anamnese?.cirurgias_anteriores || "",
      antecedentes_familiares: anamnese?.antecedentes_familiares || "",
      habitos: anamnese?.habitos || "",
      contraindicacoes: anamnese?.contraindicacoes || "",
      expectativas: anamnese?.expectativas || "",
      observacoes: anamnese?.observacoes || "",
    },
  });

  const handleSubmit = (data: AnamneseFormData) => {
    onSave({ ...data, paciente_id: pacienteId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {anamnese ? "Editar Anamnese" : "Nova Anamnese"} - {pacienteNome}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="data_anamnese"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data da Anamnese</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Tabs defaultValue="queixa" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="queixa">Queixa</TabsTrigger>
                <TabsTrigger value="historico">Histórico</TabsTrigger>
                <TabsTrigger value="habitos">Hábitos</TabsTrigger>
                <TabsTrigger value="outros">Outros</TabsTrigger>
              </TabsList>

              <TabsContent value="queixa" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="queixa_principal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Queixa Principal</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva a queixa principal do paciente..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expectativas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expectativas do Paciente</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Quais são as expectativas do paciente com o tratamento..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="historico" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="historico_medico"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Histórico Médico</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Doenças pré-existentes, condições crônicas..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="alergias"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alergias</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Liste todas as alergias conhecidas..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="medicamentos_uso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medicamentos em Uso</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Medicamentos que o paciente utiliza atualmente..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cirurgias_anteriores"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cirurgias Anteriores</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Cirurgias realizadas anteriormente..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="antecedentes_familiares"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Antecedentes Familiares</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Histórico de doenças na família..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="habitos" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="habitos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hábitos de Vida</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Alimentação, exercícios, sono, tabagismo, etilismo..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="outros" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="contraindicacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraindicações</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Contraindicações identificadas..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="observacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações Gerais</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Outras observações relevantes..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                {isLoading ? "Salvando..." : "Salvar Anamnese"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
