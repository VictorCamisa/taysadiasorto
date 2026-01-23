import { useState } from "react";
import { Bot, Brain, FileText, Database, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AIAgent, CreateAgentInput } from "@/hooks/useAIAgents";

interface AgentFormProps {
  agent?: AIAgent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateAgentInput | Partial<AIAgent>) => Promise<void>;
  isSaving: boolean;
}

const MODELS = [
  { value: "gpt-4o", label: "GPT-4o (Mais capaz)", description: "Melhor para tarefas complexas" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini (Recomendado)", description: "Bom equilíbrio custo/performance" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo", description: "Contexto longo de 128K" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", description: "Mais rápido e econômico" },
];

export function AgentForm({ agent, isOpen, onClose, onSave, isSaving }: AgentFormProps) {
  const [formData, setFormData] = useState({
    name: agent?.name || "",
    description: agent?.description || "",
    system_prompt: agent?.system_prompt || "Você é um assistente útil e profissional. Responda de forma clara e objetiva.",
    model: agent?.model || "gpt-4o-mini",
    temperature: agent?.temperature ?? 0.7,
    max_tokens: agent?.max_tokens ?? 4096,
    memory_enabled: agent?.memory_enabled ?? true,
    memory_window: agent?.memory_window ?? 20,
    rag_enabled: agent?.rag_enabled ?? false,
    rag_similarity_threshold: agent?.rag_similarity_threshold ?? 0.7,
    rag_max_results: agent?.rag_max_results ?? 5,
    db_connection_enabled: agent?.db_connection_enabled ?? false,
  });

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    if (agent?.id) {
      await onSave({ id: agent.id, ...formData });
    } else {
      await onSave(formData);
    }
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            {agent ? "Configurar Agente" : "Novo Agente"}
          </SheetTitle>
          <SheetDescription>
            {agent
              ? "Configure as opções do seu agente de IA"
              : "Crie um novo agente de IA personalizado"}
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="basic" className="mt-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="model">Modelo</TabsTrigger>
            <TabsTrigger value="features">Recursos</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Agente *</Label>
              <Input
                id="name"
                placeholder="Ex: Assistente de Vendas"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                placeholder="Breve descrição do agente"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="system_prompt">Prompt do Sistema</Label>
              <Textarea
                id="system_prompt"
                placeholder="Instruções de como o agente deve se comportar..."
                className="min-h-[200px] resize-none"
                value={formData.system_prompt}
                onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Define a personalidade e comportamento do agente
              </p>
            </div>
          </TabsContent>

          <TabsContent value="model" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Modelo</Label>
              <Select
                value={formData.model}
                onValueChange={(value) => setFormData({ ...formData, model: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODELS.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      <div>
                        <div className="font-medium">{model.label}</div>
                        <div className="text-xs text-muted-foreground">{model.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Temperatura: {formData.temperature.toFixed(1)}</Label>
              </div>
              <Slider
                value={[formData.temperature]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={([value]) => setFormData({ ...formData, temperature: value })}
              />
              <p className="text-xs text-muted-foreground">
                Baixo = respostas mais focadas | Alto = mais criativo
              </p>
            </div>

            <div className="space-y-2">
              <Label>Máximo de Tokens</Label>
              <Select
                value={formData.max_tokens.toString()}
                onValueChange={(value) => setFormData({ ...formData, max_tokens: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1024">1024 (Respostas curtas)</SelectItem>
                  <SelectItem value="2048">2048 (Padrão)</SelectItem>
                  <SelectItem value="4096">4096 (Respostas longas)</SelectItem>
                  <SelectItem value="8192">8192 (Muito longas)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm">Memória</CardTitle>
                  </div>
                  <Switch
                    checked={formData.memory_enabled}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, memory_enabled: checked })
                    }
                  />
                </div>
                <CardDescription className="text-xs">
                  O agente lembra do contexto da conversa
                </CardDescription>
              </CardHeader>
              {formData.memory_enabled && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <Label className="text-xs">Janela de memória: {formData.memory_window} mensagens</Label>
                    <Slider
                      value={[formData.memory_window]}
                      min={5}
                      max={50}
                      step={5}
                      onValueChange={([value]) => setFormData({ ...formData, memory_window: value })}
                    />
                  </div>
                </CardContent>
              )}
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm">RAG (Documentos)</CardTitle>
                  </div>
                  <Switch
                    checked={formData.rag_enabled}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, rag_enabled: checked })
                    }
                  />
                </div>
                <CardDescription className="text-xs">
                  O agente pode consultar documentos carregados
                </CardDescription>
              </CardHeader>
              {formData.rag_enabled && (
                <CardContent className="pt-0 space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Similaridade mínima: {(formData.rag_similarity_threshold * 100).toFixed(0)}%</Label>
                    <Slider
                      value={[formData.rag_similarity_threshold]}
                      min={0.5}
                      max={0.95}
                      step={0.05}
                      onValueChange={([value]) =>
                        setFormData({ ...formData, rag_similarity_threshold: value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Máx. resultados: {formData.rag_max_results}</Label>
                    <Slider
                      value={[formData.rag_max_results]}
                      min={1}
                      max={10}
                      step={1}
                      onValueChange={([value]) =>
                        setFormData({ ...formData, rag_max_results: value })
                      }
                    />
                  </div>
                </CardContent>
              )}
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm">Conexão com Banco</CardTitle>
                  </div>
                  <Switch
                    checked={formData.db_connection_enabled}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, db_connection_enabled: checked })
                    }
                  />
                </div>
                <CardDescription className="text-xs">
                  O agente pode consultar dados do Supabase
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>

        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !formData.name.trim()}>
            {isSaving ? "Salvando..." : agent ? "Salvar" : "Criar Agente"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}