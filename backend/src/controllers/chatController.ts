// backend/src/controllers/chatController.ts
import { Request, Response } from 'express';

// Mock data storage (replace with database later)
let conversations: any[] = [
  {
    id: 'conv-1',
    participants: [
      { id: 'admin-1', name: 'FIA Admin', type: 'admin' },
      { id: 'org-1', name: 'Bank of Uganda', type: 'organization', orgCode: 'BOU' },
    ],
    type: 'admin_to_org',
    lastMessageAt: new Date('2024-12-13T14:30:00'),
    unreadCount: 0,
    createdAt: new Date('2024-12-10T09:00:00'),
  },
];

let messages: any[] = [
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
];

// Get all conversations for a user
export const getConversations = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Filter conversations where user is a participant
    const userConversations = conversations.filter(conv =>
      conv.participants.some((p: any) => p.id === userId)
    );

    // Add last message to each conversation
    const conversationsWithMessages = userConversations.map(conv => {
      const convMessages = messages.filter(m => m.conversationId === conv.id);
      const lastMessage = convMessages.length > 0 
        ? convMessages[convMessages.length - 1] 
        : null;
      
      // Count unread messages
      const unreadCount = convMessages.filter(
        m => !m.readBy.includes(userId)
      ).length;

      return {
        ...conv,
        lastMessage,
        unreadCount,
        lastMessageAt: lastMessage ? lastMessage.createdAt : conv.createdAt,
      };
    });

    // Sort by last message time
    conversationsWithMessages.sort((a, b) => 
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );

    res.json({
      success: true,
      data: conversationsWithMessages,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
    });
  }
};

// Get messages for a conversation
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    const conversationMessages = messages
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    res.json({
      success: true,
      data: conversationMessages,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
    });
  }
};

// Create a new conversation
export const createConversation = async (req: Request, res: Response) => {
  try {
    const { participants, type } = req.body;

    // Check if conversation already exists
    const existingConv = conversations.find(conv =>
      conv.participants.every((p: any) =>
        participants.some((newP: any) => newP.id === p.id)
      ) && conv.participants.length === participants.length
    );

    if (existingConv) {
      return res.json({
        success: true,
        data: existingConv,
        message: 'Conversation already exists',
      });
    }

    // Create new conversation
    const newConversation = {
      id: `conv-${Date.now()}`,
      participants,
      type,
      lastMessageAt: new Date(),
      unreadCount: 0,
      createdAt: new Date(),
    };

    conversations.push(newConversation);

    res.status(201).json({
      success: true,
      data: newConversation,
      message: 'Conversation created successfully',
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create conversation',
    });
  }
};

// Send a message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { senderId, senderName, senderType, senderOrgCode, content, messageType } = req.body;

    // Handle file attachments
    let attachments: any[] = [];
    
    if (req.files && Array.isArray(req.files)) {
      attachments = req.files.map((file: Express.Multer.File) => ({
        id: `att-${Date.now()}-${Math.random()}`,
        fileName: file.originalname,
        fileType: file.mimetype.startsWith('image/') ? 'image' : 
                  file.mimetype === 'application/pdf' ? 'pdf' :
                  file.mimetype.includes('audio') ? 'audio' : 'document',
        fileUrl: `/uploads/${file.filename}`,
        fileSize: file.size,
        uploadedAt: new Date(),
      }));
    }

    // Create new message
    const newMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId,
      senderName,
      senderType,
      senderOrgCode,
      content,
      messageType: messageType || 'text',
      attachments: attachments.length > 0 ? attachments : undefined,
      readBy: [senderId],
      createdAt: new Date(),
    };

    messages.push(newMessage);

    // Update conversation last message time
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      conversation.lastMessageAt = new Date();
    }

    res.status(201).json({
      success: true,
      data: newMessage,
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
    });
  }
};

// Mark messages as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    // Mark all messages in conversation as read by this user
    messages
      .filter(m => m.conversationId === conversationId)
      .forEach(message => {
        if (!message.readBy.includes(userId)) {
          message.readBy.push(userId);
        }
      });

    res.json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
    });
  }
};