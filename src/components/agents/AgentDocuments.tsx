import { useState, useRef } from "react";
import { FileText, Plus, Trash2, Link, Type, Loader2, CheckCircle, XCircle, Clock, Upload, RefreshCw, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
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
  onAddDocument: (input: { 
    name: string; 
    type: string; 
    content?: string; 
    source_url?: string;
    file?: File;
  }) => Promise<unknown>;
  onDeleteDocument: (id: string) => void;
  onReprocessDocument?: (id: string) => Promise<unknown>;
  isLoading: boolean;
  isAdding: boolean;
  isReprocessing?: boolean;
}

const STATUS_CONFIG = {
  pending: { icon: Clock, label: "Pendente", className: "text-warning" },
  processing: { icon: Loader2, label: "Processando", className: "text-info animate-spin" },
  ready: { icon: CheckCircle, label: "Pronto", className: "text-[hsl(145,60%,45%)]" },
  error: { icon: XCircle, label: "Erro", className: "text-destructive" },
};

const TYPE_ICONS = {
  text: Type,
  url: Link,
  pdf: FileUp,
};

export function AgentDocuments({
  documents,
  onAddDocument,
  onDeleteDocument,
  onReprocessDocument,
  isLoading,
  isAdding,
  isReprocessing,
}: AgentDocumentsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [docType, setDocType] = useState<"text" | "url" | "pdf">("text");
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = async () => {
    if (!name.trim()) return;

    if (docType === "text" && !content.trim()) return;
    if (docType === "url" && !url.trim()) return;
    if (docType === "pdf" && !file) return;

    await onAddDocument({
      name: name.trim(),
      type: docType,
      content: docType === "text" ? content : undefined,
      source_url: docType === "url" ? url : undefined,
      file: docType === "pdf" ? file! : undefined,
    });

    setName("");
    setContent("");
    setUrl("");
    setFile(null);
    setIsOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!name.trim()) {
        setName(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
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
            Documentos que o agente pode consultar (texto, URLs ou PDFs)
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

            <Tabs value={docType} onValueChange={(v) => setDocType(v as "text" | "url" | "pdf")}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="text" className="gap-2">
                  <Type className="h-4 w-4" />
                  Texto
                </TabsTrigger>
                <TabsTrigger value="url" className="gap-2">
                  <Link className="h-4 w-4" />
                  URL
                </TabsTrigger>
                <TabsTrigger value="pdf" className="gap-2">
                  <FileUp className="h-4 w-4" />
                  PDF
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

                <TabsContent value="pdf" className="mt-0">
                  <div className="space-y-2">
                    <Label>Arquivo PDF</Label>
                    <div 
                      className={cn(
                        "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                        file ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
                      )}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,application/pdf"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      {file ? (
                        <div className="flex items-center justify-center gap-2">
                          <FileUp className="h-5 w-5 text-primary" />
                          <span className="text-sm font-medium">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Clique para selecionar ou arraste um arquivo PDF
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Máximo 50MB
                          </p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      O texto será extraído automaticamente e processado para RAG
                    </p>
                  </div>
                </TabsContent>
              </div>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleAdd} 
                disabled={
                  isAdding || 
                  !name.trim() ||
                  (docType === "text" && !content.trim()) ||
                  (docType === "url" && !url.trim()) ||
                  (docType === "pdf" && !file)
                }
              >
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
            const TypeIcon = TYPE_ICONS[doc.type as keyof typeof TYPE_ICONS] || FileText;

            return (
              <Card key={doc.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <TypeIcon className="h-4 w-4 text-muted-foreground" />
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
                        {doc.error_message && (
                          <span className="text-xs text-destructive truncate max-w-[200px]" title={doc.error_message}>
                            {doc.error_message}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {doc.status === 'error' && onReprocessDocument && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => onReprocessDocument(doc.id)}
                        disabled={isReprocessing}
                        title="Reprocessar documento"
                      >
                        <RefreshCw className={cn("h-4 w-4", isReprocessing && "animate-spin")} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => onDeleteDocument(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
