import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { MobileModuleNav } from "@/components/mobile/MobileModuleNav";
import { MobileSearchBar } from "@/components/mobile/MobileSearchBar";
import { MobileFAB } from "@/components/mobile/MobileFAB";
import { MobileEmptyState } from "@/components/mobile/MobileEmptyState";
import { MobileKPICard, MobileKPIGrid } from "@/components/mobile/MobileKPICard";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Users,
  Target,
  Calendar,
  TrendingUp,
  DollarSign,
  Phone,
  MessageCircle,
  ChevronRight,
  Filter,
  Kanban,
  Heart,
  XCircle,
} from "lucide-react";
import {
  useCRMAgendamentos,
  useTratamentos,
  useOrigens,
  CRMAgendamento,
  PIPELINE_COLUMNS,
  PRIORIDADE_LABELS,
  STATUS_LABELS,
  Prioridade,
} from "@/components/crm/hooks/useCRMAgendamentos";
import { OportunidadeForm } from "@/components/crm/OportunidadeForm";
import { useAgendamentoMutations } from "@/components/crm/hooks/useCRMAgendamentos";
import { toast } from "@/hooks/use-toast";

const crmNavItems = [
  { label: "Pipeline", to: "/crm/pipeline", icon: Kanban },
  { label: "Agendamentos", to: "/crm/agendamentos", icon: Calendar },
  { label: "WhatsApp", to: "/crm/whatsapp", icon: MessageCircle },
  { label: "Pós-venda", to: "/crm/pos-venda", icon: Heart },
  { label: "Perdidos", to: "/crm/perdidos", icon: XCircle },
  { label: "Pacientes", to: "/crm/pacientes", icon: Users },
];

const prioridadeColors: Record<string, string> = {
  alto: "bg-red-500/10 text-red-500 border-red-500/20",
  medio: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  baixo: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

const prioridadeEmojis: Record<string, string> = {
  alto: "🔥",
  medio: "🌡️",
  baixo: "❄️",
};

interface LeadCardProps {
  agendamento: CRMAgendamento;
  onTap: () => void;
}

function LeadCard({ agendamento, onTap }: LeadCardProps) {
  const prioridade = agendamento.prioridade || "medio";
  const paciente = agendamento.paciente as any;
  const tratamento = agendamento.tratamento as any;
  const origem = agendamento.origem as any;
  
  return (
    <div
      onClick={onTap}
      className={cn(
        "p-4 rounded-xl bg-card border border-border/40",
        "active:scale-[0.98] transition-all duration-200 cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate">
              {paciente?.nome || "Sem nome"}
            </h3>
            <span className="text-sm">{prioridadeEmojis[prioridade]}</span>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {tratamento?.nome || "Sem tratamento definido"}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-bold text-primary">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
              maximumFractionDigits: 0,
            }).format(agendamento.valor_previsto || 0)}
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("text-xs", prioridadeColors[prioridade])}>
            {PRIORIDADE_LABELS[prioridade as Prioridade]}
          </Badge>
          {origem?.nome && (
            <Badge variant="secondary" className="text-xs">
              {origem.nome}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {paciente?.telefone && (
            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg">
              <Phone className="h-4 w-4" />
            </Button>
          )}
          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg">
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ColumnTabProps {
  status: string;
  label: string;
  count: number;
  active: boolean;
  onSelect: () => void;
}

function ColumnTab({ status, label, count, active, onSelect }: ColumnTabProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap",
        "transition-all duration-200 active:scale-95",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted/60 text-muted-foreground"
      )}
    >
      <span className="font-medium">{label}</span>
      <span className={cn(
        "px-2 py-0.5 rounded-md text-xs font-semibold",
        active ? "bg-primary-foreground/20" : "bg-background"
      )}>
        {count}
      </span>
    </button>
  );
}

