import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw, Search, MessageCircle, CheckCheck, Check } from "lucide-react";
import { useWhatsAppConversas, WhatsAppConversa, WhatsAppInstance } from "@/hooks/useWhatsAppData";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ChatListProps {
  instance: WhatsAppInstance | null;
  selectedConversa: WhatsAppConversa | null;
  onSelectConversa: (conversa: WhatsAppConversa) => void;
}

export function ChatList({ instance, selectedConversa, onSelectConversa }: ChatListProps) {
  const { conversas, loading, syncChats } = useWhatsAppConversas(instance?.id || null);
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);

  const filteredConversas = conversas.filter((c) =>
    (c.nome_contato || c.remote_jid).toLowerCase().includes(search.toLowerCase()) ||
    c.paciente?.nome?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSync = async () => {
    if (!instance) return;
    setSyncing(true);
    try {
      await syncChats(instance.instance_name);
    } finally {
      setSyncing(false);
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

  const formatTime = (date: string | null) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Ontem";
    } else if (diffDays < 7) {
      return d.toLocaleDateString("pt-BR", { weekday: "short" });
    }
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  if (!instance) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <MessageCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-foreground mb-1">Nenhuma instância selecionada</h3>
        <p className="text-sm text-muted-foreground">
          Selecione ou crie uma instância WhatsApp
        </p>
      </div>
    );
  }

  if (instance.status !== "connected") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
          <MessageCircle className="h-8 w-8 text-amber-500" />
        </div>
        <h3 className="font-medium text-foreground mb-1">WhatsApp desconectado</h3>
        <p className="text-sm text-muted-foreground">
          Escaneie o QR Code para conectar
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar ou começar nova conversa"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1"
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={handleSync}
            disabled={syncing}
          >
            <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="space-y-1 px-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                <div className="h-12 w-12 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-3 w-40 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">
              {search ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda"}
            </p>
            {!search && (
              <Button variant="link" size="sm" onClick={handleSync} className="mt-2">
                Sincronizar conversas
              </Button>
            )}
          </div>
        ) : (
          <div>
            {filteredConversas.map((conversa) => {
              const name = conversa.paciente?.nome || conversa.nome_contato || conversa.remote_jid.split("@")[0];
              const isSelected = selectedConversa?.id === conversa.id;
              
              return (
                <div
                  key={conversa.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors hover:bg-muted/50",
                    isSelected && "bg-muted"
                  )}
                  onClick={() => onSelectConversa(conversa)}
                >
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarImage src={conversa.foto_url || conversa.paciente?.foto_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getInitials(name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm truncate">{name}</span>
                      <span className={cn(
                        "text-xs flex-shrink-0",
                        conversa.nao_lidas > 0 ? "text-primary font-medium" : "text-muted-foreground"
                      )}>
                        {formatTime(conversa.ultima_mensagem_at)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-sm text-muted-foreground truncate">
                        {conversa.ultima_mensagem || "Sem mensagens"}
                      </p>
                      {conversa.nao_lidas > 0 && (
                        <Badge className="h-5 min-w-5 rounded-full text-xs px-1.5 flex-shrink-0">
                          {conversa.nao_lidas > 99 ? "99+" : conversa.nao_lidas}
                        </Badge>
                      )}
                    </div>
                    
                    {conversa.paciente && (
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span className="text-xs text-primary">Paciente</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
