import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, Plus, Loader2, Trash2, Calendar, ZoomIn, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface FotosTabProps {
  pacienteId: string;
}

interface FotoPaciente {
  id: string;
  paciente_id: string;
  url: string;
  categoria: string;
  descricao: string | null;
  data_foto: string;
  created_at: string;
}

const categorias = [
  "Antes",
  "Durante",
  "Depois",
  "Documentação",
  "Evolução",
  "Outros",
];

export function FotosTab({ pacienteId }: FotosTabProps) {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [filterCategoria, setFilterCategoria] = useState<string>("todas");

  const [formData, setFormData] = useState({
    categoria: "Antes",
    descricao: "",
    data_foto: format(new Date(), "yyyy-MM-dd"),
  });

  const { data: fotos, isLoading } = useQuery({
    queryKey: ["fotos-paciente", pacienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fotos_paciente" as any)
        .select("*")
        .eq("paciente_id", pacienteId)
        .order("data_foto", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as FotoPaciente[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("fotos_paciente" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fotos-paciente", pacienteId] });
      toast.success("Foto excluída!");
    },
    onError: () => {
      toast.error("Erro ao excluir foto");
    },
  });

  const handleCloseForm = () => {
    setFormOpen(false);
    setFormData({
      categoria: "Antes",
      descricao: "",
      data_foto: format(new Date(), "yyyy-MM-dd"),
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${pacienteId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("fotos-pacientes")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("fotos-pacientes")
          .getPublicUrl(fileName);

        const { error: insertError } = await supabase.from("fotos_paciente" as any).insert({
          paciente_id: pacienteId,
          url: urlData.publicUrl,
          categoria: formData.categoria,
          descricao: formData.descricao,
          data_foto: formData.data_foto,
        } as any);

        if (insertError) throw insertError;
      }

      queryClient.invalidateQueries({ queryKey: ["fotos-paciente", pacienteId] });
      handleCloseForm();
      toast.success("Foto(s) salva(s) com sucesso!");
    } catch (error) {
      toast.error("Erro ao fazer upload");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  const getCategoryColor = (categoria: string) => {
    const colors: Record<string, string> = {
      Antes: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
      Durante: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
      Depois: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
      Documentação: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
      Evolução: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    };
    return colors[categoria] || "";
  };

  const filteredFotos = fotos?.filter(
    (foto) => filterCategoria === "todas" || foto.categoria === filterCategoria
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Select value={filterCategoria} onValueChange={setFilterCategoria}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {categorias.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Foto
          </Button>
        </div>

        {filteredFotos && filteredFotos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFotos.map((foto) => (
              <Card key={foto.id} className="overflow-hidden group relative">
                <div className="aspect-square relative">
                  <img
                    src={foto.url}
                    alt={foto.descricao || "Foto do paciente"}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedImage(foto.url)}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedImage(foto.url)}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(foto.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge className={getCategoryColor(foto.categoria)} variant="secondary">
                      {foto.categoria}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(foto.data_foto)}
                    </span>
                  </div>
                  {foto.descricao && (
                    <p className="text-xs text-muted-foreground truncate">{foto.descricao}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Camera className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground">Nenhuma foto cadastrada</p>
              <p className="text-sm text-muted-foreground mt-1">
                Adicione fotos de antes, durante e depois dos procedimentos
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de upload */}
      <Dialog open={formOpen} onOpenChange={handleCloseForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Fotos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="data_foto">Data</Label>
                <Input
                  id="data_foto"
                  type="date"
                  value={formData.data_foto}
                  onChange={(e) => setFormData({ ...formData, data_foto: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição opcional da foto..."
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="fotos">Selecionar Fotos</Label>
              <Input
                id="fotos"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                disabled={uploading}
              />
              {uploading && (
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Fazendo upload...
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseForm}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de visualização */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Foto ampliada"
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
