// frontend/src/services/chatService.ts
import axios from 'axios';
import type { Conversation, ChatMessage } from '../types/chat';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'; // 🔥 CHANGED FROM 3000 TO 5001

// Create axios instance with default config
const chatApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
chatApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken'); // 🔥 CHANGED FROM 'token' TO 'accessToken'
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get all conversations for a user
export const getConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const response = await chatApi.get(`/chat/conversations/${userId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

// Get messages for a specific conversation
export const getMessages = async (conversationId: string): Promise<ChatMessage[]> => {
  try {
    const response = await chatApi.get(`/chat/conversations/${conversationId}/messages`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Create a new conversation
export const createConversation = async (data: {
  participants: Array<{
    id: string;
    name: string;
    type: 'admin' | 'organization';
    orgCode?: string;
  }>;
  type: 'admin_to_org' | 'org_to_org';
}): Promise<Conversation> => {
  try {
    const response = await chatApi.post('/chat/conversations', data);
    return response.data.data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

// Send a text message
export const sendMessage = async (
  conversationId: string,
  data: {
    senderId: string;
    senderName: string;
    senderType: 'admin' | 'organization';
    senderOrgCode?: string;
    content: string;
    messageType?: 'text' | 'file' | 'image' | 'audio';
  }
): Promise<ChatMessage> => {
  try {
    const response = await chatApi.post(
      `/chat/conversations/${conversationId}/messages`,
      data
    );
    return response.data.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Send a message with file attachments
export const sendMessageWithFiles = async (
  conversationId: string,
  data: {
    senderId: string;
    senderName: string;
    senderType: 'admin' | 'organization';
    senderOrgCode?: string;
    content: string;
    messageType?: 'text' | 'file' | 'image' | 'audio';
  },
  files: File[]
): Promise<ChatMessage> => {
  try {
    const formData = new FormData();
    
    // Append text data
    formData.append('senderId', data.senderId);
    formData.append('senderName', data.senderName);
    formData.append('senderType', data.senderType);
    if (data.senderOrgCode) {
      formData.append('senderOrgCode', data.senderOrgCode);
    }
    formData.append('content', data.content);
    formData.append('messageType', data.messageType || 'file');
    
    // Append files
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await chatApi.post(
      `/chat/conversations/${conversationId}/messages`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error sending message with files:', error);
    throw error;
  }
};

// Send a message with audio blob
export const sendMessageWithAudio = async (
  conversationId: string,
  data: {
    senderId: string;
    senderName: string;
    senderType: 'admin' | 'organization';
    senderOrgCode?: string;
    content: string;
  },
  audioBlob: Blob
): Promise<ChatMessage> => {
  try {
    const formData = new FormData();
    
    // Append text data
    formData.append('senderId', data.senderId);
    formData.append('senderName', data.senderName);
    formData.append('senderType', data.senderType);
    if (data.senderOrgCode) {
      formData.append('senderOrgCode', data.senderOrgCode);
    }
    formData.append('content', data.content || 'Voice message');
    formData.append('messageType', 'audio');
    
    // Create file from blob
    const audioFile = new File([audioBlob], 'voice-message.webm', { type: 'audio/webm' });
    formData.append('files', audioFile);

    const response = await chatApi.post(
      `/chat/conversations/${conversationId}/messages`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error sending audio message:', error);
    throw error;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  try {
    await chatApi.put(`/chat/conversations/${conversationId}/read`, { userId });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

// Poll for new messages (call this every few seconds)
export const pollMessages = async (
  conversationId: string,
  lastMessageId?: string
): Promise<ChatMessage[]> => {
  try {
    const response = await chatApi.get(`/chat/conversations/${conversationId}/messages`, {
      params: { after: lastMessageId },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error polling messages:', error);
    return [];
  }
};

// Get file URL (prepend backend URL)
export const getFileUrl = (path: string): string => {
  if (path.startsWith('http')) {
    return path;
  }
  const baseUrl = API_URL.replace('/api', '');
  return `${baseUrl}${path}`;
};