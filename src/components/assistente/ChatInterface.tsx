import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Sparkles, TrendingUp, Users, DollarSign, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

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

const suggestedQuestions = [
  {
    icon: DollarSign,
    text: "Qual foi o faturamento deste mês?",
    description: "Análise financeira"
  },
  {
    icon: TrendingUp,
    text: "Quais tratamentos estão gerando mais receita?",
    description: "Performance"
  },
  {
    icon: Users,
    text: "Como está a taxa de conversão de agendamentos?",
    description: "Comercial"
  },
  {
    icon: Calendar,
    text: "Quais contas vencem esta semana?",
    description: "Contas a pagar"
  }
];

export const ChatInterface = ({
  messages,
  onSendMessage,
  isLoading
}: ChatInterfaceProps) => {
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
    await onSendMessage(userMessage);
    textareaRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    if (isLoading) return;
    onSendMessage(question);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Messages Area with Scroll */}
      <div className="flex-1 min-h-0">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center p-6">
            <div className="text-center space-y-8 max-w-3xl">
              {/* Header */}
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Olá! Sou a ARIA
                </h1>
                <p className="text-lg text-muted-foreground max-w-md mx-auto">
                  Sua Assistente de Relatórios e Inteligência Analítica. 
                  Pergunte qualquer coisa sobre sua clínica!
                </p>
              </div>

              {/* Suggested Questions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question.text)}
                    disabled={isLoading}
                    className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:border-border transition-all text-left group disabled:opacity-50"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <question.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-2">
                        {question.text}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {question.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Capabilities */}
              <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                <span className="px-3 py-1 rounded-full bg-muted/50">📊 Análise Financeira</span>
                <span className="px-3 py-1 rounded-full bg-muted/50">👥 Gestão de Pacientes</span>
                <span className="px-3 py-1 rounded-full bg-muted/50">📈 KPIs e Métricas</span>
                <span className="px-3 py-1 rounded-full bg-muted/50">💡 Insights e Previsões</span>
              </div>
            </div>
          </div>
        ) : (
          <ScrollArea ref={scrollAreaRef} className="h-full">
            <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-4 animate-fade-in",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-5 py-3",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-foreground border border-border/50"
                    )}
                  >
                    {message.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 prose-headings:my-3 prose-headings:font-semibold">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4 animate-fade-in justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted/50 rounded-2xl px-5 py-3 border border-border/50">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Analisando dados...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Fixed Input Area at Bottom */}
      <div className="border-t border-border bg-background/80 backdrop-blur-sm p-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Pergunte sobre sua clínica..."
              disabled={isLoading}
              rows={1}
              className="flex-1 min-h-11 max-h-32 py-2.5 px-4 text-sm rounded-xl bg-muted/30 border-border focus-visible:ring-2 resize-none"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-11 w-11 rounded-xl"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            ARIA analisa dados em tempo real da sua clínica
          </p>
        </div>
      </div>
    </div>
  );
};
