import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, DollarSign, Edit, MessageSquare, Phone } from "lucide-react";
import {
  CRMAgendamento,
  PRIORIDADE_COLORS,
  PRIORIDADE_ICONS,
  PRIORIDADE_LABELS,
  Prioridade,
} from "./hooks/useCRMAgendamentos";
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
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), "dd/MM HH:mm", { locale: ptBR });
    } catch {
      return null;
    }
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

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all group overflow-hidden border-0 shadow-md"
      onClick={onClick}
    >
      {/* Treatment Header - Prominent Display */}
      <div className="bg-primary px-3 py-2">
        <p className="text-sm font-semibold text-primary-foreground truncate">
          {agendamento.tratamento?.nome || "Sem procedimento"}
        </p>
      </div>

      <CardContent className="p-3 space-y-2.5">
        {/* Header with Avatar and Patient Info */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <Avatar className="h-10 w-10 shrink-0 border-2 border-primary/20">
              <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                {agendamento.paciente?.nome
                  ? getInitials(agendamento.paciente.nome)
                  : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {agendamento.paciente?.nome || "Paciente"}
              </p>
              {agendamento.paciente?.telefone && (
                <p className="text-xs text-muted-foreground truncate">
                  {agendamento.paciente.telefone}
                </p>
              )}
            </div>
          </div>

          {/* Temperature Badge */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="secondary"
                className={cn(
                  "text-base shrink-0 h-8 w-8 rounded-full flex items-center justify-center p-0",
                  PRIORIDADE_COLORS[prioridade]
                )}
              >
                {PRIORIDADE_ICONS[prioridade]}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              Lead {PRIORIDADE_LABELS[prioridade]}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Origin Badge */}
        {agendamento.origem && (
          <Badge variant="outline" className="text-xs">
            {agendamento.origem.nome}
          </Badge>
        )}

        {/* Value - Highlighted */}
        {Number(agendamento.valor_previsto) > 0 && (
          <div className="flex items-center gap-1.5 text-base font-bold text-primary">
            <DollarSign className="h-4 w-4" />
            {formatCurrency(Number(agendamento.valor_previsto))}
          </div>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {agendamento.data_agendamento && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(agendamento.data_agendamento)}
            </span>
          )}
          {agendamento.duracao_minutos && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {agendamento.duracao_minutos}min
            </span>
          )}
        </div>

        {/* Time in stage */}
        <p className="text-xs text-muted-foreground">
          há {getTimeInStage()}
        </p>

        {/* Quick Actions - Only visible on hover */}
        <div className="flex gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleWhatsApp}
                disabled={!agendamento.paciente?.telefone}
              >
                <MessageSquare className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>WhatsApp</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleLigacao}
                disabled={!agendamento.paciente?.telefone}
              >
                <Phone className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ligar</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 ml-auto"
                onClick={handleEdit}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Editar</TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );
}
