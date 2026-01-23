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
  ClipboardList, 
  ExternalLink,
  ChevronLeft
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AnamnesesPage() {
  const [search, setSearch] = useState("");

  const { data: anamneses, isLoading } = useQuery({
    queryKey: ["gestao-anamneses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("anamneses")
        .select(`
          *,
          pacientes:paciente_id (id, nome, telefone)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as any[];
    },
  });

  const filteredAnamneses = anamneses?.filter((anamnese) => {
    return anamnese.pacientes?.nome?.toLowerCase().includes(search.toLowerCase()) ||
      anamnese.queixa_principal?.toLowerCase().includes(search.toLowerCase());
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
          title="Anamneses"
          description="Gerencie todas as fichas de anamnese"
        />
      </div>

      {/* Search */}
      <Card className="bg-card/60 border-border/40">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por paciente ou queixa..."
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
                <TableHead>Queixa Principal</TableHead>
                <TableHead>Alergias</TableHead>
                <TableHead>Data</TableHead>
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
              ) : filteredAnamneses?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhuma anamnese encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredAnamneses?.map((anamnese) => (
                  <TableRow key={anamnese.id}>
                    <TableCell>
                      <Link 
                        to={`/crm/pacientes/${anamnese.paciente_id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {anamnese.pacientes?.nome || "—"}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {anamnese.queixa_principal || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {anamnese.alergias || "Nenhuma"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {anamnese.data_anamnese
                        ? format(new Date(anamnese.data_anamnese), "dd/MM/yyyy", { locale: ptBR })
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/crm/pacientes/${anamnese.paciente_id}`}>
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
