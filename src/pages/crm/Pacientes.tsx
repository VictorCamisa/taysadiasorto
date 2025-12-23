import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Eye, UserX, UserCheck } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { usePacientesData, type Paciente } from "@/components/crm/hooks/usePacientesData";
import { PacientesKPIs } from "@/components/crm/PacientesKPIs";
import { PacientesFilters } from "@/components/crm/PacientesFilters";
import { PacienteForm } from "@/components/crm/PacienteForm";
import { PageHeader } from "@/components/PageHeader";
import { Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Pacientes() {
  const { pacientes, refetch, isLoading, kpis } = usePacientesData();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("todos");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pacienteToToggle, setPacienteToToggle] = useState<Paciente | null>(null);

  const filteredPacientes = useMemo(() => {
    return pacientes.filter((p) => {
      // Filtro de busca
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesNome = p.nome.toLowerCase().includes(searchLower);
        const matchesCpf = p.cpf?.toLowerCase().includes(searchLower);
        const matchesEmail = p.email?.toLowerCase().includes(searchLower);
        const matchesTelefone = p.telefone?.toLowerCase().includes(searchLower);
        if (!matchesNome && !matchesCpf && !matchesEmail && !matchesTelefone) return false;
      }

      // Filtro de status
      if (status === "ativos" && p.ativo === false) return false;
      if (status === "inativos" && p.ativo !== false) return false;

      return true;
    });
  }, [pacientes, search, status]);

  const savePacienteMutation = useMutation({
    mutationFn: async (paciente: Partial<Paciente> & { id?: string }) => {
      const { id, created_at, updated_at, ...payload } = paciente;
      if (id) {
        const { error } = await supabase
          .from("pacientes")
          .update(payload)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("pacientes")
          .insert({ nome: payload.nome!, ...payload });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      refetch();
      setFormOpen(false);
      setSelectedPaciente(null);
      toast({ title: "Paciente salvo com sucesso!" });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar paciente",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleAtivoMutation = useMutation({
    mutationFn: async (paciente: Paciente) => {
      const { error } = await supabase
        .from("pacientes")
        .update({ ativo: !paciente.ativo })
        .eq("id", paciente.id);
      if (error) throw error;
    },
    onSuccess: () => {
      refetch();
      setDeleteDialogOpen(false);
      setPacienteToToggle(null);
      toast({ title: "Status do paciente atualizado!" });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setFormOpen(true);
  };

  const handleNew = () => {
    setSelectedPaciente(null);
    setFormOpen(true);
  };

  const handleToggleAtivo = (paciente: Paciente) => {
    setPacienteToToggle(paciente);
    setDeleteDialogOpen(true);
  };

  const confirmToggleAtivo = () => {
    if (pacienteToToggle) {
      toggleAtivoMutation.mutate(pacienteToToggle);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return "-";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pacientes"
        description="Gerencie os pacientes da clínica"
        icon={Users}
        actions={
          <Button onClick={handleNew}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Paciente
          </Button>
        }
      />

      <PacientesKPIs
        totalPacientes={kpis.totalPacientes}
        pacientesAtivos={kpis.pacientesAtivos}
        pacientesInativos={kpis.pacientesInativos}
        novosEsteMes={kpis.novosEsteMes}
      />

      <PacientesFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
      />

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pacientes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cidade/UF</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPacientes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Nenhum paciente encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPacientes.map((paciente) => (
                    <TableRow key={paciente.id}>
                      <TableCell className="font-medium">{paciente.nome}</TableCell>
                      <TableCell>{paciente.cpf || "-"}</TableCell>
                      <TableCell>{paciente.telefone || "-"}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {paciente.email || "-"}
                      </TableCell>
                      <TableCell>
                        {paciente.cidade && paciente.estado
                          ? `${paciente.cidade}/${paciente.estado}`
                          : paciente.cidade || paciente.estado || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={paciente.ativo !== false ? "default" : "secondary"}
                          className={
                            paciente.ativo !== false
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                              : ""
                          }
                        >
                          {paciente.ativo !== false ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(paciente)}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleAtivo(paciente)}
                            title={paciente.ativo !== false ? "Desativar" : "Ativar"}
                          >
                            {paciente.ativo !== false ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PacienteForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedPaciente(null);
        }}
        onSave={(paciente) => {
          if (selectedPaciente) {
            savePacienteMutation.mutate({ ...paciente, id: selectedPaciente.id });
          } else {
            savePacienteMutation.mutate(paciente);
          }
        }}
        paciente={selectedPaciente}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pacienteToToggle?.ativo !== false ? "Desativar paciente" : "Ativar paciente"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pacienteToToggle?.ativo !== false
                ? "O paciente será marcado como inativo. Você pode reativá-lo a qualquer momento."
                : "O paciente será reativado e aparecerá na lista de pacientes ativos."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggleAtivo}>
              {pacienteToToggle?.ativo !== false ? "Desativar" : "Ativar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
