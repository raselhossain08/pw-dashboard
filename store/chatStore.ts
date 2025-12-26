import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ChatConversation, ChatMessage } from '@/services/chat.service';
import type { Socket } from 'socket.io-client';

export type Message = {
  id: string;
  sender: "me" | "other";
  content: string;
  time: string;
  type?: "text" | "code" | "image" | "file";
  codeLanguage?: string;
  fileUrl?: string;
  fileName?: string;
  isEdited?: boolean;
  isRead?: boolean;
  readBy?: string[];
  createdAt?: string;
};

export type Conversation = {
  id: string;
  name: string;
  topic: string;
  avatarUrl: string;
  online: boolean;
  lastMessage: string;
  lastTime: string;
  unread?: number;
  messages: Message[];
  participants?: Array<{ _id: string; firstName?: string; lastName?: string; avatar?: string } | string>;
  archived?: boolean;
  starred?: boolean;
};

export interface ChatFilters {
  search?: string;
  filterTab?: "all" | "unread" | "archived" | "starred";
}

interface ChatState {
  // Data
  conversations: Conversation[];
  selectedConversationId: string | null;
  messages: Record<string, Message[]>; // conversationId -> messages
  onlineUsers: Set<string>;

  // Socket
  socket: Socket | null;
  isConnected: boolean;

  // Loading states
  isLoading: boolean;
  isSending: boolean;
  isTyping: Record<string, boolean>; // conversationId -> isTyping
  isLoadingMessages: Record<string, boolean>; // conversationId -> isLoading

  // UI states
  searchQuery: string;
  filterTab: "all" | "unread" | "archived" | "starred";
  isNewChatOpen: boolean;
  isDeleteDialogOpen: boolean;
  conversationToDelete: string | null;

  // Pagination
  messagePages: Record<string, number>; // conversationId -> current page
  hasMoreMessages: Record<string, boolean>; // conversationId -> hasMore

  // Error states
  error: string | null;

  // Actions - Data
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  removeConversation: (id: string) => void;
  setSelectedConversation: (id: string | null) => void;

  // Actions - Messages
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  removeMessage: (conversationId: string, messageId: string) => void;
  prependMessages: (conversationId: string, messages: Message[]) => void;

  // Actions - Socket
  setSocket: (socket: Socket | null) => void;
  setConnected: (connected: boolean) => void;

  // Actions - Loading
  setLoading: (loading: boolean) => void;
  setSending: (sending: boolean) => void;
  setTyping: (conversationId: string, typing: boolean) => void;
  setLoadingMessages: (conversationId: string, loading: boolean) => void;

  // Actions - UI
  setSearchQuery: (query: string) => void;
  setFilterTab: (tab: "all" | "unread" | "archived" | "starred") => void;
  setNewChatOpen: (open: boolean) => void;
  setDeleteDialogOpen: (open: boolean) => void;
  setConversationToDelete: (id: string | null) => void;

  // Actions - Pagination
  setMessagePage: (conversationId: string, page: number) => void;
  setHasMoreMessages: (conversationId: string, hasMore: boolean) => void;

  // Actions - Online users
  setOnlineUsers: (users: Set<string>) => void;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;

  // Actions - Error
  setError: (error: string | null) => void;
  clearError: () => void;

  // Actions - Reset
  resetStore: () => void;
}

const initialState = {
  conversations: [],
  selectedConversationId: null,
  messages: {},
  onlineUsers: new Set<string>(),
  socket: null,
  isConnected: false,
  isLoading: false,
  isSending: false,
  isTyping: {},
  isLoadingMessages: {},
  searchQuery: "",
  filterTab: "all" as const,
  isNewChatOpen: false,
  isDeleteDialogOpen: false,
  conversationToDelete: null,
  messagePages: {},
  hasMoreMessages: {},
  error: null,
};

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Data actions
      setConversations: (conversations) => set({ conversations }),
      addConversation: (conversation) =>
        set((state) => ({
          conversations: [conversation, ...state.conversations],
        })),
      updateConversation: (id, updates) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      removeConversation: (id) =>
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          messages: Object.fromEntries(
            Object.entries(state.messages).filter(([key]) => key !== id)
          ),
          selectedConversationId:
            state.selectedConversationId === id ? null : state.selectedConversationId,
        })),
      setSelectedConversation: (id) => set({ selectedConversationId: id }),

      // Message actions
      setMessages: (conversationId, messages) =>
        set((state) => ({
          messages: { ...state.messages, [conversationId]: messages },
        })),
      addMessage: (conversationId, message) =>
        set((state) => {
          const existing = state.messages[conversationId] || [];
          return {
            messages: {
              ...state.messages,
              [conversationId]: [...existing, message],
            },
          };
        }),
      updateMessage: (conversationId, messageId, updates) =>
        set((state) => {
          const messages = state.messages[conversationId] || [];
          return {
            messages: {
              ...state.messages,
              [conversationId]: messages.map((m) =>
                m.id === messageId ? { ...m, ...updates } : m
              ),
            },
          };
        }),
      removeMessage: (conversationId, messageId) =>
        set((state) => {
          const messages = state.messages[conversationId] || [];
          return {
            messages: {
              ...state.messages,
              [conversationId]: messages.filter((m) => m.id !== messageId),
            },
          };
        }),
      prependMessages: (conversationId, newMessages) =>
        set((state) => {
          const existing = state.messages[conversationId] || [];
          return {
            messages: {
              ...state.messages,
              [conversationId]: [...newMessages, ...existing],
            },
          };
        }),

      // Socket actions
      setSocket: (socket) => set({ socket }),
      setConnected: (connected) => set({ isConnected: connected }),

      // Loading actions
      setLoading: (loading) => set({ isLoading: loading }),
      setSending: (sending) => set({ isSending: sending }),
      setTyping: (conversationId, typing) =>
        set((state) => ({
          isTyping: { ...state.isTyping, [conversationId]: typing },
        })),
      setLoadingMessages: (conversationId, loading) =>
        set((state) => ({
          isLoadingMessages: {
            ...state.isLoadingMessages,
            [conversationId]: loading,
          },
        })),

      // UI actions
      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilterTab: (tab) => set({ filterTab: tab }),
      setNewChatOpen: (open) => set({ isNewChatOpen: open }),
      setDeleteDialogOpen: (open) => set({ isDeleteDialogOpen: open }),
      setConversationToDelete: (id) => set({ conversationToDelete: id }),

      // Pagination actions
      setMessagePage: (conversationId, page) =>
        set((state) => ({
          messagePages: { ...state.messagePages, [conversationId]: page },
        })),
      setHasMoreMessages: (conversationId, hasMore) =>
        set((state) => ({
          hasMoreMessages: {
            ...state.hasMoreMessages,
            [conversationId]: hasMore,
          },
        })),

      // Online users actions
      setOnlineUsers: (users) => set({ onlineUsers: users }),
      addOnlineUser: (userId) =>
        set((state) => {
          const newSet = new Set(state.onlineUsers);
          newSet.add(userId);
          return { onlineUsers: newSet };
        }),
      removeOnlineUser: (userId) =>
        set((state) => {
          const newSet = new Set(state.onlineUsers);
          newSet.delete(userId);
          return { onlineUsers: newSet };
        }),

      // Error actions
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Reset action
      resetStore: () => set(initialState),
    }),
    { name: 'ChatStore' }
  )
);
