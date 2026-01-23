import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, Circle, Edit, MessageSquare, Phone } from "lucide-react";
import {
  CRMAgendamento,
  PRIORIDADE_COLORS,
  PRIORIDADE_ICONS,
  PRIORIDADE_LABELS,
  Prioridade,
  AgendamentoStatus,
} from "./hooks/useCRMAgendamentos";
import { useChecklistWithProgress } from "./hooks/usePipelineChecklist";
import { cn } from "@/lib/utils";

interface CardOportunidadeProps {
  agendamento: CRMAgendamento;
  onEdit: () => void;
  onQuickAction: (action: "whatsapp" | "ligacao") => void;
  onClick: () => void;
}

export function CardOportunidade({
  agendamento,
  onEdit,
  onQuickAction,
  onClick,
}: CardOportunidadeProps) {
  const { completedItems, totalItems, isComplete } = useChecklistWithProgress(
    agendamento.id,
    agendamento.status as AgendamentoStatus
  );

  const getInitials = (nome: string) => {
    return nome
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return null;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getTimeInStage = () => {
    const createdAt = new Date(agendamento.created_at || new Date());
    return formatDistanceToNow(createdAt, { locale: ptBR, addSuffix: false });
  };

  const prioridade = (agendamento.prioridade || "medio") as Prioridade;

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (agendamento.paciente?.telefone) {
      const phone = agendamento.paciente.telefone.replace(/\D/g, "");
      window.open(`https://wa.me/55${phone}`, "_blank");
    }
    onQuickAction("whatsapp");
  };

  const handleLigacao = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (agendamento.paciente?.telefone) {
      window.open(`tel:${agendamento.paciente.telefone}`, "_blank");
    }
    onQuickAction("ligacao");
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const hasValue = Number(agendamento.valor_previsto) > 0;

  return (
    <Card
      className="cursor-pointer hover:ring-1 hover:ring-primary/50 transition-all group bg-card border-border/50"
      onClick={onClick}
    >
      <div className="p-3 space-y-2">
        {/* Row 1: Avatar + Name + Priority */}
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium">
              {agendamento.paciente?.nome
                ? getInitials(agendamento.paciente.nome)
                : "?"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate leading-tight">
              {agendamento.paciente?.nome || "Paciente"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {agendamento.tratamento?.nome || "Sem procedimento"}
            </p>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center text-sm shrink-0",
                  PRIORIDADE_COLORS[prioridade]
                )}
              >
                {PRIORIDADE_ICONS[prioridade]}
              </div>
            </TooltipTrigger>
            <TooltipContent side="left">
              {PRIORIDADE_LABELS[prioridade]}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Row 2: Value + Checklist + Time */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            {hasValue && (
              <span className="font-semibold text-primary">
                {formatCurrency(Number(agendamento.valor_previsto))}
              </span>
            )}
            
            {agendamento.origem && (
              <span className="text-muted-foreground truncate">
                {agendamento.origem.nome}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Checklist Badge */}
            {totalItems > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className={cn(
                      "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium",
                      isComplete 
                        ? "bg-[hsl(145,60%,45%)]/15 text-[hsl(145,60%,45%)]" 
                        : "bg-warning/15 text-warning"
                    )}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Circle className="h-3 w-3" />
                    )}
                    {completedItems}/{totalItems}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {isComplete ? "Checklist completo" : "Clique para ver checklist"}
                </TooltipContent>
              </Tooltip>
            )}

            <span className="text-muted-foreground/70">
              {getTimeInStage()}
            </span>
          </div>
        </div>

        {/* Row 3: Quick Actions - Only on hover */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity -mb-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={handleWhatsApp}
            disabled={!agendamento.paciente?.telefone}
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            WhatsApp
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={handleLigacao}
            disabled={!agendamento.paciente?.telefone}
          >
            <Phone className="h-3 w-3 mr-1" />
            Ligar
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs ml-auto"
            onClick={handleEdit}
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
