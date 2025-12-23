import { useState } from "react";
import { FileText, Plus, Edit, Trash2, ExternalLink, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAdminData, DOCUMENTO_TIPOS, DocumentoLegal } from "./hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type DocumentoFormData = Omit<DocumentoLegal, "id" | "created_at" | "updated_at">;

const emptyDocumento: DocumentoFormData = {
  titulo: "",
  tipo: "contrato",
  descricao: "",
  arquivo_url: "",
  vigente: true,
  data_vigencia: null,
};

export function DocumentosTab() {
  const {
    documentos,
    loadingDocumentos,
    createDocumento,
    updateDocumento,
    deleteDocumento,
  } = useAdminData();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentoLegal | null>(null);
  const [formData, setFormData] = useState<DocumentoFormData>(emptyDocumento);

  const handleOpenCreate = () => {
    setEditingDoc(null);
    setFormData(emptyDocumento);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (doc: DocumentoLegal) => {
    setEditingDoc(doc);
    setFormData({
      titulo: doc.titulo,
      tipo: doc.tipo,
      descricao: doc.descricao || "",
      arquivo_url: doc.arquivo_url || "",
      vigente: doc.vigente,
      data_vigencia: doc.data_vigencia,
    });
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (editingDoc) {
      updateDocumento.mutate({ id: editingDoc.id, ...formData });
    } else {
      createDocumento.mutate(formData);
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este documento?")) {
      deleteDocumento.mutate(id);
    }
  };

  const getDocTipoLabel = (tipo: string) => {
    return DOCUMENTO_TIPOS.find((t) => t.value === tipo)?.label || tipo;
  };

  if (loadingDocumentos) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const vigentesCount = documentos.filter((d) => d.vigente).length;
  const porTipo = DOCUMENTO_TIPOS.map((tipo) => ({
    ...tipo,
    count: documentos.filter((d) => d.tipo === tipo.value).length,
  }));

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{documentos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {porTipo.map((tipo) => (
          <Card key={tipo.value}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{tipo.label}</p>
                  <p className="text-2xl font-bold">{tipo.count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabela de Documentos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Repositório de Documentos</CardTitle>
            <CardDescription>
              Contratos, termos e documentos regulatórios
            </CardDescription>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Documento
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vigência</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentos.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {doc.titulo}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getDocTipoLabel(doc.tipo)}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {doc.descricao || "-"}
                  </TableCell>
                  <TableCell>
                    {doc.vigente ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Vigente
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Inativo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {doc.data_vigencia
                      ? format(new Date(doc.data_vigencia), "dd/MM/yyyy", {
                          locale: ptBR,
                        })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {format(new Date(doc.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {doc.arquivo_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(doc.arquivo_url!, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(doc)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(doc.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog para criar/editar documento */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingDoc ? "Editar Documento" : "Novo Documento"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input
                value={formData.titulo}
                onChange={(e) =>
                  setFormData({ ...formData, titulo: e.target.value })
                }
                placeholder="Título do documento"
              />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(v) => setFormData({ ...formData, tipo: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENTO_TIPOS.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formData.descricao || ""}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
                placeholder="Descrição do documento..."
                rows={3}
              />
            </div>
            <div>
              <Label>URL do Arquivo</Label>
              <Input
                value={formData.arquivo_url || ""}
                onChange={(e) =>
                  setFormData({ ...formData, arquivo_url: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Data de Vigência</Label>
              <Input
                type="date"
                value={formData.data_vigencia || ""}
                onChange={(e) =>
                  setFormData({ ...formData, data_vigencia: e.target.value || null })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.vigente}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, vigente: checked })
                }
              />
              <Label>Documento vigente</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={!formData.titulo}>
                {editingDoc ? "Salvar" : "Criar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
