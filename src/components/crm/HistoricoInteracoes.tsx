import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageSquare, Phone, Mail, Users, FileText, Clock } from "lucide-react";
import {
  CRMInteracao,
  INTERACAO_LABELS,
  INTERACAO_ICONS,
  InteracaoTipo,
} from "./hooks/useCRMAgendamentos";
import { cn } from "@/lib/utils";

interface HistoricoInteracoesProps {
  pacienteId: string;
}

const INTERACAO_ICON_COMPONENTS: Record<InteracaoTipo, React.ComponentType<{ className?: string }>> = {
  whatsapp: MessageSquare,
  ligacao: Phone,
  email: Mail,
  reuniao: Users,
  nota: FileText,
};

export function HistoricoInteracoes({ pacienteId }: HistoricoInteracoesProps) {
  const { data: interacoes = [], isLoading } = useQuery({
    queryKey: ["paciente-interacoes", pacienteId],
    queryFn: async () => {
      // Buscar todos os agendamentos do paciente
      const { data: agendamentos, error: agendamentosError } = await supabase
        .from("crm_agendamentos")
        .select("id")
        .eq("paciente_id", pacienteId);

      if (agendamentosError) throw agendamentosError;
      if (!agendamentos || agendamentos.length === 0) return [];

      const agendamentoIds = agendamentos.map((a) => a.id);

      // Buscar interações desses agendamentos
      const { data, error } = await supabase
        .from("crm_interacoes")
        .select("*")
        .in("agendamento_id", agendamentoIds)
        .order("data_contato", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as CRMInteracao[];
    },
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch {
      return "";
    }
  };

  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      return formatDistanceToNow(new Date(dateString), { locale: ptBR, addSuffix: true });
    } catch {
      return "";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico de Contatos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico de Contatos
          </CardTitle>
          <Badge variant="secondary">{interacoes.length} registros</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {interacoes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum contato registrado</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {interacoes.map((interacao) => {
                const tipo = interacao.tipo as InteracaoTipo;
                const IconComponent = INTERACAO_ICON_COMPONENTS[tipo] || FileText;

                return (
                  <div
                    key={interacao.id}
                    className="flex gap-3 pb-4 border-b last:border-0"
                  >
                    <div
                      className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                        tipo === "whatsapp" && "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
                        tipo === "ligacao" && "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
                        tipo === "email" && "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
                        tipo === "reuniao" && "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
                        tipo === "nota" && "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      )}
                    >
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {INTERACAO_LABELS[tipo] || tipo}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {getTimeAgo(interacao.data_contato)}
                        </span>
                      </div>
                      {interacao.observacao && (
                        <p className="text-sm text-muted-foreground">
                          {interacao.observacao}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(interacao.data_contato)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
