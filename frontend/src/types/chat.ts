// src/types/chat.ts

export type MessageType = 'text' | 'file' | 'image' | 'audio';

export interface ChatAttachment {
  id: string;
  fileName: string;
  fileType: 'image' | 'pdf' | 'audio' | 'document' | 'excel' | 'video';
  fileUrl: string;
  fileSize: number;
  uploadedAt: Date;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: 'admin' | 'organization';
  senderOrgCode?: string;
  content: string;
  messageType: MessageType;
  attachments?: ChatAttachment[];
  readBy: string[];
  createdAt: Date;
}

export interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    type: 'admin' | 'organization';
    orgCode?: string;
  }[];
  type: 'admin_to_org' | 'org_to_org';
  lastMessage?: ChatMessage;
  lastMessageAt: Date;
  unreadCount: number;
  createdAt: Date;
}

export interface ChatUser {
  id: string;
  name: string;
  type: 'admin' | 'organization';
  organizationId?: string;
  organizationCode?: string;
  organizationName?: string;
}