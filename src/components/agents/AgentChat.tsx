import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Plus, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { AIAgent, AIAgentMessage, AIAgentConversation } from "@/hooks/useAIAgents";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface AgentChatProps {
  agent: AIAgent;
  conversations: AIAgentConversation[];
  currentConversation: AIAgentConversation | null;
  messages: AIAgentMessage[];
  onSelectConversation: (conv: AIAgentConversation) => void;
  onCreateConversation: () => Promise<AIAgentConversation>;
  onDeleteConversation: (id: string) => void;
  onSendMessage: (content: string) => Promise<void>;
  isLoadingMessages: boolean;
}

export function AgentChat({
  agent,
  conversations,
  currentConversation,
  messages,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
  onSendMessage,
  isLoadingMessages,
}: AgentChatProps) {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userMessage = input.trim();
    setInput("");
    setIsSending(true);
    setStreamingContent("");

    try {
      // Create conversation if needed
      let conversationId = currentConversation?.id;
      if (!conversationId) {
        const newConv = await onCreateConversation();
        conversationId = newConv.id;
      }

      // Call the agent chat edge function
      const response = await fetch(
        `https://ynstyufdfrctktsgwxwv.supabase.co/functions/v1/agent-chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentId: agent.id,
            conversationId,
            message: userMessage,
            conversationHistory: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Limite de requisições excedido. Aguarde um momento.");
          return;
        }
        throw new Error(`HTTP error: ${response.status}`);
      }

      if (!response.body) throw new Error("No response body");

      // Process streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = "";
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantResponse += delta;
              setStreamingContent(assistantResponse);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save messages via onSendMessage callback
      await onSendMessage(userMessage);
      setStreamingContent("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const allMessages = streamingContent
    ? [...messages, { id: "streaming", role: "assistant" as const, content: streamingContent, created_at: new Date().toISOString(), conversation_id: "", agent_id: "", tokens_used: null, model_used: null, sources: [], metadata: {} }]
    : messages;

  return (
    <div className="flex h-full">
      {/* Conversations sidebar */}
      <div className="w-64 border-r border-border/50 flex flex-col">
        <div className="p-3 border-b border-border/50">
          <Button
            size="sm"
            className="w-full gap-2"
            onClick={async () => {
              await onCreateConversation();
            }}
          >
            <Plus className="h-4 w-4" />
            Nova Conversa
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhuma conversa ainda
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={cn(
                    "group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors",
                    currentConversation?.id === conv.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted/50"
                  )}
                  onClick={() => onSelectConversation(conv)}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm truncate">{conv.title}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {allMessages.length === 0 && !isLoadingMessages ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">{agent.name}</h3>
              {agent.description && (
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  {agent.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground/70 mt-4">
                Envie uma mensagem para começar a conversa
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {allMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <Card
                    className={cn(
                      "max-w-[80%]",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50"
                    )}
                  >
                    <CardContent className="p-3">
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </CardContent>
                  </Card>
                  {msg.role === "user" && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-secondary">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isSending && !streamingContent && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <Card className="bg-muted/50">
                    <CardContent className="p-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </CardContent>
                  </Card>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border/50">
          <div className="max-w-3xl mx-auto flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Digite sua mensagem..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!input.trim() || isSending}>
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}