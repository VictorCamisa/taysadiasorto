import { ChatInterface } from "@/components/assistente/ChatInterface";
import { useChatConversations } from "@/hooks/useChatConversations";
import { toast } from "sonner";

const CHAT_URL = `https://ynstyufdfrctktsgwxwv.supabase.co/functions/v1/assistente-ia`;

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

      // Build conversation history
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Call AI function with streaming
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Limite de requisições excedido. Aguarde um momento.");
          return;
        }
        if (response.status === 402) {
          toast.error("Créditos de IA esgotados.");
          return;
        }
        throw new Error(`HTTP error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      // Process streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = "";
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        // Process line-by-line
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantResponse += delta;
            }
          } catch {
            // Incomplete JSON, put back and wait for more data
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Add assistant message
      if (assistantResponse) {
        await addMessage(conversationId, "assistant", assistantResponse);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AssistenteIA;
