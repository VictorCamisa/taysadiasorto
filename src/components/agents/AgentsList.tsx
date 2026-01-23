import { Bot, Plus, Settings, MessageSquare, Trash2, MoreVertical, Database, Brain, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AIAgent } from "@/hooks/useAIAgents";
import { cn } from "@/lib/utils";

interface AgentsListProps {
  agents: AIAgent[];
  selectedAgentId: string | null;
  onSelectAgent: (agent: AIAgent) => void;
  onCreateAgent: () => void;
  onEditAgent: (agent: AIAgent) => void;
  onDeleteAgent: (id: string) => void;
  isLoading: boolean;
}

export function AgentsList({
  agents,
  selectedAgentId,
  onSelectAgent,
  onCreateAgent,
  onEditAgent,
  onDeleteAgent,
  isLoading,
}: AgentsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button onClick={onCreateAgent} className="w-full gap-2">
        <Plus className="h-4 w-4" />
        Novo Agente
      </Button>

      {agents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <Bot className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              Nenhum agente criado ainda.
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Crie seu primeiro agente de IA
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {agents.map((agent) => (
            <Card
              key={agent.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:border-primary/50",
                selectedAgentId === agent.id && "border-primary bg-primary/5"
              )}
              onClick={() => onSelectAgent(agent)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{agent.name}</h3>
                      {agent.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {agent.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {agent.model}
                        </Badge>
                        {agent.memory_enabled && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-1">
                            <Brain className="h-2.5 w-2.5" />
                            Memória
                          </Badge>
                        )}
                        {agent.rag_enabled && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-1">
                            <FileText className="h-2.5 w-2.5" />
                            RAG
                          </Badge>
                        )}
                        {agent.db_connection_enabled && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-1">
                            <Database className="h-2.5 w-2.5" />
                            DB
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditAgent(agent); }}>
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => { e.stopPropagation(); onDeleteAgent(agent.id); }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    {agent.total_conversations} conversas
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {agent.total_messages} mensagens
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}