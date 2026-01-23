import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, Circle, MessageSquare, Phone, Clock, DollarSign } from "lucide-react";
import {
  CRMAgendamento,
  PRIORIDADE_ICONS,
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
  const hasValue = Number(agendamento.valor_previsto) > 0;
  const hasChecklist = totalItems > 0;

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

  // Priority indicator color based on temperature
  const getPriorityBorderColor = () => {
    if (prioridade === "alto") {
      return "border-l-destructive";
    }
    if (prioridade === "baixo") {
      return "border-l-muted-foreground/30";
    }
    return "border-l-primary/50";
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative bg-card rounded-lg border border-border/60 p-3 cursor-pointer",
        "hover:border-primary/40 hover:shadow-md transition-all duration-200",
        "border-l-[3px]",
        getPriorityBorderColor()
      )}
    >
      {/* Header: Name + Treatment + Priority Icon */}
      <div className="flex items-start gap-2.5 mb-2">
        <Avatar className="h-8 w-8 shrink-0 ring-1 ring-border">
          <AvatarFallback className="text-[10px] bg-muted text-foreground font-semibold">
            {agendamento.paciente?.nome
              ? getInitials(agendamento.paciente.nome)
              : "?"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 overflow-hidden">
          <p className="text-sm font-medium text-foreground truncate">
            {agendamento.paciente?.nome || "Paciente"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {agendamento.tratamento?.nome || "Sem procedimento"}
          </p>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-sm shrink-0">{PRIORIDADE_ICONS[prioridade]}</span>
          </TooltipTrigger>
          <TooltipContent side="left" className="text-xs">
            {prioridade === "alto" ? "Quente" : prioridade === "medio" ? "Morno" : "Frio"}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Info Row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {hasValue && (
          <Badge variant="secondary" className="h-5 px-1.5 gap-1 text-[10px] font-semibold bg-primary/10 text-primary border-0">
            <DollarSign className="h-2.5 w-2.5" />
            {formatCurrency(Number(agendamento.valor_previsto))}
          </Badge>
        )}

        {agendamento.origem && (
          <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-normal border-border/60">
            {agendamento.origem.nome}
          </Badge>
        )}

        {hasChecklist && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="outline" 
                className={cn(
                  "h-5 px-1.5 gap-0.5 text-[10px] font-medium border-0",
                  isComplete 
                    ? "bg-accent/15 text-accent" 
                    : "bg-warning/15 text-warning"
                )}
              >
                {isComplete ? (
                  <CheckCircle2 className="h-2.5 w-2.5" />
                ) : (
                  <Circle className="h-2.5 w-2.5" />
                )}
                {completedItems}/{totalItems}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {isComplete ? "Checklist completo" : "Checklist pendente"}
            </TooltipContent>
          </Tooltip>
        )}

        <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground/70 ml-auto">
          <Clock className="h-2.5 w-2.5" />
          {getTimeInStage()}
        </div>
      </div>

      {/* Hover Actions - Inside card */}
      <div className="flex gap-1 mt-2 pt-2 border-t border-border/30 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 flex-1 text-[10px] gap-1 px-2"
          onClick={handleWhatsApp}
          disabled={!agendamento.paciente?.telefone}
        >
          <MessageSquare className="h-3 w-3" />
          WhatsApp
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 flex-1 text-[10px] gap-1 px-2"
          onClick={handleLigacao}
          disabled={!agendamento.paciente?.telefone}
        >
          <Phone className="h-3 w-3" />
          Ligar
        </Button>
      </div>
    </div>
  );
}
