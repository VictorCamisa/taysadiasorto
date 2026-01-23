import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  User, Phone, Mail, Calendar, 
  ExternalLink, Target, FileText, ChevronRight,
  CheckCircle2, Circle, ArrowRight, AlertCircle,
  ClipboardList, Play
} from "lucide-react";
import { WhatsAppConversa } from "@/hooks/useWhatsAppData";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useChecklistWithProgress,
  useChecklistProgressMutations,
} from "@/components/crm/hooks/usePipelineChecklist";

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

// Pipeline stages configuration
const PIPELINE_STAGES = [
  { key: "lead", label: "Lead", icon: Circle, next: "em_negociacao" },
  { key: "em_negociacao", label: "Negociação", icon: Target, next: "orcamento_enviado" },
  { key: "orcamento_enviado", label: "Orçamento", icon: FileText, next: "agendado" },
  { key: "agendado", label: "Agendado", icon: Calendar, next: "confirmado" },
  { key: "confirmado", label: "Confirmado", icon: CheckCircle2, next: "realizado" },
  { key: "realizado", label: "Realizado", icon: CheckCircle2, next: null },
];

const STATUS_CONFIG: Record<string, { label: string; colorClass: string }> = {
  lead: { label: "Lead", colorClass: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  em_negociacao: { label: "Em Negociação", colorClass: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  orcamento_enviado: { label: "Orçamento", colorClass: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  agendado: { label: "Agendado", colorClass: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  confirmado: { label: "Confirmado", colorClass: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20" },
  realizado: { label: "Realizado", colorClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  perdido: { label: "Perdido", colorClass: "bg-red-500/10 text-red-600 border-red-500/20" },
};

export function PatientPanel({ conversa }: PatientPanelProps) {
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [agendamento, setAgendamento] = useState<Agendamento | null>(null);
  const [loading, setLoading] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const navigate = useNavigate();

  // Checklist hooks
  const {
    items: checklistItems,
    isLoading: checklistLoading,
    totalItems,
    completedItems,
    isComplete,
    progressPercent,
  } = useChecklistWithProgress(agendamento?.id, agendamento?.status);
  
  const { toggleProgress } = useChecklistProgressMutations();

  useEffect(() => {
    const fetchPacienteData = async () => {
      if (!conversa?.paciente_id) {
        setPaciente(null);
        setAgendamento(null);
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

        // Buscar agendamento ativo (não perdido/realizado)
        const { data: agendamentosData } = await supabase
          .from("crm_agendamentos")
          .select(`
            *,
            tratamento:tratamentos(nome),
            origem:origens(nome)
          `)
          .eq("paciente_id", conversa.paciente_id)
          .not("status", "in", '("perdido","realizado")')
          .order("created_at", { ascending: false })
          .limit(1);

        setAgendamento(agendamentosData?.[0] || null);
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

  const handleToggleChecklistItem = async (itemId: string, currentState: boolean) => {
    if (!agendamento) return;
    
    try {
      await toggleProgress.mutateAsync({
        agendamentoId: agendamento.id,
        checklistItemId: itemId,
        concluido: !currentState,
      });
    } catch (error) {
      toast.error("Erro ao atualizar checklist");
    }
  };

  const handleAdvanceStage = async () => {
    if (!agendamento || !isComplete) return;

    const currentStage = PIPELINE_STAGES.find(s => s.key === agendamento.status);
    if (!currentStage?.next) return;

    setAdvancing(true);
    try {
      const { error } = await supabase
        .from("crm_agendamentos")
        .update({ status: currentStage.next })
        .eq("id", agendamento.id);

      if (error) throw error;

      // Atualizar estado local
      setAgendamento({ ...agendamento, status: currentStage.next });
      toast.success(`Avançou para: ${STATUS_CONFIG[currentStage.next]?.label || currentStage.next}`);
    } catch (error) {
      toast.error("Erro ao avançar etapa");
    } finally {
      setAdvancing(false);
    }
  };

  const handleCreateOpportunity = async () => {
    if (!paciente) return;

    setAdvancing(true);
    try {
      const { data, error } = await supabase
        .from("crm_agendamentos")
        .insert({
          paciente_id: paciente.id,
          status: "lead",
          observacoes: "Oportunidade criada via WhatsApp",
        })
        .select(`
          *,
          tratamento:tratamentos(nome),
          origem:origens(nome)
        `)
        .single();

      if (error) throw error;
      setAgendamento(data);
      toast.success("Oportunidade criada!");
    } catch (error) {
      toast.error("Erro ao criar oportunidade");
    } finally {
      setAdvancing(false);
    }
  };

  if (!conversa) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-muted mb-3" />
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
          Este contato ainda não está vinculado a um paciente
        </p>
        <Button variant="outline" size="sm">
          Vincular paciente
        </Button>
      </div>
    );
  }

  const currentStage = PIPELINE_STAGES.find(s => s.key === agendamento?.status);
  const currentStageIndex = PIPELINE_STAGES.findIndex(s => s.key === agendamento?.status);
  const nextStage = currentStage?.next ? STATUS_CONFIG[currentStage.next] : null;

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        {/* Header compacto */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage src={paciente.foto_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(paciente.nome)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{paciente.nome}</h3>
            <p className="text-xs text-muted-foreground truncate">
              {paciente.telefone}
            </p>
          </div>
        </div>

        {/* Status atual no Pipeline */}
        {agendamento ? (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Estágio Atual
              </span>
              {agendamento.origem && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {agendamento.origem.nome}
                </span>
              )}
            </div>
            
            <div className={cn(
              "p-3 rounded-lg border",
              STATUS_CONFIG[agendamento.status]?.colorClass || "bg-muted"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {currentStage && <currentStage.icon className="h-4 w-4" />}
                  <span className="font-medium text-sm">
                    {STATUS_CONFIG[agendamento.status]?.label || agendamento.status}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {currentStageIndex + 1}/{PIPELINE_STAGES.length}
                </Badge>
              </div>
              
              {agendamento.tratamento && (
                <div className="flex items-center gap-1.5 mt-2 text-xs opacity-80">
                  <FileText className="h-3 w-3" />
                  <span>{agendamento.tratamento.nome}</span>
                </div>
              )}
              
              {agendamento.valor_previsto > 0 && (
                <div className="mt-2 text-sm font-semibold">
                  R$ {agendamento.valor_previsto.toLocaleString("pt-BR")}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-4 p-4 rounded-lg border border-dashed border-border bg-muted/30">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Sem oportunidade ativa</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Crie uma oportunidade para acompanhar este paciente no pipeline.
            </p>
            <Button 
              size="sm" 
              className="w-full gap-2" 
              onClick={handleCreateOpportunity}
              disabled={advancing}
            >
              <Play className="h-4 w-4" />
              Criar Oportunidade
            </Button>
          </div>
        )}

        {/* Checklist da etapa atual */}
        {agendamento && checklistItems.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <ClipboardList className="h-3 w-3" />
                Checklist
              </span>
              <span className="text-xs text-muted-foreground">
                {completedItems}/{totalItems}
              </span>
            </div>
            
            <Progress value={progressPercent} className="h-1.5 mb-3" />
            
            <div className="space-y-2">
              {checklistItems.map((item) => {
                const isCompleted = item.progress?.concluido || false;
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-start gap-2 p-2 rounded-md transition-colors cursor-pointer hover:bg-muted/50",
                      isCompleted && "opacity-60"
                    )}
                    onClick={() => handleToggleChecklistItem(item.id, isCompleted)}
                  >
                    <Checkbox
                      checked={isCompleted}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm",
                        isCompleted && "line-through"
                      )}>
                        {item.titulo}
                      </p>
                      {item.descricao && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.descricao}
                        </p>
                      )}
                    </div>
                    {item.obrigatorio && !isCompleted && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        Obrigatório
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Botão de avançar etapa */}
        {agendamento && nextStage && (
          <div className="mb-4">
            <Button
              className="w-full gap-2"
              disabled={!isComplete || advancing}
              onClick={handleAdvanceStage}
            >
              <ArrowRight className="h-4 w-4" />
              Avançar para {nextStage.label}
              {!isComplete && (
                <span className="text-xs opacity-70">(complete o checklist)</span>
              )}
            </Button>
          </div>
        )}

        <Separator className="my-4" />

        {/* Ações rápidas */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Ações Rápidas
          </span>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="justify-start gap-2 h-9"
              onClick={() => navigate(`/crm/pacientes/${paciente.id}`)}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ficha
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="justify-start gap-2 h-9"
              onClick={() => navigate(`/crm/pipeline`)}
            >
              <Target className="h-3.5 w-3.5" />
              Pipeline
            </Button>
            
            {paciente.telefone && (
              <Button
                variant="outline"
                size="sm"
                className="justify-start gap-2 h-9"
                onClick={() => window.open(`tel:${paciente.telefone}`, "_blank")}
              >
                <Phone className="h-3.5 w-3.5" />
                Ligar
              </Button>
            )}
            
            {paciente.email && (
              <Button
                variant="outline"
                size="sm"
                className="justify-start gap-2 h-9"
                onClick={() => window.open(`mailto:${paciente.email}`, "_blank")}
              >
                <Mail className="h-3.5 w-3.5" />
                Email
              </Button>
            )}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Info básica */}
        <div className="space-y-2 text-xs">
          <span className="font-medium text-muted-foreground uppercase tracking-wider">
            Informações
          </span>
          
          {paciente.data_nascimento && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{format(new Date(paciente.data_nascimento), "dd/MM/yyyy")}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            <span>Paciente desde {format(new Date(paciente.created_at), "MMM/yyyy", { locale: ptBR })}</span>
          </div>
        </div>

        {/* Observações */}
        {paciente.observacoes && (
          <>
            <Separator className="my-4" />
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Observações
              </span>
              <p className="text-xs text-muted-foreground">{paciente.observacoes}</p>
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  );
}