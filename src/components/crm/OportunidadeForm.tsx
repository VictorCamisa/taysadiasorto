import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { usePacientes, useTratamentos, CRMAgendamento } from "./hooks/useCRMAgendamentos";

const oportunidadeSchema = z.object({
  paciente_id: z.string().min(1, "Paciente é obrigatório"),
  tratamento_id: z.string().optional(),
  valor_previsto: z.coerce.number().min(0).optional(),
  observacoes: z.string().optional(),
});

type OportunidadeFormData = z.infer<typeof oportunidadeSchema>;

interface OportunidadeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  oportunidade?: CRMAgendamento | null;
  onSave: (data: OportunidadeFormData) => Promise<void>;
  isLoading?: boolean;
}

export function OportunidadeForm({
  open,
  onOpenChange,
  oportunidade,
  onSave,
  isLoading,
}: OportunidadeFormProps) {
  const { data: pacientes = [] } = usePacientes();
  const { data: tratamentos = [] } = useTratamentos();

  const form = useForm<OportunidadeFormData>({
    resolver: zodResolver(oportunidadeSchema),
    defaultValues: {
      paciente_id: "",
      tratamento_id: "",
      valor_previsto: 0,
      observacoes: "",
    },
  });

  useEffect(() => {
    if (oportunidade) {
      form.reset({
        paciente_id: oportunidade.paciente_id,
        tratamento_id: oportunidade.tratamento_id || "",
        valor_previsto: Number(oportunidade.valor_previsto) || 0,
        observacoes: oportunidade.observacoes || "",
      });
    } else {
      form.reset({
        paciente_id: "",
        tratamento_id: "",
        valor_previsto: 0,
        observacoes: "",
      });
    }
  }, [oportunidade, open, form]);

  const handleSubmit = async (data: OportunidadeFormData) => {
    await onSave({
      ...data,
      tratamento_id: data.tratamento_id === "none" ? undefined : data.tratamento_id,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {oportunidade ? "Editar Oportunidade" : "Nova Oportunidade"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="paciente_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paciente/Lead *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o paciente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pacientes.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tratamento_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tratamento de Interesse</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || "none"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tratamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {tratamentos.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valor_previsto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Previsto (R$)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Anotações sobre a oportunidade..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
