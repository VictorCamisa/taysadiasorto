import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Calendar, Search, Phone, Clock, User, X } from "lucide-react";
import {
  useCRMAgendamentos,
  useTratamentos,
  STATUS_LABELS,
  STATUS_COLORS,
  STATUS_ICONS,
  AgendamentoStatus,
} from "@/components/crm/hooks/useCRMAgendamentos";
import { useNavigate } from "react-router-dom";

export default function Agendamentos() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedTratamento, setSelectedTratamento] = useState<string>("all");

  // Status que representam agendamentos
  const agendamentoStatuses: AgendamentoStatus[] = ["agendado", "confirmado"];

  const { data: allAgendamentos = [], isLoading } = useCRMAgendamentos();
  const { data: tratamentos = [] } = useTratamentos();

  // Filtrar apenas agendamentos (status agendado ou confirmado)
  const agendamentos = allAgendamentos.filter((a) => {
    const matchesStatus = selectedStatus === "all" 
      ? agendamentoStatuses.includes(a.status as AgendamentoStatus)
      : a.status === selectedStatus;
    const matchesTratamento = selectedTratamento === "all" || a.tratamento_id === selectedTratamento;
    const matchesSearch = searchTerm === "" || 
      a.paciente?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.tratamento?.nome?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesTratamento && matchesSearch;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSelectedTratamento("all");
  };

  const hasActiveFilters = searchTerm || selectedStatus !== "all" || selectedTratamento !== "all";

  // KPIs
  const totalAgendados = allAgendamentos.filter(a => a.status === "agendado").length;
  const totalConfirmados = allAgendamentos.filter(a => a.status === "confirmado").length;
  const agendamentosHoje = allAgendamentos.filter(a => {
    if (!a.data_agendamento) return false;
    const hoje = new Date().toDateString();
    return new Date(a.data_agendamento).toDateString() === hoje;
  }).length;
  const valorTotal = agendamentos.reduce((sum, a) => sum + Number(a.valor_previsto || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agendamentos"
        description="Gerencie todos os agendamentos de procedimentos"
        icon={<Calendar className="h-6 w-6 text-primary" />}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Agendados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalAgendados}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              ✅ Confirmados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">{totalConfirmados}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{agendamentosHoje}</p>
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
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                <SelectItem value="agendado">Agendado</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
              </SelectContent>
            </Select>
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
          ) : agendamentos.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Nenhum agendamento encontrado
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Tratamento</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agendamentos.map((agendamento) => (
                  <TableRow 
                    key={agendamento.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => agendamento.paciente_id && navigate(`/crm/pacientes/${agendamento.paciente_id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{agendamento.paciente?.nome || "—"}</p>
                          {agendamento.paciente?.telefone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {agendamento.paciente.telefone}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{agendamento.tratamento?.nome || "—"}</TableCell>
                    <TableCell>
                      {agendamento.data_agendamento ? (
                        <div>
                          <p className="font-medium">
                            {format(new Date(agendamento.data_agendamento), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(agendamento.data_agendamento), "HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[agendamento.status as AgendamentoStatus]}>
                        {STATUS_ICONS[agendamento.status as AgendamentoStatus]} {STATUS_LABELS[agendamento.status as AgendamentoStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-emerald-600">
                      {formatCurrency(Number(agendamento.valor_previsto || 0))}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (agendamento.paciente_id) {
                            navigate(`/crm/pacientes/${agendamento.paciente_id}`);
                          }
                        }}
                      >
                        Ver Ficha
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
