import { useState } from "react";
import { Lock, FileText, CheckCircle, XCircle, Plus, Edit, Trash2 } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminData, TERMO_TIPOS, LgpdTermo } from "./hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type TermoFormData = Omit<LgpdTermo, "id" | "created_at" | "updated_at">;

const emptyTermo: TermoFormData = {
  titulo: "",
  tipo: "privacidade",
  conteudo: "",
  versao: "1.0",
  vigente: true,
};

export function LgpdTab() {
  const {
    termos,
    consentimentos,
    loadingTermos,
    loadingConsentimentos,
    createTermo,
    updateTermo,
    deleteTermo,
  } = useAdminData();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTermo, setEditingTermo] = useState<LgpdTermo | null>(null);
  const [formData, setFormData] = useState<TermoFormData>(emptyTermo);

  const handleOpenCreate = () => {
    setEditingTermo(null);
    setFormData(emptyTermo);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (termo: LgpdTermo) => {
    setEditingTermo(termo);
    setFormData({
      titulo: termo.titulo,
      tipo: termo.tipo,
      conteudo: termo.conteudo,
      versao: termo.versao,
      vigente: termo.vigente,
    });
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (editingTermo) {
      updateTermo.mutate({ id: editingTermo.id, ...formData });
    } else {
      createTermo.mutate(formData);
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este termo?")) {
      deleteTermo.mutate(id);
    }
  };

  const getTermoTipoLabel = (tipo: string) => {
    return TERMO_TIPOS.find((t) => t.value === tipo)?.label || tipo;
  };

  if (loadingTermos || loadingConsentimentos) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const totalConsentimentos = consentimentos.length;
  const aceitosCount = consentimentos.filter((c) => c.aceito).length;
  const revogadosCount = consentimentos.filter((c) => c.data_revogacao).length;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Termos Ativos</p>
                <p className="text-2xl font-bold">
                  {termos.filter((t) => t.vigente).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Lock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Consentimentos</p>
                <p className="text-2xl font-bold">{totalConsentimentos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aceitos</p>
                <p className="text-2xl font-bold">{aceitosCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revogados</p>
                <p className="text-2xl font-bold">{revogadosCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="termos">
        <TabsList>
          <TabsTrigger value="termos">Termos LGPD</TabsTrigger>
          <TabsTrigger value="consentimentos">Consentimentos</TabsTrigger>
        </TabsList>

        <TabsContent value="termos" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Termos e Políticas</CardTitle>
                <CardDescription>
                  Gerencie os termos de uso, políticas de privacidade e consentimentos
                </CardDescription>
              </div>
              <Button onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Termo
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Versão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {termos.map((termo) => (
                    <TableRow key={termo.id}>
                      <TableCell className="font-medium">{termo.titulo}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getTermoTipoLabel(termo.tipo)}
                        </Badge>
                      </TableCell>
                      <TableCell>{termo.versao}</TableCell>
                      <TableCell>
                        <Badge variant={termo.vigente ? "default" : "secondary"}>
                          {termo.vigente ? "Vigente" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(termo.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(termo)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(termo.id)}
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
        </TabsContent>

        <TabsContent value="consentimentos">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Consentimentos</CardTitle>
              <CardDescription>
                Registro de todos os consentimentos dados pelos pacientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Termo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Aceite</TableHead>
                    <TableHead>Data Revogação</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consentimentos.map((cons) => (
                    <TableRow key={cons.id}>
                      <TableCell className="font-medium">
                        {cons.paciente?.nome || "-"}
                      </TableCell>
                      <TableCell>{cons.termo?.titulo || "-"}</TableCell>
                      <TableCell>
                        {cons.data_revogacao ? (
                          <Badge variant="destructive">Revogado</Badge>
                        ) : cons.aceito ? (
                          <Badge variant="default">Aceito</Badge>
                        ) : (
                          <Badge variant="secondary">Pendente</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {cons.data_aceite
                          ? format(new Date(cons.data_aceite), "dd/MM/yyyy HH:mm", {
                              locale: ptBR,
                            })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {cons.data_revogacao
                          ? format(new Date(cons.data_revogacao), "dd/MM/yyyy HH:mm", {
                              locale: ptBR,
                            })
                          : "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {cons.ip_address || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para criar/editar termo */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTermo ? "Editar Termo" : "Novo Termo"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Título</Label>
                <Input
                  value={formData.titulo}
                  onChange={(e) =>
                    setFormData({ ...formData, titulo: e.target.value })
                  }
                  placeholder="Título do termo"
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
                    {TERMO_TIPOS.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Versão</Label>
              <Input
                value={formData.versao}
                onChange={(e) =>
                  setFormData({ ...formData, versao: e.target.value })
                }
                placeholder="Ex: 1.0"
              />
            </div>
            <div>
              <Label>Conteúdo</Label>
              <Textarea
                value={formData.conteudo}
                onChange={(e) =>
                  setFormData({ ...formData, conteudo: e.target.value })
                }
                placeholder="Texto completo do termo..."
                rows={10}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.vigente}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, vigente: checked })
                }
              />
              <Label>Termo vigente</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={!formData.titulo || !formData.conteudo}>
                {editingTermo ? "Salvar" : "Criar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
