import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AgendamentoStatus,
  STATUS_LABELS,
  STATUS_ICONS,
  useAgendamentoMutations,
  useInteracaoMutations,
} from "./hooks/useCRMAgendamentos";
import { toast } from "@/hooks/use-toast";

interface TransicaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agendamentoId: string;
  fromStatus: AgendamentoStatus;
  toStatus: AgendamentoStatus;
  onSuccess?: () => void;
}

export function TransicaoModal({
  open,
  onOpenChange,
  agendamentoId,
  fromStatus,
  toStatus,
  onSuccess,
}: TransicaoModalProps) {
  const [observacao, setObservacao] = useState("");
  const [dataAgendamento, setDataAgendamento] = useState<Date | undefined>();
  const [horaAgendamento, setHoraAgendamento] = useState("09:00");
  const [motivoPerda, setMotivoPerda] = useState("");
  const [valorOrcamento, setValorOrcamento] = useState("");

  const { updateAgendamento, updateStatus } = useAgendamentoMutations();
  const { createInteracao } = useInteracaoMutations();

  const getTransitionConfig = () => {
    // Lead → Em Negociação
    if (fromStatus === "lead" && toStatus === "em_negociacao") {
      return {
        title: "Iniciar Negociação",
        description: "Registre o primeiro contato com o lead.",
        showObservacao: true,
        interacaoTipo: "nota" as const,
      };
    }

    // Em Negociação → Orçamento Enviado
    if (fromStatus === "em_negociacao" && toStatus === "orcamento_enviado") {
      return {
        title: "Enviar Orçamento",
        description: "Registre o valor do orçamento enviado.",
        showValor: true,
        showObservacao: true,
        interacaoTipo: "nota" as const,
      };
    }

    // Orçamento Enviado → Agendado
    if (fromStatus === "orcamento_enviado" && toStatus === "agendado") {
      return {
        title: "Agendar Procedimento",
        description: "Defina a data e horário do agendamento.",
        showAgendamento: true,
        showObservacao: true,
        interacaoTipo: "nota" as const,
      };
    }

    // Agendado → Confirmado
    if (fromStatus === "agendado" && toStatus === "confirmado") {
      return {
        title: "Confirmar Presença",
        description: "O cliente confirmou o agendamento.",
        showObservacao: true,
        autoConfirm: true,
        interacaoTipo: "nota" as const,
      };
    }

    // Confirmado → Realizado
    if (fromStatus === "confirmado" && toStatus === "realizado") {
      return {
        title: "Registrar Realização",
        description: "O procedimento foi realizado com sucesso.",
        showObservacao: true,
        interacaoTipo: "nota" as const,
      };
    }

    // Qualquer → Perdido
    if (toStatus === "perdido") {
      return {
        title: "Registrar Perda",
        description: "Por que esse lead foi perdido?",
        showMotivo: true,
        interacaoTipo: "nota" as const,
      };
    }

    // Perdido/Reativação → Em Negociação (reativação)
    if ((fromStatus === "perdido" || fromStatus === "reativacao") && toStatus === "em_negociacao") {
      return {
        title: "Reativar Lead",
        description: "Dê uma nova chance a esse lead.",
        showObservacao: true,
        interacaoTipo: "nota" as const,
      };
    }

    // Default
    return {
      title: `Mover para ${STATUS_LABELS[toStatus]}`,
      description: "Confirme a mudança de status.",
      showObservacao: true,
      interacaoTipo: "nota" as const,
    };
  };

  const config = getTransitionConfig();

  const handleSubmit = async () => {
    try {
      const updates: Record<string, unknown> = { status: toStatus };

      if (config.showAgendamento && dataAgendamento) {
        const [hours, minutes] = horaAgendamento.split(":").map(Number);
        const fullDate = new Date(dataAgendamento);
        fullDate.setHours(hours, minutes, 0, 0);
        updates.data_agendamento = fullDate.toISOString();
      }

      if (config.showMotivo && motivoPerda) {
        updates.motivo_cancelamento = motivoPerda;
      }

      if (config.showValor && valorOrcamento) {
        updates.valor_previsto = parseFloat(valorOrcamento.replace(/\D/g, "")) / 100;
      }

      // Atualiza o agendamento
      await updateAgendamento.mutateAsync({
        id: agendamentoId,
        ...updates,
      });

      // Registra a interação
      if (observacao || config.showMotivo) {
        await createInteracao.mutateAsync({
          agendamento_id: agendamentoId,
          tipo: config.interacaoTipo,
          observacao: config.showMotivo ? motivoPerda : observacao,
        });
      }

      toast({
        title: "Status atualizado!",
        description: `Movido para ${STATUS_LABELS[toStatus]}`,
      });

      onOpenChange(false);
      onSuccess?.();
      
      // Reset form
      setObservacao("");
      setDataAgendamento(undefined);
      setHoraAgendamento("09:00");
      setMotivoPerda("");
      setValorOrcamento("");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({ title: "Erro ao atualizar", description: errorMessage, variant: "destructive" });
    }
  };

  const isLoading = updateAgendamento.isPending || updateStatus.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{STATUS_ICONS[toStatus]}</span>
            {config.title}
          </DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {config.showValor && (
            <div className="space-y-2">
              <Label htmlFor="valor">Valor do Orçamento</Label>
              <Input
                id="valor"
                placeholder="R$ 0,00"
                value={valorOrcamento}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  const formatted = (parseInt(value || "0") / 100).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  });
                  setValorOrcamento(formatted);
                }}
              />
            </div>
          )}

          {config.showAgendamento && (
            <>
              <div className="space-y-2">
                <Label>Data do Agendamento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dataAgendamento && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataAgendamento ? (
                        format(dataAgendamento, "PPP", { locale: ptBR })
                      ) : (
                        "Selecione uma data"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataAgendamento}
                      onSelect={setDataAgendamento}
                      locale={ptBR}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hora">Horário</Label>
                <Input
                  id="hora"
                  type="time"
                  value={horaAgendamento}
                  onChange={(e) => setHoraAgendamento(e.target.value)}
                />
              </div>
            </>
          )}

          {config.showMotivo && (
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo da Perda</Label>
              <Textarea
                id="motivo"
                placeholder="Por que o lead foi perdido?"
                value={motivoPerda}
                onChange={(e) => setMotivoPerda(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {config.showObservacao && !config.showMotivo && (
            <div className="space-y-2">
              <Label htmlFor="observacao">Observação (opcional)</Label>
              <Textarea
                id="observacao"
                placeholder="Adicione uma nota sobre essa transição..."
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Salvando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
