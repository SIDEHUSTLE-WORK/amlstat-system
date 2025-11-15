// frontend/src/store/chatStore.ts
import { create } from 'zustand';
import type { Conversation, ChatMessage, ChatUser } from '../types/chat';

interface ChatState {
  currentUser: ChatUser | null;
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>; // conversationId -> messages[]
  activeConversationId: string | null;
  isRecordingAudio: boolean;
  
  // Actions
  setCurrentUser: (user: ChatUser) => void;
  setConversations: (conversations: Conversation[]) => void;
  setMessages: (conversationId: string, messages: ChatMessage[]) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  setActiveConversation: (conversationId: string | null) => void;
  markAsRead: (conversationId: string, userId: string) => void;
  startRecording: () => void;
  stopRecording: () => void;
  createConversation: (conversation: Conversation) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  currentUser: null,
  conversations: [], // 🔥 NO MOCK DATA - STARTS EMPTY!
  messages: {}, // 🔥 NO MOCK DATA - STARTS EMPTY!
  activeConversationId: null,
  isRecordingAudio: false,

  setCurrentUser: (user) => set({ currentUser: user }),

  setConversations: (conversations) => set({ conversations }),

  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: messages,
      },
    })),

  addMessage: (conversationId, message) =>
    set((state) => {
      const conversationMessages = state.messages[conversationId] || [];
      return {
        messages: {
          ...state.messages,
          [conversationId]: [...conversationMessages, message],
        },
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                lastMessage: message,
                lastMessageAt: message.createdAt,
                unreadCount:
                  message.senderId !== state.currentUser?.id
                    ? conv.unreadCount + 1
                    : conv.unreadCount,
              }
            : conv
        ),
      };
    }),

  setActiveConversation: (conversationId) =>
    set({ activeConversationId: conversationId }),

  markAsRead: (conversationId, userId) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? { ...conv, unreadCount: 0 }
          : conv
      ),
      messages: {
        ...state.messages,
        [conversationId]: state.messages[conversationId]?.map((msg) => ({
          ...msg,
          readBy: msg.readBy.includes(userId) ? msg.readBy : [...msg.readBy, userId],
        })),
      },
    })),

  startRecording: () => set({ isRecordingAudio: true }),

  stopRecording: () => set({ isRecordingAudio: false }),

  createConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
      messages: {
        ...state.messages,
        [conversation.id]: [], // Initialize empty messages array for new conversation
      },
    })),
}));