export function MobilePipeline() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeColumn, setActiveColumn] = useState<string>("lead");
  const [filterOpen, setFilterOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<CRMAgendamento | null>(null);
  const [selectedTratamento, setSelectedTratamento] = useState<string>("all");
  const [selectedOrigem, setSelectedOrigem] = useState<string>("all");
  const [selectedPrioridade, setSelectedPrioridade] = useState<string>("all");

  const { data: tratamentos = [] } = useTratamentos();
  const { data: origens = [] } = useOrigens();
  const { data: agendamentos = [], isLoading } = useCRMAgendamentos({
    tratamentoId: selectedTratamento !== "all" ? selectedTratamento : undefined,
    origemId: selectedOrigem !== "all" ? selectedOrigem : undefined,
    prioridade: selectedPrioridade !== "all" ? selectedPrioridade as Prioridade : undefined,
  });
  const { createAgendamento, updateAgendamento } = useAgendamentoMutations();

  // Filter by search
  const filteredAgendamentos = agendamentos.filter((a) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    const paciente = a.paciente as any;
    const tratamento = a.tratamento as any;
    const origem = a.origem as any;
    return (
      paciente?.nome?.toLowerCase().includes(searchLower) ||
      tratamento?.nome?.toLowerCase().includes(searchLower) ||
      origem?.nome?.toLowerCase().includes(searchLower)
    );
  });

  // Group by status
  const byStatus = PIPELINE_COLUMNS.reduce((acc, status) => {
    acc[status] = filteredAgendamentos.filter((a) => a.status === status);
    return acc;
  }, {} as Record<string, CRMAgendamento[]>);

  // Calculate KPIs
  const totalLeads = agendamentos.filter((a) => a.status === "lead").length;
  const totalEmNegociacao = agendamentos.filter((a) => a.status === "em_negociacao").length;
  const totalRealizados = agendamentos.filter((a) => a.status === "realizado").length;
  const totalPerdidos = agendamentos.filter((a) => a.status === "perdido" || a.status === "cancelado").length;
  const taxaConversao = totalRealizados + totalPerdidos > 0
    ? Math.round((totalRealizados / (totalRealizados + totalPerdidos)) * 100)
    : 0;
  const pipelineValue = filteredAgendamentos
    .filter((a) => PIPELINE_COLUMNS.includes(a.status as typeof PIPELINE_COLUMNS[number]))
    .reduce((sum, a) => sum + Number(a.valor_previsto || 0), 0);

  const handleSave = async (data: Record<string, unknown>) => {
    try {
      const payload = {
        paciente_id: data.paciente_id as string,
        tratamento_id: (data.tratamento_id as string) || null,
        origem_id: (data.origem_id as string) || null,
        prioridade: (data.prioridade as string) || "medio",
        valor_previsto: (data.valor_previsto as number) || 0,
        duracao_minutos: (data.duracao_minutos as number) || 60,
        data_previsao_fechamento: (data.data_previsao_fechamento as string) || null,
        observacoes: (data.observacoes as string) || null,
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
    } catch (error) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  };

  const handleCardTap = (agendamento: CRMAgendamento) => {
    navigate(`/crm/pacientes/${agendamento.paciente_id}`);
  };

  const hasActiveFilters = selectedTratamento !== "all" || selectedOrigem !== "all" || selectedPrioridade !== "all";

  const clearFilters = () => {
    setSelectedTratamento("all");
    setSelectedOrigem("all");
    setSelectedPrioridade("all");
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <MobileHeader 
        title="Pipeline"
        showBack
        backTo="/"
        actions={
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-xl",
              hasActiveFilters && "text-primary"
            )}
            onClick={() => setFilterOpen(true)}
          >
            <Filter className="h-5 w-5" />
            {hasActiveFilters && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" />
            )}
          </Button>
        }
      />

      {/* Module Nav */}
      <MobileModuleNav items={crmNavItems} />

      {/* Content */}
      <div className="flex-1 flex flex-col pb-24">
        {/* KPIs */}
        <div className="px-4 py-3">
          <MobileKPIGrid>
            <MobileKPICard
              title="Leads"
              value={totalLeads.toString()}
              icon={Users}
              compact
            />
            <MobileKPICard
              title="Em Negociação"
              value={totalEmNegociacao.toString()}
              icon={Target}
              compact
            />
            <MobileKPICard
              title="Conversão"
              value={`${taxaConversao}%`}
              icon={TrendingUp}
              variant="success"
              compact
            />
            <MobileKPICard
              title="Valor no Funil"
              value={new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
                notation: "compact",
              }).format(pipelineValue)}
              icon={DollarSign}
              compact
            />
          </MobileKPIGrid>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <MobileSearchBar
            value={search}
            onChange={setSearch}
            placeholder="Buscar leads..."
          />
        </div>

        {/* Column Tabs */}
        <div className="px-4 pb-3">
          <ScrollArea className="w-full">
            <div className="flex gap-2">
              {PIPELINE_COLUMNS.map((status) => (
                <ColumnTab
                  key={status}
                  status={status}
                  label={STATUS_LABELS[status]}
                  count={byStatus[status]?.length || 0}
                  active={activeColumn === status}
                  onSelect={() => setActiveColumn(status)}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        </div>

        {/* Cards List */}
        <div className="flex-1 px-4 space-y-3 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <span className="text-muted-foreground">Carregando...</span>
            </div>
          ) : byStatus[activeColumn]?.length === 0 ? (
            <MobileEmptyState
              title="Nenhum lead aqui"
              description={`Não há leads na etapa "${STATUS_LABELS[activeColumn]}"`}
              action={{
                label: "Adicionar Lead",
                onClick: () => {
                  setSelectedAgendamento(null);
                  setFormOpen(true);
                },
              }}
            />
          ) : (
            byStatus[activeColumn]?.map((agendamento) => (
              <LeadCard
                key={agendamento.id}
                agendamento={agendamento}
                onTap={() => handleCardTap(agendamento)}
              />
            ))
          )}
        </div>
      </div>

      {/* FAB */}
      <MobileFAB
        onClick={() => {
          setSelectedAgendamento(null);
          setFormOpen(true);
        }}
      />

      {/* Filter Sheet */}
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle>Filtros</SheetTitle>
          </SheetHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Origem</label>
              <Select value={selectedOrigem} onValueChange={setSelectedOrigem}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas origens" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas origens</SelectItem>
                  {origens.map((o) => (
                    <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tratamento</label>
              <Select value={selectedTratamento} onValueChange={setSelectedTratamento}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos tratamentos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos tratamentos</SelectItem>
                  {tratamentos.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Temperatura</label>
              <Select value={selectedPrioridade} onValueChange={setSelectedPrioridade}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="alto">🔥 Quente</SelectItem>
                  <SelectItem value="medio">🌡️ Morno</SelectItem>
                  <SelectItem value="baixo">❄️ Frio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-4">
              {hasActiveFilters && (
                <Button variant="outline" className="flex-1" onClick={clearFilters}>
                  Limpar
                </Button>
              )}
              <Button className="flex-1" onClick={() => setFilterOpen(false)}>
                Aplicar
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Form Modal */}
      <OportunidadeForm
        open={formOpen}
        onOpenChange={setFormOpen}
        oportunidade={selectedAgendamento}
        onSave={handleSave}
        isLoading={createAgendamento.isPending || updateAgendamento.isPending}
      />
    </div>
  );
}
