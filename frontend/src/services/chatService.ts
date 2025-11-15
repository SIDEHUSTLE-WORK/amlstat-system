// frontend/src/services/chatService.ts
import { chatAPI } from './api';

// 🔥 FIXED: Message data interfaces with all required fields
export interface SendMessageData {
  content: string;
  senderId?: string;  // ADDED
  senderName?: string;
  senderType?: 'admin' | 'organization';
  senderOrgCode?: string;
  messageType?: 'text' | 'file' | 'image' | 'audio';
}

export interface SendAudioMessageData {
  content: string;
  senderId?: string;  // ADDED
  senderName?: string;
  senderType?: 'admin' | 'organization';
  senderOrgCode?: string;
}

// Send text message
export const sendMessage = async (conversationId: string, data: SendMessageData) => {
  return await chatAPI.sendMessage(conversationId, data);
};

// Send message with files
export const sendMessageWithFiles = async (
  conversationId: string,
  data: SendMessageData,
  files: File[]
) => {
  const formData = new FormData();
  formData.append('content', data.content);
  if (data.senderId) formData.append('senderId', data.senderId);
  if (data.senderName) formData.append('senderName', data.senderName);
  if (data.senderType) formData.append('senderType', data.senderType);
  if (data.senderOrgCode) formData.append('senderOrgCode', data.senderOrgCode);
  if (data.messageType) formData.append('messageType', data.messageType);
  
  files.forEach((file) => {
    formData.append('files', file);
  });

  return await chatAPI.sendMessageWithFiles(conversationId, formData);
};

// Send audio message
export const sendMessageWithAudio = async (
  conversationId: string,
  data: SendAudioMessageData,
  audioBlob: Blob
) => {
  const formData = new FormData();
  formData.append('content', data.content);
  if (data.senderId) formData.append('senderId', data.senderId);
  if (data.senderName) formData.append('senderName', data.senderName);
  if (data.senderType) formData.append('senderType', data.senderType);
  if (data.senderOrgCode) formData.append('senderOrgCode', data.senderOrgCode);
  formData.append('messageType', 'audio');
  formData.append('audio', audioBlob, 'voice-message.webm');

  return await chatAPI.sendMessageWithFiles(conversationId, formData);
};