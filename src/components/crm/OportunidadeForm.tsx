import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Phone, Mail, UserPlus, Flame, Thermometer, Snowflake, Info } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  usePacientes,
  useTratamentos,
  useOrigens,
  useCreatePacienteMutation,
  CRMAgendamento,
} from "./hooks/useCRMAgendamentos";

const oportunidadeSchema = z.object({
  paciente_id: z.string().min(1, "Paciente é obrigatório"),
  tratamento_id: z.string().optional(),
  origem_id: z.string().optional(),
  prioridade: z.string().default("medio"),
  valor_previsto: z.coerce.number().min(0).optional(),
  duracao_minutos: z.coerce.number().min(0).optional(),
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
      duracao_minutos: 60,
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
  const selectedTratamentoId = form.watch("tratamento_id");
  
  const selectedPaciente = pacientes.find((p) => p.id === selectedPacienteId);
  const selectedTratamento = tratamentos.find((t) => t.id === selectedTratamentoId);

  // Auto-fill treatment data when treatment changes
  useEffect(() => {
    if (selectedTratamento && selectedTratamentoId && selectedTratamentoId !== "none") {
      // Only auto-fill if it's a new opportunity or the treatment changed
      if (!oportunidade || oportunidade.tratamento_id !== selectedTratamentoId) {
        form.setValue("valor_previsto", Number(selectedTratamento.preco_padrao) || 0);
      }
    }
  }, [selectedTratamentoId, selectedTratamento, form, oportunidade]);

  useEffect(() => {
    if (oportunidade) {
      form.reset({
        paciente_id: oportunidade.paciente_id,
        tratamento_id: oportunidade.tratamento_id || "",
        origem_id: oportunidade.origem_id || "",
        prioridade: oportunidade.prioridade || "medio",
        valor_previsto: Number(oportunidade.valor_previsto) || 0,
        duracao_minutos: Number(oportunidade.duracao_minutos) || 60,
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
        duracao_minutos: 60,
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

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
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

            {/* Treatment Selection */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Tratamento de Interesse</h3>
              
              <FormField
                control={form.control}
                name="tratamento_id"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} value={field.value || "none"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tratamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {tratamentos.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.nome} {t.preco_padrao ? `- ${formatCurrency(t.preco_padrao)}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Treatment Details Card */}
              {selectedTratamento && selectedTratamentoId !== "none" && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-start gap-2 mb-3">
                      <Info className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-sm font-medium text-primary">Informações do Tratamento</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground block">Preço Padrão</span>
                        <span className="font-semibold text-lg">
                          {formatCurrency(selectedTratamento.preco_padrao)}
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground block">Custo Estimado</span>
                        <span className="font-medium">
                          {formatCurrency(selectedTratamento.custo_estimado)}
                        </span>
                      </div>

                      {selectedTratamento.e_cirurgico && (
                        <div>
                          <span className="text-muted-foreground block">Custo Cirúrgico</span>
                          <span className="font-medium">
                            {formatCurrency(selectedTratamento.custo_cirurgico)}
                          </span>
                        </div>
                      )}

                      {selectedTratamento.unidade_medida && (
                        <div>
                          <span className="text-muted-foreground block">Unidade</span>
                          <span className="font-medium">{selectedTratamento.unidade_medida}</span>
                        </div>
                      )}

                      <div>
                        <span className="text-muted-foreground block">Tipo</span>
                        <Badge variant={selectedTratamento.e_cirurgico ? "destructive" : "secondary"}>
                          {selectedTratamento.e_cirurgico ? "Cirúrgico" : "Não Cirúrgico"}
                        </Badge>
                      </div>

                      {selectedTratamento.preco_padrao && selectedTratamento.custo_estimado && (
                        <div>
                          <span className="text-muted-foreground block">Margem Estimada</span>
                          <span className="font-medium text-emerald-600">
                            {formatCurrency(
                              Number(selectedTratamento.preco_padrao) - 
                              Number(selectedTratamento.custo_estimado) - 
                              (selectedTratamento.e_cirurgico ? Number(selectedTratamento.custo_cirurgico || 0) : 0)
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    {selectedTratamento.descricao && (
                      <div className="mt-3 pt-3 border-t border-primary/10">
                        <span className="text-muted-foreground text-xs block mb-1">Descrição</span>
                        <p className="text-sm">{selectedTratamento.descricao}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            <Separator />

            {/* Opportunity Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Detalhes da Oportunidade</h3>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
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

                <FormField
                  control={form.control}
                  name="duracao_minutos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração (minutos)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="15"
                          placeholder="60"
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
