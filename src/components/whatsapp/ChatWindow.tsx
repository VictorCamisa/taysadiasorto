import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Phone, Video, MoreVertical, FileText, RefreshCw } from "lucide-react";
import { useWhatsAppMensagens, WhatsAppConversa, WhatsAppInstance } from "@/hooks/useWhatsAppData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

interface ChatWindowProps {
  instance: WhatsAppInstance | null;
  conversa: WhatsAppConversa | null;
}

export function ChatWindow({ instance, conversa }: ChatWindowProps) {
  const { mensagens, loading, sendMessage, syncMessages } = useWhatsAppMensagens(conversa?.id || null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensagens]);

  useEffect(() => {
    // Sync messages when conversa changes
    if (instance && conversa) {
      syncMessages(instance.instance_name, conversa.remote_jid);
    }
  }, [conversa?.id]);

  const handleSend = async () => {
    if (!newMessage.trim() || !instance || !conversa) return;

    setSending(true);
    try {
      await sendMessage(instance.instance_name, conversa.remote_jid, newMessage);
      setNewMessage("");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!conversa) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-muted/30">
        <div className="w-64 h-64 mb-6">
          <svg viewBox="0 0 303 172" className="w-full h-full opacity-20">
            <path
              fill="currentColor"
              d="M229.565 160.229c-1.167.231-2.349.436-3.548.612-8.15 1.191-16.681.79-24.756-.95-8.076-1.74-15.67-5.12-22.06-9.788-7.21-5.267-12.999-12.151-16.966-19.926-3.966-7.776-6.097-16.374-6.097-25.123 0-8.749 2.131-17.347 6.097-25.122 3.967-7.776 9.756-14.66 16.966-19.927 6.39-4.668 13.984-8.048 22.06-9.788 8.075-1.74 16.606-2.141 24.756-.95 1.199.176 2.381.381 3.548.612-1.167-.231-2.349-.436-3.548-.612-8.15-1.191-16.681-.79-24.756.95-8.076 1.74-15.67 5.12-22.06 9.788-7.21 5.267-12.999 12.151-16.966 19.927-3.966 7.775-6.097 16.373-6.097 25.122 0 8.749 2.131 17.347 6.097 25.123 3.967 7.775 9.756 14.659 16.966 19.926 6.39 4.668 13.984 8.048 22.06 9.788 8.075 1.74 16.606 2.141 24.756.95 1.199-.176 2.381-.381 3.548-.612z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">WhatsApp Web</h3>
        <p className="text-muted-foreground max-w-sm">
          Selecione uma conversa para começar a enviar e receber mensagens
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-card">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={conversa.foto_url || conversa.paciente?.foto_url || undefined} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {conversa.paciente?.nome || conversa.nome_contato || conversa.remote_jid.split("@")[0]}
            </p>
            <p className="text-xs text-muted-foreground">
              {conversa.remote_jid.replace("@s.whatsapp.net", "")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost">
            <Phone className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost">
            <Video className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {conversa.paciente && (
                <DropdownMenuItem onClick={() => navigate(`/crm/pacientes/${conversa.paciente!.id}`)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Ver ficha do paciente
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => syncMessages(instance!.instance_name, conversa.remote_jid)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sincronizar mensagens
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjEuNSIgZmlsbD0icmdiYSgwLDAsMCwwLjAzKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNhKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')]">
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : mensagens.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda</p>
            </div>
          ) : (
            mensagens.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex", msg.from_me ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[70%] rounded-lg px-3 py-2 shadow-sm",
                    msg.from_me
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-card text-card-foreground rounded-bl-none"
                  )}
                >
                  {msg.media_url && msg.tipo === "image" && (
                    <img
                      src={msg.media_url}
                      alt="Imagem"
                      className="rounded max-w-full mb-2"
                    />
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.conteudo}</p>
                  <p
                    className={cn(
                      "text-xs mt-1",
                      msg.from_me ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}
                  >
                    {format(new Date(msg.timestamp_msg), "HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t bg-card">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Digite uma mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={sending || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
