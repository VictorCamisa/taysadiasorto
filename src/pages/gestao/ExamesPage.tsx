import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  FlaskConical, 
  ExternalLink,
  Download,
  Filter,
  ChevronLeft
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ExamesPage() {
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState<string>("all");

  const { data: exames, isLoading } = useQuery({
    queryKey: ["gestao-exames"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exames_paciente")
        .select(`
          *,
          pacientes:paciente_id (id, nome, telefone)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as any[];
    },
  });

  const tipos = [...new Set(exames?.map((e) => e.tipo) || [])];

  const filteredExames = exames?.filter((exame) => {
    const matchesSearch = 
      exame.pacientes?.nome?.toLowerCase().includes(search.toLowerCase()) ||
      exame.nome?.toLowerCase().includes(search.toLowerCase());
    const matchesTipo = tipoFilter === "all" || exame.tipo === tipoFilter;
    return matchesSearch && matchesTipo;
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
          title="Exames"
          description="Gerencie todos os exames laboratoriais"
        />
      </div>

      {/* Filters */}
      <Card className="bg-card/60 border-border/40">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por paciente ou exame..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {tipos.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                <TableHead>Exame</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Laboratório</TableHead>
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
              ) : filteredExames?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum exame encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredExames?.map((exame) => (
                  <TableRow key={exame.id}>
                    <TableCell>
                      <Link 
                        to={`/crm/pacientes/${exame.paciente_id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {exame.pacientes?.nome || "—"}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {exame.nome}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{exame.tipo}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {exame.laboratorio || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {exame.data_exame
                        ? format(new Date(exame.data_exame), "dd/MM/yyyy", { locale: ptBR })
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/crm/pacientes/${exame.paciente_id}`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                        {exame.arquivo_url && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={exame.arquivo_url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
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
