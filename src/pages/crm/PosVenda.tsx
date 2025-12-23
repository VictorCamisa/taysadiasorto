import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart, Search, Phone, User, MessageSquare, X, Star, Calendar } from "lucide-react";
import {
  useCRMAgendamentos,
  useTratamentos,
  useInteracaoMutations,
  AgendamentoStatus,
} from "@/components/crm/hooks/useCRMAgendamentos";
import { InteracaoForm } from "@/components/crm/InteracaoForm";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export default function PosVenda() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTratamento, setSelectedTratamento] = useState<string>("all");
  const [interacaoModal, setInteracaoModal] = useState<{ open: boolean; agendamentoId: string } | null>(null);

  const { data: allAgendamentos = [], isLoading } = useCRMAgendamentos({
    status: ["realizado"],
  });
  const { data: tratamentos = [] } = useTratamentos();
  const { createInteracao } = useInteracaoMutations();

  // Filtrar clientes realizados
  const clientes = allAgendamentos.filter((a) => {
    const matchesTratamento = selectedTratamento === "all" || a.tratamento_id === selectedTratamento;
    const matchesSearch = searchTerm === "" || 
      a.paciente?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.tratamento?.nome?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTratamento && matchesSearch;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTratamento("all");
  };

  const hasActiveFilters = searchTerm || selectedTratamento !== "all";

  // Clientes sem contato há mais de 30 dias
  const clientesSemContato = clientes.filter((c) => {
    if (!c.data_ultimo_contato) return true;
    const diffDays = (Date.now() - new Date(c.data_ultimo_contato).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > 30;
  });

  // KPIs
  const totalRealizados = clientes.length;
  const valorTotal = clientes.reduce((sum, a) => sum + Number(a.valor_realizado || a.valor_previsto || 0), 0);
  const precisamContato = clientesSemContato.length;

  const handleQuickContact = async (agendamentoId: string, tipo: "whatsapp" | "ligacao") => {
    try {
      await createInteracao.mutateAsync({
        agendamento_id: agendamentoId,
        tipo,
        observacao: tipo === "whatsapp" ? "Follow-up via WhatsApp" : "Follow-up via ligação",
      });
      toast({
        title: "Contato registrado!",
        description: "Último contato atualizado com sucesso.",
      });
    } catch {
      toast({
        title: "Erro ao registrar",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pós-venda"
        description="Acompanhe e fidelize clientes após procedimentos realizados"
        icon={<Heart className="h-6 w-6 text-primary" />}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Star className="h-4 w-4" />
              Clientes Realizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalRealizados}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              💰 Valor Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(valorTotal)}</p>
          </CardContent>
        </Card>
        <Card className={precisamContato > 0 ? "border-amber-500/50" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Precisam Contato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${precisamContato > 0 ? "text-amber-600" : ""}`}>
              {precisamContato}
            </p>
            <p className="text-xs text-muted-foreground">+30 dias sem contato</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              📊 Taxa Retenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">—</p>
            <p className="text-xs text-muted-foreground">Em breve</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por paciente ou tratamento..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedTratamento} onValueChange={setSelectedTratamento}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tratamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos tratamentos</SelectItem>
                {tratamentos.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Carregando...</p>
          ) : clientes.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Nenhum cliente realizado encontrado
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tratamento</TableHead>
                  <TableHead>Data Realização</TableHead>
                  <TableHead>Último Contato</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map((cliente) => {
                  const precisaContato = !cliente.data_ultimo_contato || 
                    (Date.now() - new Date(cliente.data_ultimo_contato).getTime()) / (1000 * 60 * 60 * 24) > 30;

                  return (
                    <TableRow 
                      key={cliente.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => cliente.paciente_id && navigate(`/crm/pacientes/${cliente.paciente_id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{cliente.paciente?.nome || "—"}</p>
                            {cliente.paciente?.telefone && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {cliente.paciente.telefone}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{cliente.tratamento?.nome || "—"}</TableCell>
                      <TableCell>
                        {cliente.updated_at && (
                          <div>
                            <p className="font-medium">
                              {format(new Date(cliente.updated_at), "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(cliente.updated_at), { locale: ptBR, addSuffix: true })}
                            </p>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {cliente.data_ultimo_contato ? (
                          <div>
                            <p className={precisaContato ? "text-amber-600 font-medium" : ""}>
                              {formatDistanceToNow(new Date(cliente.data_ultimo_contato), { locale: ptBR, addSuffix: true })}
                            </p>
                            {precisaContato && (
                              <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs">
                                Precisa contato
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-amber-600 border-amber-300">
                            Nunca contatado
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-emerald-600">
                        {formatCurrency(Number(cliente.valor_realizado || cliente.valor_previsto || 0))}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickContact(cliente.id, "whatsapp");
                            }}
                          >
                            📱
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickContact(cliente.id, "ligacao");
                            }}
                          >
                            📞
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInteracaoModal({ open: true, agendamentoId: cliente.id });
                            }}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {interacaoModal && (
        <InteracaoForm
          open={interacaoModal.open}
          onOpenChange={(open) => !open && setInteracaoModal(null)}
          agendamentoId={interacaoModal.agendamentoId}
          title="Registrar Contato de Pós-venda"
          description="Registre o contato realizado com o cliente."
        />
      )}
    </div>
  );
}
