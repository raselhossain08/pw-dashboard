"use client";

import { apiClient } from "@/lib/api-client";
import { io, Socket } from "socket.io-client";
import { getAccessToken } from "@/lib/cookies";

function getSocketBase() {
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  return API.replace(/\/api$/, "");
}

export type ChatMessage = {
  _id: string;
  conversation: string;
  sender: { _id: string; firstName?: string; lastName?: string; avatar?: string } | string;
  content: string;
  type?: string;
  createdAt?: string;
};

export type ChatConversation = {
  _id: string;
  title?: string;
  participants: Array<{ _id: string; firstName?: string; lastName?: string; avatar?: string }> | string[];
  lastMessage?: ChatMessage | string;
  unreadCount?: number;
  metadata?: Record<string, unknown>;
  createdAt?: string;
};

export const chatService = {
  connect(): Socket {
    const token = getAccessToken();
    const socketBase = getSocketBase();
    console.log('[Chat] Connecting to:', `${socketBase}/chat`);
    console.log('[Chat] Token available:', !!token);

    const socket = io(`${socketBase}/chat`, {
      auth: { token: token ? `Bearer ${token}` : undefined },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socket.on('connect_error', (error) => {
      console.error('[Chat] Connection error:', error.message);
    });

    return socket;
  },

  joinConversation(socket: Socket, conversationId: string) {
    return new Promise<{ success: boolean; messages?: ChatMessage[]; error?: string }>((resolve) => {
      socket.emit(
        "join_conversation",
        { conversationId },
        (resp: { success: boolean; messages?: ChatMessage[]; error?: string }) => resolve(resp)
      );
    });
  },

  sendMessageSocket(socket: Socket, conversationId: string, content: string, type?: string) {
    return new Promise<{ success: boolean; message?: ChatMessage; error?: string }>((resolve) => {
      socket.emit(
        "send_message",
        { conversationId, content, type },
        (resp: { success: boolean; message?: ChatMessage; error?: string }) => resolve(resp)
      );
    });
  },

  typingStart(socket: Socket, conversationId: string) {
    socket.emit("typing_start", { conversationId });
  },

  typingStop(socket: Socket, conversationId: string) {
    socket.emit("typing_stop", { conversationId });
  },

  startConversationSocket(socket: Socket, participantIds: string[], title?: string) {
    return new Promise<{ success: boolean; conversation?: ChatConversation; error?: string }>((resolve) => {
      socket.emit(
        "start_conversation",
        { participantIds, title },
        (resp: { success: boolean; conversation?: ChatConversation; error?: string }) => resolve(resp)
      );
    });
  },

  createConversationSocket(socket: Socket, payload: { title: string; participants: string[]; type: string }) {
    return new Promise<{ success: boolean; conversation?: ChatConversation; error?: string }>((resolve) => {
      socket.emit(
        "create_conversation",
        payload,
        (resp: { success: boolean; conversation?: ChatConversation; error?: string }) => resolve(resp)
      );
    });
  },

  getConversations() {
    return apiClient.get<{ conversations: ChatConversation[]; total: number }>("/chat/conversations");
  },

  async getMessages(conversationId: string, params?: { page?: number; limit?: number }) {
    try {
      const response = await apiClient.get<{ messages: ChatMessage[]; total: number }>(`/chat/conversations/${conversationId}/messages`, { params });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to load messages" };
    }
  },

  sendMessageRest(conversationId: string, payload: { content: string; type?: string }) {
    return apiClient.post<ChatMessage>(`/chat/conversations/${conversationId}/messages`, payload);
  },

  async deleteConversation(conversationId: string) {
    try {
      await apiClient.delete(`/chat/conversations/${conversationId}`);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to delete conversation" };
    }
  },

  deleteMessage(messageId: string) {
    return apiClient.delete(`/chat/messages/${messageId}`);
  },

  markAsRead(messageId: string) {
    return apiClient.patch(`/chat/messages/${messageId}/read`, {});
  },

  async updateMessage(messageId: string, content: string) {
    try {
      const response = await apiClient.patch<ChatMessage>(`/chat/messages/${messageId}`, { content });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to update message" };
    }
  },

  async archiveConversation(conversationId: string, archived: boolean) {
    try {
      const response = await apiClient.patch<ChatConversation>(`/chat/conversations/${conversationId}/archive`, { archived });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to archive conversation" };
    }
  },

  async starConversation(conversationId: string, starred: boolean) {
    try {
      const response = await apiClient.patch<ChatConversation>(`/chat/conversations/${conversationId}/star`, { starred });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to star conversation" };
    }
  },
};
