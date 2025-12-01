import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Olá! Sou seu assistente inteligente. Como posso ajudá-lo hoje?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const { data, error } = await supabase.functions.invoke("chat-n8n", {
        body: {
          message: input,
          conversationHistory,
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw error;
      }

      // N8N deve retornar um objeto com a resposta
      // Ajustar conforme a estrutura do seu workflow N8N
      const responseText = data?.response || data?.output || data?.message || "Desculpe, não consegui processar sua solicitação.";

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erro ao enviar mensagem. Tente novamente.");
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <Card className="flex-1 flex flex-col border-border/50 shadow-lg bg-gradient-to-b from-background to-background/95">
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 animate-fade-in ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10">
                      <Bot className="h-5 w-5 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted/50 text-foreground border border-border/50"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <span className="text-xs opacity-60 mt-2 block">
                    {message.timestamp.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {message.role === "user" && (
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start animate-fade-in">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10">
                    <Bot className="h-5 w-5 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted/50 rounded-2xl px-4 py-3 border border-border/50">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-sm">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              disabled={isLoading}
              className="flex-1 border-border/50 focus:border-primary transition-colors"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-10 w-10 rounded-full"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};