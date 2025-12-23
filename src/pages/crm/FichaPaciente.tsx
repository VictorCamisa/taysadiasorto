import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  ClipboardList, 
  Stethoscope,
  AlertTriangle,
  Pill,
  Activity,
  Plus,
  Pencil
} from "lucide-react";
import { useFichaPacienteData, Anamnese, Prontuario } from "@/components/crm/hooks/useFichaPacienteData";
import { AnamneseForm } from "@/components/crm/AnamneseForm";
import { ProntuarioForm } from "@/components/crm/ProntuarioForm";
import { AtendimentosTimeline } from "@/components/crm/AtendimentosTimeline";
import { HistoricoInteracoes } from "@/components/crm/HistoricoInteracoes";
import { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function FichaPaciente() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { paciente, anamneses, prontuarios, isLoading, ultimaAnamnese, totalAtendimentos } = useFichaPacienteData(id);

  const [anamneseFormOpen, setAnamneseFormOpen] = useState(false);
  const [selectedAnamnese, setSelectedAnamnese] = useState<Anamnese | null>(null);
  
  const [prontuarioFormOpen, setProntuarioFormOpen] = useState(false);
  const [selectedProntuario, setSelectedProntuario] = useState<Prontuario | null>(null);

  const saveAnamnese = useMutation({
    mutationFn: async (anamnese: Partial<Anamnese> & { paciente_id: string }) => {
      if (selectedAnamnese?.id) {
        const { id: anamneseId, created_at, updated_at, ...payload } = anamnese as Anamnese;
        const { error } = await supabase
          .from("anamneses")
          .update(payload)
          .eq("id", selectedAnamnese.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("anamneses").insert(anamnese);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["anamneses", id] });
      setAnamneseFormOpen(false);
      setSelectedAnamnese(null);
      toast({ title: "Anamnese salva com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao salvar anamnese", description: error.message, variant: "destructive" });
    },
  });

  const saveProntuario = useMutation({
    mutationFn: async (prontuario: Partial<Tables<"prontuarios">> & { paciente_id: string }) => {
      if (selectedProntuario?.id) {
        const { id: prontuarioId, created_at, updated_at, ...payload } = prontuario as Tables<"prontuarios">;
        const { error } = await supabase
          .from("prontuarios")
          .update(payload)
          .eq("id", selectedProntuario.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("prontuarios").insert(prontuario);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prontuarios", id] });
      setProntuarioFormOpen(false);
      setSelectedProntuario(null);
      toast({ title: "Prontuário salvo com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao salvar prontuário", description: error.message, variant: "destructive" });
    },
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return "-";
    }
  };

  const calcularIdade = (dataNascimento: string | null) => {
    if (!dataNascimento) return null;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const getInitials = (nome: string) => {
    return nome
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/crm/pacientes")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Paciente não encontrado
          </CardContent>
        </Card>
      </div>
    );
  }

  const idade = calcularIdade(paciente.data_nascimento);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/crm/pacientes")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Patient Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={paciente.foto_url || undefined} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {getInitials(paciente.nome)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h1 className="text-2xl font-bold">{paciente.nome}</h1>
                <Badge
                  variant={paciente.ativo !== false ? "default" : "secondary"}
                  className={
                    paciente.ativo !== false
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 w-fit"
                      : "w-fit"
                  }
                >
                  {paciente.ativo !== false ? "Ativo" : "Inativo"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                {paciente.data_nascimento && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(paciente.data_nascimento)} {idade && `(${idade} anos)`}</span>
                  </div>
                )}
                {paciente.telefone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{paciente.telefone}</span>
                  </div>
                )}
                {paciente.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{paciente.email}</span>
                  </div>
                )}
                {(paciente.cidade || paciente.estado) && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {paciente.cidade && paciente.estado
                        ? `${paciente.cidade}/${paciente.estado}`
                        : paciente.cidade || paciente.estado}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-row md:flex-col gap-2">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{totalAtendimentos}</div>
                <div className="text-xs text-muted-foreground">Atendimentos</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{anamneses.length}</div>
                <div className="text-xs text-muted-foreground">Anamneses</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="resumo" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="contatos">Contatos</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="anamneses">Anamneses</TabsTrigger>
          <TabsTrigger value="prontuarios">Prontuários</TabsTrigger>
          <TabsTrigger value="dados">Dados</TabsTrigger>
        </TabsList>

        {/* Resumo Tab */}
        <TabsContent value="resumo" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Última Anamnese */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Última Anamnese
                  </CardTitle>
                  {ultimaAnamnese && (
                    <CardDescription>{formatDate(ultimaAnamnese.data_anamnese)}</CardDescription>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedAnamnese(null);
                    setAnamneseFormOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Nova
                </Button>
              </CardHeader>
              <CardContent>
                {ultimaAnamnese ? (
                  <div className="space-y-3">
                    {ultimaAnamnese.queixa_principal && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Queixa Principal</div>
                        <p className="text-sm">{ultimaAnamnese.queixa_principal}</p>
                      </div>
                    )}
                    {ultimaAnamnese.alergias && (
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                        <div>
                          <div className="text-xs font-medium text-destructive mb-1">Alergias</div>
                          <p className="text-sm">{ultimaAnamnese.alergias}</p>
                        </div>
                      </div>
                    )}
                    {ultimaAnamnese.medicamentos_uso && (
                      <div className="flex items-start gap-2">
                        <Pill className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">Medicamentos</div>
                          <p className="text-sm">{ultimaAnamnese.medicamentos_uso}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma anamnese registrada</p>
                )}
              </CardContent>
            </Card>

            {/* Últimos Prontuários */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Últimos Atendimentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {prontuarios.length > 0 ? (
                  <div className="space-y-3">
                    {prontuarios.slice(0, 3).map((prontuario) => (
                      <div key={prontuario.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                        <Activity className="h-4 w-4 text-muted-foreground mt-1" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {prontuario.tratamento?.nome || "Atendimento"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(prontuario.data_atendimento)}
                            </span>
                          </div>
                          {prontuario.evolucao && (
                            <p className="text-xs text-muted-foreground truncate">{prontuario.evolucao}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum atendimento registrado</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Observações */}
          {paciente.observacoes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{paciente.observacoes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Contatos Tab */}
        <TabsContent value="contatos" className="space-y-4">
          {id && <HistoricoInteracoes pacienteId={id} />}
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <AtendimentosTimeline
            anamneses={anamneses}
            prontuarios={prontuarios}
            onSelectAnamnese={(anamnese) => {
              setSelectedAnamnese(anamnese);
              setAnamneseFormOpen(true);
            }}
            onSelectProntuario={(prontuario) => {
              setSelectedProntuario(prontuario);
              setProntuarioFormOpen(true);
            }}
          />
        </TabsContent>

        {/* Anamneses Tab */}
        <TabsContent value="anamneses" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setSelectedAnamnese(null);
                setAnamneseFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Anamnese
            </Button>
          </div>
          {anamneses.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma anamnese registrada
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {anamneses.map((anamnese) => (
                <Card key={anamnese.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Anamnese de {formatDate(anamnese.data_anamnese)}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedAnamnese(anamnese);
                          setAnamneseFormOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {anamnese.queixa_principal && (
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">Queixa Principal</div>
                          <p className="text-sm">{anamnese.queixa_principal}</p>
                        </div>
                      )}
                      {anamnese.historico_medico && (
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">Histórico Médico</div>
                          <p className="text-sm">{anamnese.historico_medico}</p>
                        </div>
                      )}
                      {anamnese.alergias && (
                        <div>
                          <div className="text-xs font-medium text-destructive mb-1">Alergias</div>
                          <p className="text-sm">{anamnese.alergias}</p>
                        </div>
                      )}
                      {anamnese.medicamentos_uso && (
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">Medicamentos em Uso</div>
                          <p className="text-sm">{anamnese.medicamentos_uso}</p>
                        </div>
                      )}
                      {anamnese.cirurgias_anteriores && (
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">Cirurgias Anteriores</div>
                          <p className="text-sm">{anamnese.cirurgias_anteriores}</p>
                        </div>
                      )}
                      {anamnese.habitos && (
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">Hábitos</div>
                          <p className="text-sm">{anamnese.habitos}</p>
                        </div>
                      )}
                      {anamnese.contraindicacoes && (
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">Contraindicações</div>
                          <p className="text-sm">{anamnese.contraindicacoes}</p>
                        </div>
                      )}
                      {anamnese.expectativas && (
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">Expectativas</div>
                          <p className="text-sm">{anamnese.expectativas}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Prontuários Tab */}
        <TabsContent value="prontuarios" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setSelectedProntuario(null);
                setProntuarioFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Prontuário
            </Button>
          </div>
          {prontuarios.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhum prontuário registrado
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {prontuarios.map((prontuario) => (
                <Card key={prontuario.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {prontuario.tratamento?.nome || "Atendimento"}
                        </CardTitle>
                        <CardDescription>{formatDate(prontuario.data_atendimento)}</CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedProntuario(prontuario);
                          setProntuarioFormOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {prontuario.descricao_procedimento && (
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">Descrição do Procedimento</div>
                          <p className="text-sm">{prontuario.descricao_procedimento}</p>
                        </div>
                      )}
                      {prontuario.evolucao && (
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">Evolução</div>
                          <p className="text-sm">{prontuario.evolucao}</p>
                        </div>
                      )}
                      {prontuario.observacoes_clinicas && (
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">Observações Clínicas</div>
                          <p className="text-sm">{prontuario.observacoes_clinicas}</p>
                        </div>
                      )}
                      {prontuario.proximos_passos && (
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">Próximos Passos</div>
                          <p className="text-sm">{prontuario.proximos_passos}</p>
                        </div>
                      )}
                      {/* Fotos */}
                      {((prontuario.fotos_antes && prontuario.fotos_antes.length > 0) || 
                        (prontuario.fotos_depois && prontuario.fotos_depois.length > 0)) && (
                        <div className="pt-3 border-t">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {prontuario.fotos_antes && prontuario.fotos_antes.length > 0 && (
                              <div>
                                <div className="text-xs font-medium text-muted-foreground mb-2">Fotos Antes</div>
                                <div className="grid grid-cols-3 gap-2">
                                  {prontuario.fotos_antes.map((foto, index) => (
                                    <img
                                      key={index}
                                      src={foto}
                                      alt={`Antes ${index + 1}`}
                                      className="w-full h-20 object-cover rounded-lg border cursor-pointer hover:opacity-80"
                                      onClick={() => window.open(foto, '_blank')}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                            {prontuario.fotos_depois && prontuario.fotos_depois.length > 0 && (
                              <div>
                                <div className="text-xs font-medium text-muted-foreground mb-2">Fotos Depois</div>
                                <div className="grid grid-cols-3 gap-2">
                                  {prontuario.fotos_depois.map((foto, index) => (
                                    <img
                                      key={index}
                                      src={foto}
                                      alt={`Depois ${index + 1}`}
                                      className="w-full h-20 object-cover rounded-lg border cursor-pointer hover:opacity-80"
                                      onClick={() => window.open(foto, '_blank')}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Dados Pessoais Tab */}
        <TabsContent value="dados">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Nome Completo</div>
                    <p className="text-sm font-medium">{paciente.nome}</p>
                  </div>
                  {paciente.cpf && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">CPF</div>
                      <p className="text-sm">{paciente.cpf}</p>
                    </div>
                  )}
                  {paciente.data_nascimento && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">Data de Nascimento</div>
                      <p className="text-sm">{formatDate(paciente.data_nascimento)} {idade && `(${idade} anos)`}</p>
                    </div>
                  )}
                  {paciente.telefone && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">Telefone</div>
                      <p className="text-sm">{paciente.telefone}</p>
                    </div>
                  )}
                  {paciente.email && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">E-mail</div>
                      <p className="text-sm">{paciente.email}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {paciente.endereco && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">Endereço</div>
                      <p className="text-sm">{paciente.endereco}</p>
                    </div>
                  )}
                  {(paciente.cidade || paciente.estado) && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">Cidade/Estado</div>
                      <p className="text-sm">
                        {paciente.cidade && paciente.estado
                          ? `${paciente.cidade}/${paciente.estado}`
                          : paciente.cidade || paciente.estado}
                      </p>
                    </div>
                  )}
                  {paciente.cep && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">CEP</div>
                      <p className="text-sm">{paciente.cep}</p>
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Cadastrado em</div>
                    <p className="text-sm">{formatDate(paciente.created_at)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Anamnese Form */}
      <AnamneseForm
        open={anamneseFormOpen}
        onOpenChange={setAnamneseFormOpen}
        anamnese={selectedAnamnese}
        pacienteId={paciente.id}
        pacienteNome={paciente.nome}
        onSave={saveAnamnese.mutate}
        isLoading={saveAnamnese.isPending}
      />

      {/* Prontuario Form */}
      <ProntuarioForm
        open={prontuarioFormOpen}
        onOpenChange={setProntuarioFormOpen}
        prontuario={selectedProntuario}
        pacienteId={paciente.id}
        pacienteNome={paciente.nome}
        onSave={saveProntuario.mutate}
        isLoading={saveProntuario.isPending}
      />
    </div>
  );
}
