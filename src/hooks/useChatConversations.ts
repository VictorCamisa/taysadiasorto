import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export const useChatConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load conversations (last 10)
  const loadConversations = async () => {
    const { data, error } = await supabase
      .from("chat_conversations")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setConversations(data);
    }
  };

  // Load messages for a conversation
  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data as Message[]);
    }
  };

  // Create new conversation
  const createConversation = async (firstMessage: string) => {
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : "");

    const { data, error } = await supabase
      .from("chat_conversations")
      .insert([{ title, user_id: "00000000-0000-0000-0000-000000000000" }])
      .select()
      .single();

    if (!error && data) {
      await loadConversations();
      return data.id;
    }

    return null;
  };

  // Add message to conversation
  const addMessage = async (conversationId: string, role: "user" | "assistant", content: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        conversation_id: conversationId,
        role,
        content,
      })
      .select()
      .single();

    if (!error && data) {
      setMessages((prev) => [...prev, data as Message]);

      // Update conversation timestamp
      await supabase
        .from("chat_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      await loadConversations();
    }

    return data;
  };

  // Delete conversation
  const deleteConversation = async (conversationId: string) => {
    await supabase.from("chat_conversations").delete().eq("id", conversationId);
    
    if (currentConversationId === conversationId) {
      setCurrentConversationId(null);
      setMessages([]);
    }
    
    await loadConversations();
  };

  // Select conversation
  const selectConversation = async (conversationId: string) => {
    setCurrentConversationId(conversationId);
    await loadMessages(conversationId);
  };

  // Start new conversation
  const startNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
  };

  useEffect(() => {
    loadConversations();
  }, []);

  return {
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
    setMessages,
  };
};
