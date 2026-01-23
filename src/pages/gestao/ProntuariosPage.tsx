import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Search, 
  Stethoscope, 
  ExternalLink,
  ChevronLeft
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ProntuariosPage() {
  const [search, setSearch] = useState("");

  const { data: prontuarios, isLoading } = useQuery({
    queryKey: ["gestao-prontuarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prontuarios")
        .select(`
          *,
          pacientes:paciente_id (id, nome, telefone),
          tratamentos:tratamento_id (nome)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as any[];
    },
  });

  const filteredProntuarios = prontuarios?.filter((prontuario) => {
    return prontuario.pacientes?.nome?.toLowerCase().includes(search.toLowerCase()) ||
      prontuario.tratamentos?.nome?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/gestao">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <PageHeader
          title="Prontuários"
          description="Gerencie todos os registros médicos"
        />
      </div>

      {/* Search */}
      <Card className="bg-card/60 border-border/40">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por paciente ou tratamento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-card/60 border-border/40">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Tratamento</TableHead>
                <TableHead>Evolução</TableHead>
                <TableHead>Data Atendimento</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredProntuarios?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum prontuário encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredProntuarios?.map((prontuario) => (
                  <TableRow key={prontuario.id}>
                    <TableCell>
                      <Link 
                        to={`/crm/pacientes/${prontuario.paciente_id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {prontuario.pacientes?.nome || "—"}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {prontuario.tratamentos?.nome || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {prontuario.evolucao || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {prontuario.data_atendimento
                        ? format(new Date(prontuario.data_atendimento), "dd/MM/yyyy", { locale: ptBR })
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/crm/pacientes/${prontuario.paciente_id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
