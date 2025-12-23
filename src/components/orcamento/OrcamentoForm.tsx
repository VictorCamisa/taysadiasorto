import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Orcamento } from "@/hooks/useOrcamentoData";

interface OrcamentoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orcamento?: Orcamento;
  onSubmit: (data: Omit<Orcamento, "id" | "created_at" | "updated_at">) => void;
  isLoading?: boolean;
}

export function OrcamentoForm({ open, onOpenChange, orcamento, onSubmit, isLoading }: OrcamentoFormProps) {
  const [nome, setNome] = useState(orcamento?.nome || "");
  const [periodoInicio, setPeriodoInicio] = useState<Date | undefined>(
    orcamento?.periodo_inicio ? new Date(orcamento.periodo_inicio) : undefined
  );
  const [periodoFim, setPeriodoFim] = useState<Date | undefined>(
    orcamento?.periodo_fim ? new Date(orcamento.periodo_fim) : undefined
  );
  const [status, setStatus] = useState<"rascunho" | "ativo" | "encerrado">(
    orcamento?.status || "rascunho"
  );
  const [observacoes, setObservacoes] = useState(orcamento?.observacoes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodoInicio || !periodoFim) return;

    onSubmit({
      nome,
      periodo_inicio: format(periodoInicio, "yyyy-MM-dd"),
      periodo_fim: format(periodoFim, "yyyy-MM-dd"),
      status,
      observacoes: observacoes || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {orcamento ? "Editar Orçamento" : "Novo Orçamento"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Orçamento</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Orçamento 2025"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Período Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !periodoInicio && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {periodoInicio
                      ? format(periodoInicio, "dd/MM/yyyy", { locale: ptBR })
                      : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={periodoInicio}
                    onSelect={setPeriodoInicio}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Período Fim</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !periodoFim && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {periodoFim
                      ? format(periodoFim, "dd/MM/yyyy", { locale: ptBR })
                      : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={periodoFim}
                    onSelect={setPeriodoFim}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="encerrado">Encerrado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações opcionais..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !nome || !periodoInicio || !periodoFim}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {orcamento ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
