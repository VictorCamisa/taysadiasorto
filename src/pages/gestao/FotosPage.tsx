import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Camera, 
  ExternalLink,
  Filter,
  ChevronLeft,
  Image
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function FotosPage() {
  const [search, setSearch] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState<string>("all");

  const { data: fotos, isLoading } = useQuery({
    queryKey: ["gestao-fotos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fotos_paciente")
        .select(`
          *,
          pacientes:paciente_id (id, nome, telefone)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as any[];
    },
  });

  const categorias = [...new Set(fotos?.map((f) => f.categoria) || [])];

  const filteredFotos = fotos?.filter((foto) => {
    const matchesSearch = foto.pacientes?.nome?.toLowerCase().includes(search.toLowerCase());
    const matchesCategoria = categoriaFilter === "all" || foto.categoria === categoriaFilter;
    return matchesSearch && matchesCategoria;
  });

  const categoriaConfig: Record<string, { label: string; color: string }> = {
    antes: { label: "Antes", color: "bg-blue-500/10 text-blue-500" },
    depois: { label: "Depois", color: "bg-emerald-500/10 text-emerald-500" },
    evolucao: { label: "Evolução", color: "bg-amber-500/10 text-amber-500" },
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
          title="Fotos"
          description="Gerencie todas as fotos de pacientes"
        />
      </div>

      {/* Filters */}
      <Card className="bg-card/60 border-border/40">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por paciente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value="antes">Antes</SelectItem>
                <SelectItem value="depois">Depois</SelectItem>
                <SelectItem value="evolucao">Evolução</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Grid */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : filteredFotos?.length === 0 ? (
        <Card className="bg-card/60 border-border/40">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma foto encontrada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredFotos?.map((foto) => (
            <Link
              key={foto.id}
              to={`/crm/pacientes/${foto.paciente_id}`}
              className={cn(
                "group relative rounded-xl overflow-hidden",
                "bg-card/60 border border-border/40",
                "hover:border-primary/40 transition-all duration-300",
                "hover:shadow-lg"
              )}
            >
              <div className="aspect-square relative">
                <img
                  src={foto.url}
                  alt={foto.descricao || "Foto do paciente"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Categoria Badge */}
                <div className="absolute top-2 left-2">
                  <Badge className={cn("text-xs", categoriaConfig[foto.categoria]?.color)}>
                    {categoriaConfig[foto.categoria]?.label || foto.categoria}
                  </Badge>
                </div>

                {/* External Link Icon */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="h-8 w-8 rounded-lg bg-background/80 backdrop-blur-sm flex items-center justify-center">
                    <ExternalLink className="h-4 w-4 text-foreground" />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="font-medium text-sm text-foreground truncate">
                  {foto.pacientes?.nome || "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {foto.data_foto
                    ? format(new Date(foto.data_foto), "dd/MM/yyyy", { locale: ptBR })
                    : "—"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
