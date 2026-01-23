import { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw, Search, User, MessageCircle } from "lucide-react";
import { useWhatsAppConversas, WhatsAppConversa, WhatsAppInstance } from "@/hooks/useWhatsAppData";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

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
    (c.nome_contato || c.remote_jid).toLowerCase().includes(search.toLowerCase())
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

  if (!instance) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Selecione uma instância</p>
        <p className="text-sm text-muted-foreground">para ver as conversas</p>
      </div>
    );
  }

  if (instance.status !== "connected") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Instância desconectada</p>
        <p className="text-sm text-muted-foreground">Conecte o WhatsApp para ver as conversas</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Conversas</h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSync}
            disabled={syncing}
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-2 space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">
              {search ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda"}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredConversas.map((conversa) => (
              <div
                key={conversa.id}
                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedConversa?.id === conversa.id ? "bg-muted" : ""
                }`}
                onClick={() => onSelectConversa(conversa)}
              >
                <Avatar>
                  <AvatarImage src={conversa.foto_url || conversa.paciente?.foto_url || undefined} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm truncate">
                      {conversa.paciente?.nome || conversa.nome_contato || conversa.remote_jid.split("@")[0]}
                    </p>
                    {conversa.ultima_mensagem_at && (
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conversa.ultima_mensagem_at), {
                          addSuffix: false,
                          locale: ptBR,
                        })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground truncate">
                      {conversa.ultima_mensagem || "Sem mensagens"}
                    </p>
                    {conversa.nao_lidas > 0 && (
                      <Badge variant="default" className="h-5 min-w-5 rounded-full text-xs">
                        {conversa.nao_lidas}
                      </Badge>
                    )}
                  </div>
                  {conversa.paciente && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      Paciente vinculado
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
