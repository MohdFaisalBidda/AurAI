import { useEffect, useState } from "react";

const BACKEND_URL = "http://localhost:3001";

enum Role {
  USER = "user",
  ASSISTANT = "assistant"
}

export interface Messages {
  id: string,
  content: string,
  converstionId: string,
  createdAt: string,
  role: Role,
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  messages: Messages[]
  updatedAt: string;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createNewConversation = async () => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const conversation: Conversation = {
      id,
      title: "New Conversation",
      createdAt: now,
      updatedAt: now,
      messages: []
    };

    const response = await fetch(`${BACKEND_URL}/ai/conversation/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(conversation)
    });

    const data = await response.json();

    setConversations((prev) => [data, ...(Array.isArray(prev) ? prev : [])]);
    console.log(id, "new conversation id");

    return id;
  }

  const deleteConversation = async (conversationId: string) => {
    const response = await fetch(`${BACKEND_URL}/ai/conversation/${conversationId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });

    const data = await response.json();
    console.log(data, "data of conversation");

    setConversations(conversations.filter((conv) => conv.id !== conversationId));
  }

  const refreshConversations = async () => {
    const response = await fetch(`${BACKEND_URL}/ai/conversations`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });
    const data = await response.json();
    setConversations(data.conversations);
  }

  useEffect(() => {
    const fetchMessage = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${BACKEND_URL}/ai/conversations`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setConversations(data.conversations);
      } catch (error) {
        console.error("Error fetching conversation:", error);
        setError("Failed to fetch the conversation");
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, []);

  return { conversations, refreshConversations, createNewConversation, deleteConversation, loading, error };
}