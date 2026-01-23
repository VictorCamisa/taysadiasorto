import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { 
  Search, 
  FileSignature, 
  ExternalLink, 
  Download,
  Filter,
  ChevronLeft
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ContratosPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: contratos, isLoading } = useQuery({
    queryKey: ["gestao-contratos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contratos_paciente")
        .select(`
          *,
          pacientes:paciente_id (id, nome, telefone)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as any[];
    },
  });

  const filteredContratos = contratos?.filter((contrato) => {
    const matchesSearch = 
      contrato.pacientes?.nome?.toLowerCase().includes(search.toLowerCase()) ||
      contrato.titulo?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || contrato.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pendente: { label: "Pendente", variant: "secondary" },
    assinado: { label: "Assinado", variant: "default" },
    cancelado: { label: "Cancelado", variant: "destructive" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/gestao">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <PageHeader
          title="Contratos"
          description="Gerencie todos os contratos e termos de serviço"
        />
      </div>

      {/* Filters */}
      <Card className="bg-card/60 border-border/40">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por paciente ou título..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="assinado">Assinado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
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
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Assinatura</TableHead>
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
              ) : filteredContratos?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum contrato encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredContratos?.map((contrato) => (
                  <TableRow key={contrato.id}>
                    <TableCell>
                      <Link 
                        to={`/crm/pacientes/${contrato.paciente_id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {contrato.pacientes?.nome || "—"}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {contrato.titulo}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {contrato.tipo}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[contrato.status]?.variant || "secondary"}>
                        {statusConfig[contrato.status]?.label || contrato.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {contrato.data_assinatura
                        ? format(new Date(contrato.data_assinatura), "dd/MM/yyyy", { locale: ptBR })
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/crm/pacientes/${contrato.paciente_id}`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                        {contrato.arquivo_url && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={contrato.arquivo_url} target="_blank" rel="noopener noreferrer">
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
