import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  User, Phone, Mail, MapPin, Calendar, 
  ExternalLink, Target, FileText, DollarSign
} from "lucide-react";
import { WhatsAppConversa } from "@/hooks/useWhatsAppData";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface PatientPanelProps {
  conversa: WhatsAppConversa | null;
}

interface Paciente {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  data_nascimento: string | null;
  cpf: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  foto_url: string | null;
  observacoes: string | null;
  created_at: string;
}

interface Agendamento {
  id: string;
  status: string;
  valor_previsto: number;
  data_agendamento: string | null;
  tratamento?: { nome: string } | null;
  origem?: { nome: string } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  lead: { label: "Lead", color: "bg-blue-500" },
  em_negociacao: { label: "Em Negociação", color: "bg-amber-500" },
  orcamento_enviado: { label: "Orçamento", color: "bg-orange-500" },
  agendado: { label: "Agendado", color: "bg-purple-500" },
  ganho: { label: "Ganho", color: "bg-emerald-500" },
  perdido: { label: "Perdido", color: "bg-red-500" },
};

export function PatientPanel({ conversa }: PatientPanelProps) {
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPacienteData = async () => {
      if (!conversa?.paciente_id) {
        setPaciente(null);
        setAgendamentos([]);
        return;
      }

      setLoading(true);
      try {
        const { data: pacienteData } = await supabase
          .from("pacientes")
          .select("*")
          .eq("id", conversa.paciente_id)
          .single();

        setPaciente(pacienteData);

        const { data: agendamentosData } = await supabase
          .from("crm_agendamentos")
          .select(`
            *,
            tratamento:tratamentos(nome),
            origem:origens(nome)
          `)
          .eq("paciente_id", conversa.paciente_id)
          .order("created_at", { ascending: false })
          .limit(5);

        setAgendamentos(agendamentosData || []);
      } finally {
        setLoading(false);
      }
    };

    fetchPacienteData();
  }, [conversa?.paciente_id]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  if (!conversa) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="flex flex-col items-center">
          <div className="h-20 w-20 rounded-full bg-muted mb-4" />
          <div className="h-5 w-32 bg-muted rounded mb-2" />
          <div className="h-4 w-24 bg-muted rounded" />
        </div>
        <div className="h-24 w-full bg-muted rounded" />
        <div className="h-24 w-full bg-muted rounded" />
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-foreground mb-1">Contato não vinculado</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Este contato ainda não está vinculado a um paciente no sistema
        </p>
        <Button variant="outline" size="sm">
          Vincular paciente
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        {/* Header com avatar */}
        <div className="flex flex-col items-center text-center mb-6">
          <Avatar className="h-20 w-20 mb-4">
            <AvatarImage src={paciente.foto_url || undefined} />
            <AvatarFallback className="text-xl bg-primary/10 text-primary">
              {getInitials(paciente.nome)}
            </AvatarFallback>
          </Avatar>
          <h3 className="font-semibold text-lg">{paciente.nome}</h3>
          <p className="text-sm text-muted-foreground">
            Paciente desde {format(new Date(paciente.created_at), "MMM yyyy", { locale: ptBR })}
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3 gap-2"
            onClick={() => navigate(`/crm/pacientes/${paciente.id}`)}
          >
            <ExternalLink className="h-3 w-3" />
            Ver ficha completa
          </Button>
        </div>

        <Separator className="my-4" />

        {/* Informações de contato */}
        <div className="space-y-3 mb-6">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Contato
          </h4>
          <div className="space-y-2">
            {paciente.telefone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{paciente.telefone}</span>
              </div>
            )}
            {paciente.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{paciente.email}</span>
              </div>
            )}
            {paciente.data_nascimento && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{format(new Date(paciente.data_nascimento), "dd/MM/yyyy")}</span>
              </div>
            )}
            {(paciente.cidade || paciente.estado) && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{[paciente.cidade, paciente.estado].filter(Boolean).join(", ")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Oportunidades no Pipeline */}
        {agendamentos.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Pipeline
              </h4>
              <div className="space-y-2">
                {agendamentos.map((agendamento) => {
                  const config = STATUS_CONFIG[agendamento.status] || { label: agendamento.status, color: "bg-gray-500" };
                  return (
                    <div
                      key={agendamento.id}
                      className="p-3 rounded-lg bg-muted/50 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Badge className={cn("text-xs text-white", config.color)}>
                          {config.label}
                        </Badge>
                        {agendamento.valor_previsto > 0 && (
                          <span className="text-sm font-medium text-primary">
                            R$ {agendamento.valor_previsto.toLocaleString("pt-BR")}
                          </span>
                        )}
                      </div>
                      {agendamento.tratamento && (
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{agendamento.tratamento.nome}</span>
                        </div>
                      )}
                      {agendamento.origem && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Target className="h-3 w-3" />
                          <span>{agendamento.origem.nome}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Observações */}
        {paciente.observacoes && (
          <>
            <Separator className="my-4" />
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Observações
              </h4>
              <p className="text-sm text-muted-foreground">{paciente.observacoes}</p>
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  );
}
