import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Filter } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PipelineKanban } from "@/components/crm/PipelineKanban";
import { OportunidadeForm } from "@/components/crm/OportunidadeForm";
import {
  useCRMAgendamentos,
  useTratamentos,
  useAgendamentoMutations,
  CRMAgendamento,
} from "@/components/crm/hooks/useCRMAgendamentos";
import { toast } from "@/hooks/use-toast";

export default function Pipeline() {
  const [selectedTratamento, setSelectedTratamento] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<CRMAgendamento | null>(null);

  const { data: tratamentos = [] } = useTratamentos();
  const { data: agendamentos = [], isLoading } = useCRMAgendamentos({
    tratamentoId: selectedTratamento !== "all" ? selectedTratamento : undefined,
  });
  const { createAgendamento, updateAgendamento } = useAgendamentoMutations();

  const handleSaveOportunidade = async (data: any) => {
    try {
      const payload = {
        paciente_id: data.paciente_id,
        tratamento_id: data.tratamento_id || null,
        origem_id: data.origem_id || null,
        prioridade: data.prioridade || "medio",
        valor_previsto: data.valor_previsto || 0,
        data_previsao_fechamento: data.data_previsao_fechamento || null,
        observacoes: data.observacoes || null,
        status: selectedAgendamento?.status || "lead",
      };

      if (selectedAgendamento) {
        await updateAgendamento.mutateAsync({ id: selectedAgendamento.id, ...payload });
        toast({ title: "Oportunidade atualizada!" });
      } else {
        await createAgendamento.mutateAsync(payload);
        toast({ title: "Oportunidade criada!" });
      }
      setFormOpen(false);
      setSelectedAgendamento(null);
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    }
  };

  const handleEditAgendamento = (agendamento: CRMAgendamento) => {
    setSelectedAgendamento(agendamento);
    setFormOpen(true);
  };

  // Calculate KPIs
  const totalLeads = agendamentos.filter((a) => a.status === "lead").length;
  const totalAgendados = agendamentos.filter((a) => a.status === "agendado" || a.status === "confirmado").length;
  const totalRealizados = agendamentos.filter((a) => a.status === "realizado").length;
  const totalValorPrevisto = agendamentos
    .filter((a) => a.status !== "cancelado" && a.status !== "no_show")
    .reduce((sum, a) => sum + Number(a.valor_previsto || 0), 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pipeline de Vendas"
        description="Gerencie suas oportunidades e acompanhe o funil de vendas"
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground">Leads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{totalAgendados}</div>
            <p className="text-xs text-muted-foreground">Agendados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-emerald-600">{totalRealizados}</div>
            <p className="text-xs text-muted-foreground">Realizados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{formatCurrency(totalValorPrevisto)}</div>
            <p className="text-xs text-muted-foreground">Valor no Funil</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedTratamento} onValueChange={setSelectedTratamento}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por tratamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tratamentos</SelectItem>
              {tratamentos.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => { setSelectedAgendamento(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Oportunidade
        </Button>
      </div>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Carregando...</div>
        </div>
      ) : (
        <PipelineKanban
          agendamentos={agendamentos}
          onEditAgendamento={handleEditAgendamento}
        />
      )}

      {/* Form Modal */}
      <OportunidadeForm
        open={formOpen}
        onOpenChange={setFormOpen}
        oportunidade={selectedAgendamento}
        onSave={handleSaveOportunidade}
        isLoading={createAgendamento.isPending || updateAgendamento.isPending}
      />
    </div>
  );
}
