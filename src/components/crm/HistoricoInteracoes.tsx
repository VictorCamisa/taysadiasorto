import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageSquare, Phone, Mail, Users, FileText, Clock, RefreshCw, DollarSign, CalendarCheck } from "lucide-react";
import {
  CRMInteracao,
  INTERACAO_LABELS,
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
  status_change: RefreshCw,
  orcamento: DollarSign,
  agendamento: CalendarCheck,
};

const INTERACAO_COLORS: Record<InteracaoTipo, string> = {
  whatsapp: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  ligacao: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  email: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  reuniao: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  nota: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  status_change: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  orcamento: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  agendamento: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
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
        .limit(100);

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

  // Agrupa por tipo para estatísticas
  const stats = interacoes.reduce((acc, i) => {
    acc[i.tipo] = (acc[i.tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico Comercial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      {interacoes.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(stats).map(([tipo, count]) => {
            const tipoCast = tipo as InteracaoTipo;
            const IconComponent = INTERACAO_ICON_COMPONENTS[tipoCast] || FileText;
            return (
              <div
                key={tipo}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg",
                  INTERACAO_COLORS[tipoCast] || "bg-muted"
                )}
              >
                <IconComponent className="h-4 w-4" />
                <span className="text-sm font-medium">{count}</span>
                <span className="text-xs">{INTERACAO_LABELS[tipoCast] || tipo}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Histórico Comercial
            </CardTitle>
            <Badge variant="secondary">{interacoes.length} registros</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {interacoes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma interação registrada</p>
              <p className="text-xs mt-1">As mudanças de status, orçamentos e agendamentos aparecerão aqui</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                
                <div className="space-y-4">
                  {interacoes.map((interacao, index) => {
                    const tipo = interacao.tipo as InteracaoTipo;
                    const IconComponent = INTERACAO_ICON_COMPONENTS[tipo] || FileText;
                    const isStatusChange = tipo === "status_change";
                    const isOrcamento = tipo === "orcamento";
                    const isAgendamento = tipo === "agendamento";
                    const isImportant = isStatusChange || isOrcamento || isAgendamento;

                    return (
                      <div
                        key={interacao.id}
                        className="flex gap-4 relative"
                      >
                        {/* Icon */}
                        <div
                          className={cn(
                            "relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                            INTERACAO_COLORS[tipo] || "bg-muted text-muted-foreground"
                          )}
                        >
                          <IconComponent className="h-4 w-4" />
                        </div>
                        
                        {/* Content */}
                        <div className={cn(
                          "flex-1 min-w-0 pb-4",
                          isImportant && "bg-muted/50 rounded-lg p-3 -mt-1"
                        )}>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs",
                                INTERACAO_COLORS[tipo]
                              )}
                            >
                              {INTERACAO_LABELS[tipo] || tipo}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {getTimeAgo(interacao.data_contato)}
                            </span>
                          </div>
                          
                          {interacao.observacao && (
                            <p className={cn(
                              "text-sm",
                              isImportant ? "text-foreground" : "text-muted-foreground"
                            )}>
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
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}