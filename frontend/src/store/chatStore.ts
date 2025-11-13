// src/store/chatStore.ts
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

// Mock data for development
const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    participants: [
      { id: 'admin-1', name: 'FIA Admin', type: 'admin' },
      { id: 'org-1', name: 'Bank of Uganda', type: 'organization', orgCode: 'BOU' },
    ],
    type: 'admin_to_org',
    lastMessageAt: new Date('2024-12-13T14:30:00'),
    unreadCount: 2,
    createdAt: new Date('2024-12-10T09:00:00'),
    lastMessage: {
      id: 'msg-3',
      conversationId: 'conv-1',
      senderId: 'org-1',
      senderName: 'Bank of Uganda',
      senderType: 'organization',
      senderOrgCode: 'BOU',
      content: 'We have a question about indicator 1.6. Can you clarify?',
      messageType: 'text',
      readBy: [],
      createdAt: new Date('2024-12-13T14:30:00'),
    },
  },
  {
    id: 'conv-2',
    participants: [
      { id: 'admin-1', name: 'FIA Admin', type: 'admin' },
      { id: 'org-2', name: 'Uganda Revenue Authority', type: 'organization', orgCode: 'URA' },
    ],
    type: 'admin_to_org',
    lastMessageAt: new Date('2024-12-13T10:15:00'),
    unreadCount: 1,
    createdAt: new Date('2024-12-11T11:00:00'),
    lastMessage: {
      id: 'msg-5',
      conversationId: 'conv-2',
      senderId: 'admin-1',
      senderName: 'FIA Admin',
      senderType: 'admin',
      content: 'Your December submission is overdue. Please submit by end of day.',
      messageType: 'text',
      readBy: [],
      createdAt: new Date('2024-12-13T10:15:00'),
    },
  },
  {
    id: 'conv-3',
    participants: [
      { id: 'org-1', name: 'Bank of Uganda', type: 'organization', orgCode: 'BOU' },
      { id: 'org-2', name: 'Uganda Revenue Authority', type: 'organization', orgCode: 'URA' },
    ],
    type: 'org_to_org',
    lastMessageAt: new Date('2024-12-12T16:45:00'),
    unreadCount: 0,
    createdAt: new Date('2024-12-12T15:00:00'),
    lastMessage: {
      id: 'msg-7',
      conversationId: 'conv-3',
      senderId: 'org-2',
      senderName: 'Uganda Revenue Authority',
      senderType: 'organization',
      senderOrgCode: 'URA',
      content: 'Thanks for sharing your approach!',
      messageType: 'text',
      readBy: ['org-1'],
      createdAt: new Date('2024-12-12T16:45:00'),
    },
  },
];

const mockMessages: Record<string, ChatMessage[]> = {
  'conv-1': [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'admin-1',
      senderName: 'FIA Admin',
      senderType: 'admin',
      content: 'Please submit your December 2024 statistics by end of day.',
      messageType: 'text',
      readBy: ['org-1', 'admin-1'],
      createdAt: new Date('2024-12-13T14:00:00'),
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      senderId: 'org-1',
      senderName: 'Bank of Uganda',
      senderType: 'organization',
      senderOrgCode: 'BOU',
      content: "We're working on it. Almost ready!",
      messageType: 'text',
      readBy: ['org-1', 'admin-1'],
      createdAt: new Date('2024-12-13T14:15:00'),
    },
    {
      id: 'msg-3',
      conversationId: 'conv-1',
      senderId: 'org-1',
      senderName: 'Bank of Uganda',
      senderType: 'organization',
      senderOrgCode: 'BOU',
      content: 'We have a question about indicator 1.6. Can you clarify the definition?',
      messageType: 'text',
      readBy: ['org-1'],
      createdAt: new Date('2024-12-13T14:30:00'),
    },
  ],
  'conv-2': [
    {
      id: 'msg-4',
      conversationId: 'conv-2',
      senderId: 'org-2',
      senderName: 'Uganda Revenue Authority',
      senderType: 'organization',
      senderOrgCode: 'URA',
      content: 'Good morning! We need an extension for our December submission.',
      messageType: 'text',
      readBy: ['org-2', 'admin-1'],
      createdAt: new Date('2024-12-13T09:00:00'),
    },
    {
      id: 'msg-5',
      conversationId: 'conv-2',
      senderId: 'admin-1',
      senderName: 'FIA Admin',
      senderType: 'admin',
      content: 'Your December submission is overdue. Please submit by end of day.',
      messageType: 'text',
      readBy: ['admin-1'],
      createdAt: new Date('2024-12-13T10:15:00'),
    },
  ],
  'conv-3': [
    {
      id: 'msg-6',
      conversationId: 'conv-3',
      senderId: 'org-1',
      senderName: 'Bank of Uganda',
      senderType: 'organization',
      senderOrgCode: 'BOU',
      content: 'How do you calculate indicator 3.2 in your system?',
      messageType: 'text',
      readBy: ['org-1', 'org-2'],
      createdAt: new Date('2024-12-12T16:00:00'),
    },
    {
      id: 'msg-7',
      conversationId: 'conv-3',
      senderId: 'org-2',
      senderName: 'Uganda Revenue Authority',
      senderType: 'organization',
      senderOrgCode: 'URA',
      content: "We use a monthly aggregation method. I can share our template if you'd like.",
      messageType: 'text',
      readBy: ['org-1', 'org-2'],
      createdAt: new Date('2024-12-12T16:30:00'),
    },
    {
      id: 'msg-8',
      conversationId: 'conv-3',
      senderId: 'org-2',
      senderName: 'Uganda Revenue Authority',
      senderType: 'organization',
      senderOrgCode: 'URA',
      content: 'Thanks for sharing your approach!',
      messageType: 'text',
      readBy: ['org-1', 'org-2'],
      createdAt: new Date('2024-12-12T16:45:00'),
    },
  ],
};

export const useChatStore = create<ChatState>((set, get) => ({
  currentUser: null,
  conversations: mockConversations,
  messages: mockMessages,
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
    })),
}));