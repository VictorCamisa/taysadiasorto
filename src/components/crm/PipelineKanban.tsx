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
          "flex-shrink-0",
          isAuxiliary ? "w-60" : "w-72"
        )}
        onDragOver={(e) => handleDragOver(e, status)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, status)}
      >
        <Card
          className={cn(
            "h-full transition-colors",
            isDragOver && "ring-2 ring-primary ring-offset-2",
            isAuxiliary && "opacity-80"
          )}
        >
          <CardHeader className="pb-2 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">{STATUS_ICONS[status]}</span>
                <CardTitle className="text-sm font-medium">
                  {STATUS_LABELS[status]}
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {columnAgendamentos.length}
                </Badge>
              </div>
              {status === "lead" && onNewAgendamento && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={onNewAgendamento}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Nova Oportunidade</TooltipContent>
                </Tooltip>
              )}
            </div>
            {columnTotal > 0 && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                {formatCurrency(columnTotal)}
              </p>
            )}
          </CardHeader>
          <CardContent className="p-2">
            <ScrollArea className={cn(
              isAuxiliary ? "h-[calc(100vh-380px)]" : "h-[calc(100vh-340px)]"
            )}>
              <div className="space-y-2 pr-2">
                {columnAgendamentos.map((agendamento) => (
                  <div
                    key={agendamento.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, agendamento.id)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "transition-opacity",
                      draggedId === agendamento.id && "opacity-50"
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
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    <p>Nenhum item</p>
                    {status === "lead" && (
                      <p className="text-xs mt-1">Arraste leads para cá</p>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
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
