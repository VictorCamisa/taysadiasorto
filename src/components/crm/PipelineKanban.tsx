import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  CRMAgendamento,
  AgendamentoStatus,
  STATUS_LABELS,
  STATUS_COLORS,
  STATUS_ICONS,
  PIPELINE_COLUMNS,
  AUXILIARY_COLUMNS,
} from "./hooks/useCRMAgendamentos";
import { CardOportunidade } from "./CardOportunidade";
import { TransicaoModal } from "./TransicaoModal";
import { InteracaoForm } from "./InteracaoForm";
import { CardActionsModal } from "./CardActionsModal";
import { cn } from "@/lib/utils";

interface PipelineKanbanProps {
  agendamentos: CRMAgendamento[];
  onEditAgendamento?: (agendamento: CRMAgendamento) => void;
  onNewAgendamento?: () => void;
}

export function PipelineKanban({
  agendamentos,
  onEditAgendamento,
  onNewAgendamento,
}: PipelineKanbanProps) {
  const navigate = useNavigate();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<AgendamentoStatus | null>(null);

  // Modal states
  const [transicaoModal, setTransicaoModal] = useState<{
    open: boolean;
    agendamentoId: string;
    fromStatus: AgendamentoStatus;
    toStatus: AgendamentoStatus;
  } | null>(null);

  const [interacaoModal, setInteracaoModal] = useState<{
    open: boolean;
    agendamentoId: string;
    tipo: "whatsapp" | "ligacao";
  } | null>(null);

  const [actionsModal, setActionsModal] = useState<{
    open: boolean;
    agendamento: CRMAgendamento;
  } | null>(null);

  const getColumnAgendamentos = (status: AgendamentoStatus) => {
    return agendamentos.filter((a) => a.status === status);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleCardClick = (agendamento: CRMAgendamento) => {
    setActionsModal({ open: true, agendamento });
  };

  const handleTransitionFromModal = (agendamento: CRMAgendamento, toStatus: AgendamentoStatus) => {
    setTransicaoModal({
      open: true,
      agendamentoId: agendamento.id,
      fromStatus: agendamento.status as AgendamentoStatus,
      toStatus,
    });
  };

  const handleDragStart = (e: React.DragEvent, agendamentoId: string) => {
    e.dataTransfer.setData("agendamentoId", agendamentoId);
    setDraggedId(agendamentoId);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, status: AgendamentoStatus) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: AgendamentoStatus) => {
    e.preventDefault();
    const agendamentoId = e.dataTransfer.getData("agendamentoId");
    const agendamento = agendamentos.find((a) => a.id === agendamentoId);

    if (agendamento && agendamento.status !== newStatus) {
      const currentIndex = PIPELINE_COLUMNS.indexOf(agendamento.status as AgendamentoStatus);
      const newIndex = PIPELINE_COLUMNS.indexOf(newStatus);
      const isAdvancing = newIndex > currentIndex && currentIndex >= 0 && newIndex >= 0;
      
      // Se está avançando, verificar checklist
      if (isAdvancing) {
        // Buscar itens do checklist diretamente
        const { supabase } = await import("@/integrations/supabase/client");
        
        const { data: checklistItems } = await supabase
          .from("pipeline_checklist_items")
          .select("id, obrigatorio")
          .eq("etapa", agendamento.status)
          .eq("ativo", true);
        
        if (checklistItems && checklistItems.length > 0) {
          const requiredItems = checklistItems.filter(i => i.obrigatorio);
          
          if (requiredItems.length > 0) {
            const { data: progress } = await supabase
              .from("pipeline_checklist_progress")
              .select("checklist_item_id, concluido")
              .eq("agendamento_id", agendamentoId);
            
            const completedRequiredCount = requiredItems.filter(item => 
              progress?.some(p => p.checklist_item_id === item.id && p.concluido)
            ).length;
            
            if (completedRequiredCount < requiredItems.length) {
              toast.error("Complete o checklist antes de avançar", {
                description: `${completedRequiredCount}/${requiredItems.length} itens obrigatórios concluídos`
              });
              setDraggedId(null);
              setDragOverColumn(null);
              return;
            }
          }
        }
      }
      
      // Open transition modal
      setTransicaoModal({
        open: true,
        agendamentoId,
        fromStatus: agendamento.status as AgendamentoStatus,
        toStatus: newStatus,
      });
    }

    setDraggedId(null);
    setDragOverColumn(null);
  };

  const handleQuickAction = (agendamentoId: string, action: "whatsapp" | "ligacao") => {
    setInteracaoModal({
      open: true,
      agendamentoId,
      tipo: action,
    });
  };

  const getColumnTotal = (status: AgendamentoStatus) => {
    return getColumnAgendamentos(status).reduce(
      (sum, a) => sum + Number(a.valor_previsto || 0),
      0
    );
  };

  const renderColumn = (status: AgendamentoStatus, isAuxiliary = false) => {
    const columnAgendamentos = getColumnAgendamentos(status);
    const columnTotal = getColumnTotal(status);
    const isDragOver = dragOverColumn === status;

    return (
      <div
        key={status}
        className={cn(
          "flex-shrink-0 w-72",
          isAuxiliary && "w-64"
        )}
        onDragOver={(e) => handleDragOver(e, status)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, status)}
      >
        <div
          className={cn(
            "h-full rounded-xl border border-border/40 bg-muted/20 transition-all",
            isDragOver && "ring-2 ring-primary/60 bg-primary/5",
            isAuxiliary && "opacity-80"
          )}
        >
          {/* Column Header */}
          <div className="px-3 py-2.5 border-b border-border/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">{STATUS_ICONS[status]}</span>
                <span className="text-sm font-medium text-foreground">
                  {STATUS_LABELS[status]}
                </span>
                <Badge 
                  variant="secondary" 
                  className="h-5 min-w-5 px-1.5 text-[10px] font-semibold justify-center"
                >
                  {columnAgendamentos.length}
                </Badge>
              </div>
              {status === "lead" && onNewAgendamento && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={onNewAgendamento}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Nova Oportunidade</TooltipContent>
                </Tooltip>
              )}
            </div>
            {columnTotal > 0 && (
              <p className="text-xs text-accent font-medium mt-1">
                {formatCurrency(columnTotal)}
              </p>
            )}
          </div>

          {/* Cards Container */}
          <ScrollArea className={cn(
            "px-2 py-2",
            isAuxiliary ? "h-[calc(100vh-400px)]" : "h-[calc(100vh-320px)]"
          )}>
            <div className="space-y-2 pb-8">
              {columnAgendamentos.map((agendamento) => (
                <div
                  key={agendamento.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, agendamento.id)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "transition-all duration-200",
                    draggedId === agendamento.id && "opacity-40 scale-95"
                  )}
                >
                  <CardOportunidade
                    agendamento={agendamento}
                    onEdit={() => onEditAgendamento?.(agendamento)}
                    onQuickAction={(action) => handleQuickAction(agendamento.id, action)}
                    onClick={() => handleCardClick(agendamento)}
                  />
                </div>
              ))}

              {columnAgendamentos.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-sm text-muted-foreground/60">
                    Nenhum lead
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-4">
        {/* Main Pipeline */}
        <div className="flex gap-3 overflow-x-auto pb-4">
          {PIPELINE_COLUMNS.map((status) => renderColumn(status))}
        </div>

        {/* Auxiliary Columns */}
        <div className="border-t pt-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Fora do Funil
          </p>
          <div className="flex gap-3 overflow-x-auto pb-4">
            {AUXILIARY_COLUMNS.map((status) => renderColumn(status, true))}
          </div>
        </div>
      </div>

      {/* Transition Modal */}
      {transicaoModal && (
        <TransicaoModal
          open={transicaoModal.open}
          onOpenChange={(open) => !open && setTransicaoModal(null)}
          agendamentoId={transicaoModal.agendamentoId}
          fromStatus={transicaoModal.fromStatus}
          toStatus={transicaoModal.toStatus}
          onSuccess={() => setTransicaoModal(null)}
        />
      )}

      {/* Interaction Modal */}
      {interacaoModal && (
        <InteracaoForm
          open={interacaoModal.open}
          onOpenChange={(open) => !open && setInteracaoModal(null)}
          agendamentoId={interacaoModal.agendamentoId}
          defaultTipo={interacaoModal.tipo}
          title={interacaoModal.tipo === "whatsapp" ? "WhatsApp Enviado" : "Ligação Realizada"}
          description="Registre o que foi conversado."
        />
      )}

      {/* Actions Modal */}
      {actionsModal && (
        <CardActionsModal
          open={actionsModal.open}
          onOpenChange={(open) => !open && setActionsModal(null)}
          agendamento={actionsModal.agendamento}
          onEdit={() => {
            onEditAgendamento?.(actionsModal.agendamento);
            setActionsModal(null);
          }}
          onTransition={(toStatus) => handleTransitionFromModal(actionsModal.agendamento, toStatus)}
          onQuickAction={(action) => {
            setInteracaoModal({
              open: true,
              agendamentoId: actionsModal.agendamento.id,
              tipo: action,
            });
          }}
        />
      )}
    </>
  );
}
