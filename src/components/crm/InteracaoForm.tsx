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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  InteracaoTipo,
  INTERACAO_LABELS,
  INTERACAO_ICONS,
  useInteracaoMutations,
} from "./hooks/useCRMAgendamentos";
import { toast } from "@/hooks/use-toast";

interface InteracaoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agendamentoId: string;
  defaultTipo?: InteracaoTipo;
  title?: string;
  description?: string;
}

export function InteracaoForm({
  open,
  onOpenChange,
  agendamentoId,
  defaultTipo = "nota",
  title = "Registrar Interação",
  description = "Registre o contato realizado com o cliente.",
}: InteracaoFormProps) {
  const [tipo, setTipo] = useState<InteracaoTipo>(defaultTipo);
  const [observacao, setObservacao] = useState("");
  const { createInteracao } = useInteracaoMutations();

  const handleSubmit = async () => {
    try {
      await createInteracao.mutateAsync({
        agendamento_id: agendamentoId,
        tipo,
        observacao: observacao || undefined,
      });
      toast({ title: "Interação registrada!" });
      onOpenChange(false);
      setObservacao("");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({ title: "Erro ao registrar", description: errorMessage, variant: "destructive" });
    }
  };

  const tiposInteracao: InteracaoTipo[] = ["whatsapp", "ligacao", "email", "reuniao", "nota"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de Contato</Label>
            <RadioGroup
              value={tipo}
              onValueChange={(v) => setTipo(v as InteracaoTipo)}
              className="grid grid-cols-3 gap-2"
            >
              {tiposInteracao.map((t) => (
                <div key={t}>
                  <RadioGroupItem value={t} id={t} className="peer sr-only" />
                  <Label
                    htmlFor={t}
                    className="flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                  >
                    <span className="text-lg">{INTERACAO_ICONS[t]}</span>
                    <span className="text-xs">{INTERACAO_LABELS[t]}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacao">Observação</Label>
            <Textarea
              id="observacao"
              placeholder="Descreva o que foi conversado..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={createInteracao.isPending}>
            {createInteracao.isPending ? "Salvando..." : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
