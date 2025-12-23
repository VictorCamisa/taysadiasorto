import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, ChevronLeft, ChevronRight, Clock, User } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { AgendamentoForm } from "@/components/crm/AgendamentoForm";
import {
  useCRMAgendamentos,
  useTratamentos,
  useAgendamentoMutations,
  CRMAgendamento,
  STATUS_LABELS,
  STATUS_COLORS,
  AgendamentoStatus,
} from "@/components/crm/hooks/useCRMAgendamentos";
import { toast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function Agenda() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<CRMAgendamento | null>(null);
  const [defaultFormDate, setDefaultFormDate] = useState<Date | undefined>();

  const startDate = startOfMonth(currentMonth);
  const endDate = endOfMonth(currentMonth);

  const { data: agendamentos = [], isLoading } = useCRMAgendamentos({
    startDate,
    endDate,
    status: ["agendado", "confirmado"],
  });

  const { createAgendamento, updateAgendamento } = useAgendamentoMutations();

  const handleSaveAgendamento = async (data: any) => {
    try {
      const payload = {
        ...data,
        tratamento_id: data.tratamento_id || null,
        data_agendamento: data.data_agendamento ? new Date(data.data_agendamento).toISOString() : null,
      };

      if (selectedAgendamento) {
        await updateAgendamento.mutateAsync({ id: selectedAgendamento.id, ...payload });
        toast({ title: "Agendamento atualizado!" });
      } else {
        await createAgendamento.mutateAsync(payload);
        toast({ title: "Agendamento criado!" });
      }
      setFormOpen(false);
      setSelectedAgendamento(null);
      setDefaultFormDate(undefined);
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    }
  };

  const selectedDayAgendamentos = useMemo(() => {
    return agendamentos.filter((a) =>
      a.data_agendamento && isSameDay(new Date(a.data_agendamento), selectedDate)
    ).sort((a, b) => {
      const dateA = a.data_agendamento ? new Date(a.data_agendamento).getTime() : 0;
      const dateB = b.data_agendamento ? new Date(b.data_agendamento).getTime() : 0;
      return dateA - dateB;
    });
  }, [agendamentos, selectedDate]);

  // Get dates with appointments for calendar highlighting
  const datesWithAppointments = useMemo(() => {
    return agendamentos
      .filter((a) => a.data_agendamento)
      .map((a) => new Date(a.data_agendamento!));
  }, [agendamentos]);

  const handleNewAgendamento = (date?: Date) => {
    setSelectedAgendamento(null);
    setDefaultFormDate(date || selectedDate);
    setFormOpen(true);
  };

  const handleAgendamentoClick = (agendamento: CRMAgendamento) => {
    if (agendamento.paciente_id) {
      navigate(`/crm/pacientes/${agendamento.paciente_id}`);
    }
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "HH:mm");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agenda"
        description="Visualize e gerencie os agendamentos de procedimentos"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-base">
                {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-md pointer-events-auto"
              modifiers={{
                hasAppointment: datesWithAppointments,
              }}
              modifiersClassNames={{
                hasAppointment: "bg-primary/20 font-bold",
              }}
            />
            <Button
              className="w-full mt-4"
              onClick={() => handleNewAgendamento(selectedDate)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </CardContent>
        </Card>

        {/* Day Appointments */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </CardTitle>
              <Badge variant="secondary">
                {selectedDayAgendamentos.length} agendamento(s)
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">
                Carregando...
              </div>
            ) : selectedDayAgendamentos.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>Nenhum agendamento para este dia</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => handleNewAgendamento(selectedDate)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agendar consulta
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayAgendamentos.map((agendamento) => (
                  <Card
                    key={agendamento.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleAgendamentoClick(agendamento)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Time Column */}
                        <div className="flex flex-col items-center text-center min-w-[60px]">
                          <span className="text-lg font-bold">
                            {agendamento.data_agendamento
                              ? formatTime(agendamento.data_agendamento)
                              : "--:--"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {agendamento.duracao_minutos}min
                          </span>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-12 bg-border" />

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium truncate">
                              {agendamento.paciente?.nome || "Paciente"}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {agendamento.tratamento && (
                              <Badge variant="outline" className="text-xs">
                                {agendamento.tratamento.nome}
                              </Badge>
                            )}
                            <Badge
                              className={cn(
                                "text-xs",
                                STATUS_COLORS[agendamento.status as AgendamentoStatus]
                              )}
                            >
                              {STATUS_LABELS[agendamento.status as AgendamentoStatus]}
                            </Badge>
                          </div>

                          {agendamento.observacoes && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {agendamento.observacoes}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form Modal */}
      <AgendamentoForm
        open={formOpen}
        onOpenChange={setFormOpen}
        agendamento={selectedAgendamento}
        defaultDate={defaultFormDate}
        onSave={handleSaveAgendamento}
        isLoading={createAgendamento.isPending || updateAgendamento.isPending}
      />
    </div>
  );
}
