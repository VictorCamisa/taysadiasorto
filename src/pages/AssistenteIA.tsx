import { ChatInterface } from "@/components/assistente/ChatInterface";
import { useChatConversations } from "@/hooks/useChatConversations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AssistenteIA = () => {
  const {
    conversations,
    currentConversationId,
    messages,
    isLoading,
    setIsLoading,
    createConversation,
    addMessage,
    deleteConversation,
    selectConversation,
    startNewConversation,
  } = useChatConversations();

  const handleSendMessage = async (content: string) => {
    setIsLoading(true);

    try {
      let conversationId = currentConversationId;

      // Create new conversation if needed
      if (!conversationId) {
        conversationId = await createConversation(content);
        if (!conversationId) {
          throw new Error("Failed to create conversation");
        }
      }

      // Add user message
      await addMessage(conversationId, "user", content);

      // Call N8N webhook
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const { data, error } = await supabase.functions.invoke("chat-n8n", {
        body: {
          message: content,
          conversationHistory,
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw error;
      }

      const responseText = data?.response || data?.output || data?.message || "Desculpe, não consegui processar sua solicitação.";

      // Add assistant message
      await addMessage(conversationId, "assistant", responseText);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erro ao enviar mensagem");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative h-full -m-6">
      <div className="absolute inset-0">
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default AssistenteIA;