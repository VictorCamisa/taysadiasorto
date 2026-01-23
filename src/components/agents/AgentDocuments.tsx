import { useState } from "react";
import { FileText, Plus, Trash2, Link, Type, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIAgentDocument } from "@/hooks/useAIAgents";
import { cn } from "@/lib/utils";

interface AgentDocumentsProps {
  documents: AIAgentDocument[];
  onAddDocument: (input: { name: string; type: string; content: string; source_url?: string }) => Promise<unknown>;
  onDeleteDocument: (id: string) => void;
  isLoading: boolean;
  isAdding: boolean;
}

const STATUS_CONFIG = {
  pending: { icon: Clock, label: "Pendente", className: "text-warning" },
  processing: { icon: Loader2, label: "Processando", className: "text-info animate-spin" },
  ready: { icon: CheckCircle, label: "Pronto", className: "text-[hsl(145,60%,45%)]" },
  error: { icon: XCircle, label: "Erro", className: "text-destructive" },
};

export function AgentDocuments({
  documents,
  onAddDocument,
  onDeleteDocument,
  isLoading,
  isAdding,
}: AgentDocumentsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [docType, setDocType] = useState<"text" | "url">("text");
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");

  const handleAdd = async () => {
    if (!name.trim()) return;

    if (docType === "text" && !content.trim()) return;
    if (docType === "url" && !url.trim()) return;

    await onAddDocument({
      name: name.trim(),
      type: docType,
      content: docType === "text" ? content : "",
      source_url: docType === "url" ? url : undefined,
    });

    setName("");
    setContent("");
    setUrl("");
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Base de Conhecimento</h3>
          <p className="text-sm text-muted-foreground">
            Documentos que o agente pode consultar
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Documento</DialogTitle>
              <DialogDescription>
                Adicione conteúdo à base de conhecimento do agente
              </DialogDescription>
            </DialogHeader>

            <Tabs value={docType} onValueChange={(v) => setDocType(v as "text" | "url")}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="text" className="gap-2">
                  <Type className="h-4 w-4" />
                  Texto
                </TabsTrigger>
                <TabsTrigger value="url" className="gap-2">
                  <Link className="h-4 w-4" />
                  URL
                </TabsTrigger>
              </TabsList>

              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label>Nome do Documento</Label>
                  <Input
                    placeholder="Ex: Manual de Atendimento"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <TabsContent value="text" className="mt-0">
                  <div className="space-y-2">
                    <Label>Conteúdo</Label>
                    <Textarea
                      placeholder="Cole aqui o texto que o agente deve aprender..."
                      className="min-h-[200px] resize-none"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="url" className="mt-0">
                  <div className="space-y-2">
                    <Label>URL</Label>
                    <Input
                      type="url"
                      placeholder="https://exemplo.com/pagina"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      O conteúdo da página será extraído automaticamente
                    </p>
                  </div>
                </TabsContent>
              </div>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAdd} disabled={isAdding || !name.trim()}>
                {isAdding ? "Adicionando..." : "Adicionar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {documents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              Nenhum documento adicionado
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Adicione documentos para o agente consultar
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => {
            const StatusIcon = STATUS_CONFIG[doc.status as keyof typeof STATUS_CONFIG]?.icon || Clock;
            const statusConfig = STATUS_CONFIG[doc.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;

            return (
              <Card key={doc.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium truncate">{doc.name}</h4>
                        <Badge variant="outline" className="text-[10px] px-1.5">
                          {doc.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StatusIcon className={cn("h-3 w-3", statusConfig.className)} />
                        <span className="text-xs text-muted-foreground">
                          {statusConfig.label}
                          {doc.chunk_count > 0 && ` • ${doc.chunk_count} chunks`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onDeleteDocument(doc.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}