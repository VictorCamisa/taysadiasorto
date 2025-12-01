import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, User, Bot } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
}

export const ChatInterface = ({ messages, onSendMessage, isLoading }: ChatInterfaceProps) => {
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");

    try {
      await onSendMessage(userMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erro ao enviar mensagem");
    } finally {
      textareaRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Messages Area with Scroll */}
      <div className="flex-1 min-h-0">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4 max-w-3xl px-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">
                  Olá, Taysa, que bom te ver
                </h1>
                <p className="text-xl text-muted-foreground">
                  Como posso te ajudar?
                </p>
              </div>
            </div>
          </div>
        ) : (
          <ScrollArea ref={scrollAreaRef} className="h-full">
            <div className="max-w-5xl mx-auto px-8 py-8 space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-5 animate-fade-in",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-6 py-4",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "bg-muted/50 text-foreground"
                    )}
                  >
                    <p className="text-base leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-5 animate-fade-in justify-start">
                  <div className="bg-muted/50 rounded-2xl px-6 py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Fixed Input Area at Bottom */}
      <div className="border-t border-border bg-background p-6 flex-shrink-0">
        <div className="max-w-5xl mx-auto">
          <div className="flex gap-4 items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Digite sua mensagem..."
              disabled={isLoading}
              rows={1}
              className="flex-1 min-h-12 max-h-32 py-3 px-5 text-base rounded-2xl bg-muted/30 border-border focus-visible:ring-2 resize-none"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-12 w-12 rounded-2xl shadow-md"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
