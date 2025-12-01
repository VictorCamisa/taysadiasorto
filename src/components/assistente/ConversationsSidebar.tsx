import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ConversationsSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
}

export const ConversationsSidebar = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}: ConversationsSidebarProps) => {
  return (
    <aside className="w-72 border-r border-border flex flex-col bg-muted/30">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <Button
          onClick={onNewConversation}
          className="w-full h-11 justify-start gap-3 font-medium"
          size="lg"
        >
          <MessageSquarePlus className="h-5 w-5" />
          Nova Conversa
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {conversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-sm text-muted-foreground">
                Nenhuma conversa ainda
              </p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition-all duration-200",
                  currentConversationId === conv.id
                    ? "bg-primary/10 text-foreground shadow-sm"
                    : "hover:bg-accent text-muted-foreground hover:text-foreground"
                )}
                onClick={() => onSelectConversation(conv.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate leading-relaxed">
                    {conv.title}
                  </p>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0",
                    "hover:bg-destructive/10 hover:text-destructive"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conv.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </aside>
  );
};
