import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  User, 
  MoreVertical, 
  FileText, 
  RefreshCw,
  Smile,
  Paperclip,
  Mic,
  Search,
  Check,
  CheckCheck,
  Clock
} from "lucide-react";
import { useWhatsAppMensagens, WhatsAppConversa, WhatsAppInstance } from "@/hooks/useWhatsAppData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

interface ChatWindowProps {
  instance: WhatsAppInstance | null;
  conversa: WhatsAppConversa | null;
  onTogglePatientPanel?: () => void;
  showPatientPanel?: boolean;
}

export function ChatWindow({ instance, conversa, onTogglePatientPanel, showPatientPanel }: ChatWindowProps) {
  const { mensagens, loading, sendMessage, syncMessages } = useWhatsAppMensagens(
    conversa?.id || null, 
    conversa?.instance_id || null
  );
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensagens]);

  // Sincronizar mensagens ao abrir conversa
  useEffect(() => {
    if (instance && conversa) {
      console.log("Sincronizando mensagens para:", conversa.remote_jid);
      syncMessages(instance.instance_name, conversa.remote_jid);
    }
  }, [conversa?.id, instance?.instance_name]);

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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const groupMessagesByDate = (messages: typeof mensagens) => {
    const groups: { date: string; messages: typeof mensagens }[] = [];
    let currentDate = "";
    
    messages.forEach((msg) => {
      const msgDate = format(new Date(msg.timestamp_msg), "yyyy-MM-dd");
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });
    
    return groups;
  };

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) {
      return "Hoje";
    }
    if (format(date, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd")) {
      return "Ontem";
    }
    return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  if (!conversa) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-muted/20">
        <div className="text-center max-w-md">
          <div className="w-[200px] h-[200px] mx-auto mb-6 opacity-30">
            <svg viewBox="0 0 303 172" className="w-full h-full">
              <path
                fill="currentColor"
                d="M229.565 160.229c-1.167.231-2.349.436-3.548.612-8.15 1.191-16.681.79-24.756-.95-8.076-1.74-15.67-5.12-22.06-9.788-7.21-5.267-12.999-12.151-16.966-19.926-3.966-7.776-6.097-16.374-6.097-25.123 0-8.749 2.131-17.347 6.097-25.122 3.967-7.776 9.756-14.66 16.966-19.927 6.39-4.668 13.984-8.048 22.06-9.788 8.075-1.74 16.606-2.141 24.756-.95 8.15 1.191 15.999 4.054 22.678 8.282 6.68 4.229 12.232 9.805 16.193 16.247 3.961 6.441 6.343 13.69 6.907 21.166.565 7.476-.69 15.019-3.628 21.858-2.939 6.84-7.518 12.89-13.319 17.66-5.8 4.77-12.773 8.188-20.283 9.729z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-light text-foreground mb-2">WhatsApp CRM</h2>
          <p className="text-muted-foreground">
            Selecione uma conversa para começar
          </p>
        </div>
      </div>
    );
  }

  const name = conversa.paciente?.nome || conversa.nome_contato || conversa.remote_jid.split("@")[0];
  
  // Formatar telefone para exibição - extrair do remote_jid se for número válido
  const getPhoneDisplay = () => {
    const jid = conversa.remote_jid;
    if (jid.endsWith("@lid")) {
      return null; // LID não tem telefone visível
    }
    const phone = jid.replace("@s.whatsapp.net", "").replace("@g.us", "");
    // Se parece com um número de telefone (só dígitos)
    if (/^\d{10,13}$/.test(phone)) {
      // Formatar: 55 11 99999-9999
      if (phone.length === 13) {
        return `+${phone.slice(0, 2)} ${phone.slice(2, 4)} ${phone.slice(4, 9)}-${phone.slice(9)}`;
      } else if (phone.length === 12) {
        return `+${phone.slice(0, 2)} ${phone.slice(2, 4)} ${phone.slice(4, 8)}-${phone.slice(8)}`;
      }
      return phone;
    }
    return null;
  };
  
  const phoneDisplay = getPhoneDisplay();
  const messageGroups = groupMessagesByDate(mensagens);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b bg-card flex-shrink-0">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={onTogglePatientPanel}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversa.foto_url || conversa.paciente?.foto_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-sm">{name}</h3>
            <p className="text-xs text-muted-foreground">
              {conversa.paciente ? "Paciente vinculado" : (phoneDisplay || "Contato WhatsApp")}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="h-9 w-9">
            <Search className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-9 w-9">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {conversa.paciente && (
                <DropdownMenuItem onClick={() => navigate(`/crm/pacientes/${conversa.paciente!.id}`)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Ver ficha completa
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => syncMessages(instance!.instance_name, conversa.remote_jid)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar mensagens
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 bg-muted/20">
        <div className="px-16 py-4 min-h-full">
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : mensagens.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messageGroups.map((group) => (
                <div key={group.date}>
                  {/* Date separator */}
                  <div className="flex justify-center my-4">
                    <span className="px-3 py-1 text-xs rounded-lg bg-card text-muted-foreground shadow-sm">
                      {formatDateLabel(group.date)}
                    </span>
                  </div>
                  
                  {/* Messages */}
                  <div className="space-y-1">
                    {group.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn("flex", msg.from_me ? "justify-end" : "justify-start")}
                      >
                        <div
                          className={cn(
                            "max-w-[65%] rounded-lg px-3 py-2 shadow-sm relative",
                            msg.from_me
                              ? "bg-primary text-primary-foreground rounded-tr-none"
                              : "bg-card text-card-foreground rounded-tl-none"
                          )}
                        >
                          {msg.media_url && msg.tipo === "image" && (
                            <img
                              src={msg.media_url}
                              alt="Imagem"
                              className="rounded max-w-full mb-2"
                            />
                          )}
                          <p className="text-sm whitespace-pre-wrap break-words pr-12">
                            {msg.conteudo}
                          </p>
                          <div className={cn(
                            "absolute bottom-1 right-2 flex items-center gap-1",
                            msg.from_me ? "text-primary-foreground/60" : "text-muted-foreground"
                          )}>
                            <span className="text-[10px]">
                              {format(new Date(msg.timestamp_msg), "HH:mm")}
                            </span>
                            {msg.from_me && (
                              msg.status === "read" ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : msg.status === "delivered" ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : msg.status === "sent" ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Clock className="h-3 w-3" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="px-4 py-3 border-t bg-card flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" className="h-9 w-9 flex-shrink-0">
            <Smile className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button size="icon" variant="ghost" className="h-9 w-9 flex-shrink-0">
            <Paperclip className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Input
            placeholder="Digite uma mensagem"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending}
            className="flex-1 h-10 bg-muted/50 border-0 focus-visible:ring-1"
          />
          {newMessage.trim() ? (
            <Button 
              size="icon" 
              onClick={handleSend} 
              disabled={sending}
              className="h-9 w-9 flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="icon" variant="ghost" className="h-9 w-9 flex-shrink-0">
              <Mic className="h-5 w-5 text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
