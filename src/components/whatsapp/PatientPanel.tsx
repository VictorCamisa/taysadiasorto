import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User, Phone, Mail, MapPin, Calendar, FileText, DollarSign,
  ExternalLink, Link2, Target, ClipboardList
} from "lucide-react";
import { WhatsAppConversa } from "@/hooks/useWhatsAppData";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

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
        // Fetch paciente
        const { data: pacienteData } = await supabase
          .from("pacientes")
          .select("*")
          .eq("id", conversa.paciente_id)
          .single();

        setPaciente(pacienteData);

        // Fetch agendamentos
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

  if (!conversa) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <User className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Selecione uma conversa</p>
        <p className="text-sm text-muted-foreground">para ver os dados do paciente</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <Link2 className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Contato não vinculado</p>
        <p className="text-sm text-muted-foreground mb-4">
          Este contato ainda não está vinculado a um paciente
        </p>
        <Button variant="outline" size="sm">
          Vincular a paciente
        </Button>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    lead: "bg-blue-500",
    em_negociacao: "bg-yellow-500",
    orcamento_enviado: "bg-orange-500",
    agendado: "bg-purple-500",
    ganho: "bg-green-500",
    perdido: "bg-red-500",
  };

  const statusLabels: Record<string, string> = {
    lead: "Lead",
    em_negociacao: "Em Negociação",
    orcamento_enviado: "Orçamento Enviado",
    agendado: "Agendado",
    ganho: "Ganho",
    perdido: "Perdido",
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Patient Header */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={paciente.foto_url || undefined} />
            <AvatarFallback className="text-lg">
              {paciente.nome.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{paciente.nome}</h3>
            <p className="text-sm text-muted-foreground">
              Paciente desde {format(new Date(paciente.created_at), "MMM yyyy", { locale: ptBR })}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/crm/pacientes/${paciente.id}`)}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        <Separator />

        {/* Tabs */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 mt-4">
            {/* Contact Info */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Contato</CardTitle>
              </CardHeader>
              <CardContent className="py-2 space-y-2">
                {paciente.telefone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{paciente.telefone}</span>
                  </div>
                )}
                {paciente.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{paciente.email}</span>
                  </div>
                )}
                {paciente.data_nascimento && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(paciente.data_nascimento), "dd/MM/yyyy")}
                    </span>
                  </div>
                )}
                {(paciente.cidade || paciente.estado) && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {[paciente.cidade, paciente.estado].filter(Boolean).join(", ")}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {paciente.observacoes && (
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Observações</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <p className="text-sm text-muted-foreground">{paciente.observacoes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-4 mt-4">
            {agendamentos.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma oportunidade no pipeline
                  </p>
                </CardContent>
              </Card>
            ) : (
              agendamentos.map((agendamento) => (
                <Card key={agendamento.id}>
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge
                        variant="secondary"
                        className={`${statusColors[agendamento.status]} text-white`}
                      >
                        {statusLabels[agendamento.status] || agendamento.status}
                      </Badge>
                      {agendamento.valor_previsto > 0 && (
                        <span className="text-sm font-medium text-green-600">
                          R$ {agendamento.valor_previsto.toLocaleString("pt-BR")}
                        </span>
                      )}
                    </div>
                    {agendamento.tratamento && (
                      <div className="flex items-center gap-2 text-sm">
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                        <span>{agendamento.tratamento.nome}</span>
                      </div>
                    )}
                    {agendamento.origem && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Target className="h-4 w-4" />
                        <span>{agendamento.origem.nome}</span>
                      </div>
                    )}
                    {agendamento.data_agendamento && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(agendamento.data_agendamento), "dd/MM/yyyy HH:mm", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
