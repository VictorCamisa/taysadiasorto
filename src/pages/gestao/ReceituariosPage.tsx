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
  Pill, 
  ExternalLink,
  Printer,
  ChevronLeft
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ReceituariosPage() {
  const [search, setSearch] = useState("");

  const { data: receituarios, isLoading } = useQuery({
    queryKey: ["gestao-receituarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("receituario_digital")
        .select(`
          *,
          pacientes:paciente_id (id, nome, telefone)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as any[];
    },
  });

  const filteredReceituarios = receituarios?.filter((receituario) => {
    return receituario.pacientes?.nome?.toLowerCase().includes(search.toLowerCase()) ||
      receituario.medicamento?.toLowerCase().includes(search.toLowerCase());
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
          title="Receituários"
          description="Gerencie todas as prescrições médicas"
        />
      </div>

      {/* Search */}
      <Card className="bg-card/60 border-border/40">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por paciente ou medicamento..."
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
                <TableHead>Medicamento</TableHead>
                <TableHead>Dosagem</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredReceituarios?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum receituário encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredReceituarios?.map((receituario) => (
                  <TableRow key={receituario.id}>
                    <TableCell>
                      <Link 
                        to={`/crm/pacientes/${receituario.paciente_id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {receituario.pacientes?.nome || "—"}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {receituario.medicamento}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {receituario.dosagem}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {receituario.duracao}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {receituario.data_prescricao
                        ? format(new Date(receituario.data_prescricao), "dd/MM/yyyy", { locale: ptBR })
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/crm/pacientes/${receituario.paciente_id}`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
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
