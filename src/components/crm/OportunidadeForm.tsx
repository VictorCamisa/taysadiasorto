import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Phone, Mail, UserPlus, Flame, Thermometer, Snowflake } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  usePacientes,
  useTratamentos,
  useOrigens,
  useCreatePacienteMutation,
  CRMAgendamento,
  Prioridade,
  PRIORIDADE_LABELS,
} from "./hooks/useCRMAgendamentos";

const oportunidadeSchema = z.object({
  paciente_id: z.string().min(1, "Paciente é obrigatório"),
  tratamento_id: z.string().optional(),
  origem_id: z.string().optional(),
  prioridade: z.string().default("medio"),
  valor_previsto: z.coerce.number().min(0).optional(),
  data_previsao_fechamento: z.string().optional(),
  observacoes: z.string().optional(),
});

const novoPacienteSchema = z.object({
  nome: z.string().min(2, "Nome é obrigatório"),
  telefone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
});

type OportunidadeFormData = z.infer<typeof oportunidadeSchema>;
type NovoPacienteFormData = z.infer<typeof novoPacienteSchema>;

interface OportunidadeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  oportunidade?: CRMAgendamento | null;
  onSave: (data: OportunidadeFormData) => Promise<void>;
  isLoading?: boolean;
}

export function OportunidadeForm({
  open,
  onOpenChange,
  oportunidade,
  onSave,
  isLoading,
}: OportunidadeFormProps) {
  const [activeTab, setActiveTab] = useState<"existente" | "novo">("existente");
  const { data: pacientes = [] } = usePacientes();
  const { data: tratamentos = [] } = useTratamentos();
  const { data: origens = [] } = useOrigens();
  const createPacienteMutation = useCreatePacienteMutation();

  const form = useForm<OportunidadeFormData>({
    resolver: zodResolver(oportunidadeSchema),
    defaultValues: {
      paciente_id: "",
      tratamento_id: "",
      origem_id: "",
      prioridade: "medio",
      valor_previsto: 0,
      data_previsao_fechamento: "",
      observacoes: "",
    },
  });

  const novoPacienteForm = useForm<NovoPacienteFormData>({
    resolver: zodResolver(novoPacienteSchema),
    defaultValues: {
      nome: "",
      telefone: "",
      email: "",
    },
  });

  const selectedPacienteId = form.watch("paciente_id");
  const selectedPaciente = pacientes.find((p) => p.id === selectedPacienteId);

  useEffect(() => {
    if (oportunidade) {
      form.reset({
        paciente_id: oportunidade.paciente_id,
        tratamento_id: oportunidade.tratamento_id || "",
        origem_id: oportunidade.origem_id || "",
        prioridade: oportunidade.prioridade || "medio",
        valor_previsto: Number(oportunidade.valor_previsto) || 0,
        data_previsao_fechamento: oportunidade.data_previsao_fechamento || "",
        observacoes: oportunidade.observacoes || "",
      });
      setActiveTab("existente");
    } else {
      form.reset({
        paciente_id: "",
        tratamento_id: "",
        origem_id: "",
        prioridade: "medio",
        valor_previsto: 0,
        data_previsao_fechamento: "",
        observacoes: "",
      });
      novoPacienteForm.reset({
        nome: "",
        telefone: "",
        email: "",
      });
    }
  }, [oportunidade, open, form, novoPacienteForm]);

  const handleCreatePaciente = async (data: NovoPacienteFormData) => {
    try {
      const newPaciente = await createPacienteMutation.mutateAsync({
        nome: data.nome,
        telefone: data.telefone || undefined,
        email: data.email || undefined,
      });
      form.setValue("paciente_id", newPaciente.id);
      setActiveTab("existente");
      novoPacienteForm.reset();
    } catch (error) {
      console.error("Error creating patient:", error);
    }
  };

  const handleSubmit = async (data: OportunidadeFormData) => {
    await onSave({
      ...data,
      tratamento_id: data.tratamento_id === "none" ? undefined : data.tratamento_id,
      origem_id: data.origem_id === "none" ? undefined : data.origem_id,
    });
  };

  const getPrioridadeIcon = (prioridade: string) => {
    switch (prioridade) {
      case "alto":
        return <Flame className="h-4 w-4 text-red-500" />;
      case "medio":
        return <Thermometer className="h-4 w-4 text-amber-500" />;
      case "baixo":
        return <Snowflake className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {oportunidade ? "Editar Oportunidade" : "Nova Oportunidade"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Patient Selection */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Paciente/Lead</h3>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "existente" | "novo")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="existente">Paciente Existente</TabsTrigger>
                  <TabsTrigger value="novo">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Novo Paciente
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="existente" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="paciente_id"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o paciente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {pacientes.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Patient Contact Info */}
                  {selectedPaciente && (
                    <Card className="bg-muted/50">
                      <CardContent className="pt-4 pb-3">
                        <div className="flex flex-wrap gap-4 text-sm">
                          {selectedPaciente.telefone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <a
                                href={`https://wa.me/55${selectedPaciente.telefone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {selectedPaciente.telefone}
                              </a>
                            </div>
                          )}
                          {selectedPaciente.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <a
                                href={`mailto:${selectedPaciente.email}`}
                                className="text-primary hover:underline"
                              >
                                {selectedPaciente.email}
                              </a>
                            </div>
                          )}
                          {!selectedPaciente.telefone && !selectedPaciente.email && (
                            <span className="text-muted-foreground">
                              Nenhum contato cadastrado
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="novo" className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <label className="text-sm font-medium">Nome *</label>
                      <Input
                        placeholder="Nome completo"
                        {...novoPacienteForm.register("nome")}
                      />
                      {novoPacienteForm.formState.errors.nome && (
                        <p className="text-sm text-destructive mt-1">
                          {novoPacienteForm.formState.errors.nome.message}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Telefone</label>
                        <Input
                          placeholder="(11) 99999-9999"
                          {...novoPacienteForm.register("telefone")}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <Input
                          type="email"
                          placeholder="email@exemplo.com"
                          {...novoPacienteForm.register("email")}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={novoPacienteForm.handleSubmit(handleCreatePaciente)}
                      disabled={createPacienteMutation.isPending}
                    >
                      {createPacienteMutation.isPending ? "Criando..." : "Criar Paciente"}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <Separator />

            {/* Opportunity Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Detalhes da Oportunidade</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tratamento_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tratamento de Interesse</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "none"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
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

                <FormField
                  control={form.control}
                  name="origem_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Origem do Lead</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "none"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Não informado</SelectItem>
                          {origens.map((o) => (
                            <SelectItem key={o.id} value={o.id}>
                              {o.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="prioridade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperatura do Lead</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="alto">
                            <div className="flex items-center gap-2">
                              <Flame className="h-4 w-4 text-red-500" />
                              Quente
                            </div>
                          </SelectItem>
                          <SelectItem value="medio">
                            <div className="flex items-center gap-2">
                              <Thermometer className="h-4 w-4 text-amber-500" />
                              Morno
                            </div>
                          </SelectItem>
                          <SelectItem value="baixo">
                            <div className="flex items-center gap-2">
                              <Snowflake className="h-4 w-4 text-blue-500" />
                              Frio
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="valor_previsto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Previsto (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0,00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="data_previsao_fechamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Previsão de Fechamento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Anotações sobre a oportunidade, interesses, dúvidas do paciente..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar Oportunidade"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
