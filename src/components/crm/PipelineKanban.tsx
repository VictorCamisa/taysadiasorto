import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, DollarSign, Clock } from "lucide-react";
import {
  CRMAgendamento,
  AgendamentoStatus,
  STATUS_LABELS,
  STATUS_COLORS,
  useAgendamentoMutations,
} from "./hooks/useCRMAgendamentos";

interface PipelineKanbanProps {
  agendamentos: CRMAgendamento[];
  onEditAgendamento?: (agendamento: CRMAgendamento) => void;
}

const PIPELINE_COLUMNS: AgendamentoStatus[] = [
  "lead",
  "agendado",
  "confirmado",
  "realizado",
];

export function PipelineKanban({ agendamentos, onEditAgendamento }: PipelineKanbanProps) {
  const navigate = useNavigate();
  const { updateStatus } = useAgendamentoMutations();

  const getColumnAgendamentos = (status: AgendamentoStatus) => {
    return agendamentos.filter((a) => a.status === status);
  };

  const getInitials = (nome: string) => {
    return nome
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), "dd/MM HH:mm", { locale: ptBR });
    } catch {
      return null;
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return null;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleCardClick = (agendamento: CRMAgendamento) => {
    if (agendamento.paciente_id) {
      navigate(`/crm/pacientes/${agendamento.paciente_id}`);
    }
  };

  const handleDragStart = (e: React.DragEvent, agendamentoId: string) => {
    e.dataTransfer.setData("agendamentoId", agendamentoId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: AgendamentoStatus) => {
    e.preventDefault();
    const agendamentoId = e.dataTransfer.getData("agendamentoId");
    if (agendamentoId) {
      updateStatus.mutate({ id: agendamentoId, status: newStatus });
    }
  };

  const getColumnTotal = (status: AgendamentoStatus) => {
    return getColumnAgendamentos(status).reduce(
      (sum, a) => sum + Number(a.valor_previsto || 0),
      0
    );
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {PIPELINE_COLUMNS.map((status) => {
        const columnAgendamentos = getColumnAgendamentos(status);
        const columnTotal = getColumnTotal(status);

        return (
          <div
            key={status}
            className="flex-shrink-0 w-72"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-medium">
                      {STATUS_LABELS[status]}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {columnAgendamentos.length}
                    </Badge>
                  </div>
                </div>
                {columnTotal > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(columnTotal)}
                  </p>
                )}
              </CardHeader>
              <CardContent className="p-2">
                <ScrollArea className="h-[calc(100vh-280px)]">
                  <div className="space-y-2 pr-2">
                    {columnAgendamentos.map((agendamento) => (
                      <Card
                        key={agendamento.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        draggable
                        onDragStart={(e) => handleDragStart(e, agendamento.id)}
                        onClick={() => handleCardClick(agendamento)}
                      >
                        <CardContent className="p-3 space-y-2">
                          {/* Header with Avatar */}
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {agendamento.paciente?.nome
                                  ? getInitials(agendamento.paciente.nome)
                                  : "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {agendamento.paciente?.nome || "Paciente"}
                              </p>
                            </div>
                          </div>

                          {/* Treatment Badge */}
                          {agendamento.tratamento && (
                            <Badge variant="outline" className="text-xs w-fit">
                              {agendamento.tratamento.nome}
                            </Badge>
                          )}

                          {/* Meta info */}
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {agendamento.data_agendamento && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(agendamento.data_agendamento)}
                              </span>
                            )}
                            {agendamento.duracao_minutos && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {agendamento.duracao_minutos}min
                              </span>
                            )}
                            {Number(agendamento.valor_previsto) > 0 && (
                              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                <DollarSign className="h-3 w-3" />
                                {formatCurrency(Number(agendamento.valor_previsto))}
                              </span>
                            )}
                          </div>

                          {/* Observations */}
                          {agendamento.observacoes && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {agendamento.observacoes}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}

                    {columnAgendamentos.length === 0 && (
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        Nenhum item
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
