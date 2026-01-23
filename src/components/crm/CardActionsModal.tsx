import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  User,
  ArrowRight,
  Edit,
  MessageSquare,
  Phone,
  Calendar,
  DollarSign,
  ChevronRight,
  ChevronDown,
  XCircle,
  RotateCcw,
  Lock,
  CheckCircle2,
} from "lucide-react";
import {
  CRMAgendamento,
  AgendamentoStatus,
  STATUS_LABELS,
  STATUS_ICONS,
  PIPELINE_COLUMNS,
  PRIORIDADE_COLORS,
  PRIORIDADE_ICONS,
  PRIORIDADE_LABELS,
  Prioridade,
} from "./hooks/useCRMAgendamentos";
import { useChecklistWithProgress, useChecklistProgressMutations } from "./hooks/usePipelineChecklist";
import { cn } from "@/lib/utils";

interface CardActionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agendamento: CRMAgendamento;
  onEdit: () => void;
  onTransition: (toStatus: AgendamentoStatus) => void;
  onQuickAction: (action: "whatsapp" | "ligacao") => void;
}

export function CardActionsModal({
  open,
  onOpenChange,
  agendamento,
  onEdit,
  onTransition,
  onQuickAction,
}: CardActionsModalProps) {
  const navigate = useNavigate();
  const [checklistOpen, setChecklistOpen] = useState(true);
  const currentStatus = agendamento.status as AgendamentoStatus;
  
  // Buscar checklist da etapa atual
  const { items, completedItems, totalItems, progressPercent, isComplete } = useChecklistWithProgress(
    agendamento.id,
    currentStatus
  );
  
  const { toggleProgress } = useChecklistProgressMutations();
  
  const handleToggleItem = (itemId: string, currentlyCompleted: boolean) => {
    toggleProgress.mutate({
      agendamentoId: agendamento.id,
      checklistItemId: itemId,
      concluido: !currentlyCompleted,
    });
  };

  const getInitials = (nome: string) => {
    return nome
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return "Não informado";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const currentIndex = PIPELINE_COLUMNS.indexOf(currentStatus);
  const prioridade = (agendamento.prioridade || "medio") as Prioridade;

  // Próximo status no pipeline
  const nextStatus = currentIndex >= 0 && currentIndex < PIPELINE_COLUMNS.length - 1 
    ? PIPELINE_COLUMNS[currentIndex + 1] 
    : null;

  // Status anterior no pipeline
  const prevStatus = currentIndex > 0 
    ? PIPELINE_COLUMNS[currentIndex - 1] 
    : null;

  // Verificar se pode avançar (checklist completo ou sem itens)
  const canAdvance = totalItems === 0 || isComplete;

  const handleOpenFicha = () => {
    if (agendamento.paciente_id) {
      navigate(`/crm/pacientes/${agendamento.paciente_id}`);
      onOpenChange(false);
    }
  };

  const handleWhatsApp = () => {
    if (agendamento.paciente?.telefone) {
      const phone = agendamento.paciente.telefone.replace(/\D/g, "");
      window.open(`https://wa.me/55${phone}`, "_blank");
    }
    onQuickAction("whatsapp");
    onOpenChange(false);
  };

  const handleLigacao = () => {
    if (agendamento.paciente?.telefone) {
      window.open(`tel:${agendamento.paciente.telefone}`, "_blank");
    }
    onQuickAction("ligacao");
    onOpenChange(false);
  };

  const handleEdit = () => {
    onEdit();
    onOpenChange(false);
  };

  const handleTransition = (toStatus: AgendamentoStatus) => {
    onTransition(toStatus);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        {/* Header com tratamento */}
        <div className="bg-primary px-4 py-3 flex items-center justify-between">
          <p className="text-base font-semibold text-primary-foreground">
            {agendamento.tratamento?.nome || "Sem procedimento"}
          </p>
          {isComplete && totalItems > 0 && (
            <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
          )}
        </div>

        {/* Info do paciente */}
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {agendamento.paciente?.nome
                  ? getInitials(agendamento.paciente.nome)
                  : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-foreground">
                {agendamento.paciente?.nome || "Paciente"}
              </p>
              {agendamento.paciente?.telefone && (
                <p className="text-sm text-muted-foreground">
                  {agendamento.paciente.telefone}
                </p>
              )}
            </div>
            <Badge
              variant="secondary"
              className={cn(
                "text-base h-9 w-9 rounded-full flex items-center justify-center p-0",
                PRIORIDADE_COLORS[prioridade]
              )}
            >
              {PRIORIDADE_ICONS[prioridade]}
            </Badge>
          </div>

          {/* Info extra */}
          <div className="flex flex-wrap gap-2">
            {agendamento.origem && (
              <Badge variant="outline" className="text-xs">
                {agendamento.origem.nome}
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {STATUS_ICONS[currentStatus]} {STATUS_LABELS[currentStatus]}
            </Badge>
          </div>

          {/* Valor */}
          <div className="flex items-center gap-2 text-lg font-bold text-primary">
            <DollarSign className="h-5 w-5" />
            {formatCurrency(Number(agendamento.valor_previsto))}
          </div>

          {/* Checklist Progress */}
          {items.length > 0 && (
            <Collapsible open={checklistOpen} onOpenChange={setChecklistOpen}>
              <div className="space-y-2 p-3 rounded-lg bg-muted/50">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform",
                        !checklistOpen && "-rotate-90"
                      )} />
                      <span className="font-medium">Checklist da etapa</span>
                    </div>
                    <span className={cn(
                      "font-semibold",
                      isComplete ? "text-[hsl(145,60%,45%)]" : "text-muted-foreground"
                    )}>
                      {completedItems}/{totalItems}
                    </span>
                  </div>
                </CollapsibleTrigger>
                <Progress value={progressPercent} className="h-2" />
                
                <CollapsibleContent>
                  <ScrollArea className="max-h-48 mt-3">
                    <div className="space-y-2">
                      {items.map((item) => {
                        const isChecked = item.progress?.concluido ?? false;
                        return (
                          <div
                            key={item.id}
                            className={cn(
                              "flex items-start gap-3 p-2 rounded-md transition-colors cursor-pointer hover:bg-background",
                              isChecked && "opacity-70"
                            )}
                            onClick={() => handleToggleItem(item.id, isChecked)}
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => handleToggleItem(item.id, isChecked)}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "text-sm font-medium leading-tight",
                                isChecked && "line-through text-muted-foreground"
                              )}>
                                {item.titulo}
                                {item.obrigatorio && (
                                  <span className="text-destructive ml-1">*</span>
                                )}
                              </p>
                              {item.descricao && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {item.descricao}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CollapsibleContent>
                
                {!isComplete && (
                  <p className="text-xs text-warning flex items-center gap-1 mt-2">
                    <Lock className="h-3 w-3" />
                    Complete os itens obrigatórios (*) para avançar
                  </p>
                )}
              </div>
            </Collapsible>
          )}
        </div>

        <Separator />

        {/* Ações principais */}
        <div className="p-2">
          <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Ações Rápidas
          </p>
          
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-11"
            onClick={handleOpenFicha}
          >
            <User className="h-4 w-4 text-primary" />
            <span>Abrir Ficha do Paciente</span>
            <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-11"
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4 text-primary" />
            <span>Editar Oportunidade</span>
            <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-11"
            onClick={handleWhatsApp}
            disabled={!agendamento.paciente?.telefone}
          >
            <MessageSquare className="h-4 w-4 text-primary" />
            <span>Enviar WhatsApp</span>
            <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-11"
            onClick={handleLigacao}
            disabled={!agendamento.paciente?.telefone}
          >
            <Phone className="h-4 w-4 text-primary" />
            <span>Fazer Ligação</span>
            <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
          </Button>
        </div>

        <Separator />

        {/* Mover no Pipeline */}
        <div className="p-2">
          <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Mover no Pipeline
          </p>

          {nextStatus && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 h-11",
                      canAdvance 
                        ? "text-primary hover:text-primary hover:bg-primary/10"
                        : "text-muted-foreground opacity-60 cursor-not-allowed"
                    )}
                    onClick={() => canAdvance && handleTransition(nextStatus)}
                    disabled={!canAdvance}
                  >
                    {canAdvance ? (
                      <ArrowRight className="h-4 w-4" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                    <span>Avançar para {STATUS_LABELS[nextStatus]}</span>
                    <span className="ml-auto">{STATUS_ICONS[nextStatus]}</span>
                  </Button>
                </div>
              </TooltipTrigger>
              {!canAdvance && (
                <TooltipContent>
                  Complete o checklist antes de avançar
                </TooltipContent>
              )}
            </Tooltip>
          )}

          {prevStatus && (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-11 text-muted-foreground"
              onClick={() => handleTransition(prevStatus)}
            >
              <RotateCcw className="h-4 w-4" />
              <span>Voltar para {STATUS_LABELS[prevStatus]}</span>
              <span className="ml-auto">{STATUS_ICONS[prevStatus]}</span>
            </Button>
          )}

          {currentStatus !== "perdido" && (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-11 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => handleTransition("perdido")}
            >
              <XCircle className="h-4 w-4" />
              <span>Marcar como Perdido</span>
            </Button>
          )}

          {currentStatus === "perdido" && (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-11 text-primary hover:text-primary hover:bg-primary/10"
              onClick={() => handleTransition("em_negociacao")}
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reativar Lead</span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
