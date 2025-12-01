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
    <div className="w-64 border-r border-border/50 bg-background/95 backdrop-blur-sm flex flex-col">
      <div className="p-4 border-b border-border/50">
        <Button
          onClick={onNewConversation}
          className="w-full justify-start gap-2"
          variant="outline"
        >
          <MessageSquarePlus className="h-4 w-4" />
          Nova Conversa
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={cn(
                "group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors",
                currentConversationId === conversation.id
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted/50"
              )}
            >
              <button
                onClick={() => onSelectConversation(conversation.id)}
                className="flex-1 text-left text-sm truncate"
              >
                {conversation.title}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conversation.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border/50 text-xs text-muted-foreground text-center">
        Últimas 10 conversas
      </div>
    </div>
  );
};
