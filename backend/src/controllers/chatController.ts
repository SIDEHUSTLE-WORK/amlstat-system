// backend/src/controllers/chatController.ts
import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

// 💬 GET ALL CONVERSATIONS FOR A USER
export const getConversations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    
    const mockConversations = [
      {
        id: 'conv-1',
        participants: [
          { id: 'admin-1', name: 'FIA Admin', type: 'admin' },
          { id: userId, name: req.user!.email, type: userRole, orgCode: 'BOU' }, // 🔥 Use email
        ],
        type: 'admin_to_org',
        lastMessage: {
          content: 'Please submit your December 2024 statistics by end of day.',
          createdAt: new Date('2024-12-13T14:00:00'),
        },
        unreadCount: 0,
        lastMessageAt: new Date('2024-12-13T14:30:00'),
        createdAt: new Date('2024-12-10T09:00:00'),
      },
    ];

    res.json({
      success: true,
      data: { conversations: mockConversations }
    });

    console.log('✅ Retrieved conversations for user:', userId);
  } catch (error) {
    console.error('❌ Get conversations error:', error);
    next(error);
  }
};

// 💬 GET MESSAGES FOR A CONVERSATION
export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user!.id;

    const mockMessages = [
      {
        id: 'msg-1',
        conversationId,
        senderId: 'admin-1',
        senderName: 'FIA Admin',
        senderType: 'admin',
        content: 'Please submit your December 2024 statistics by end of day.',
        messageType: 'text',
        readBy: ['admin-1'],
        createdAt: new Date('2024-12-13T14:00:00'),
      },
      {
        id: 'msg-2',
        conversationId,
        senderId: userId,
        senderName: req.user!.email, // 🔥 Use email
        senderType: req.user!.role,
        content: 'We are working on it. Will submit by 5 PM.',
        messageType: 'text',
        readBy: [userId],
        createdAt: new Date('2024-12-13T14:15:00'),
      },
    ];

    res.json({
      success: true,
      data: { messages: mockMessages }
    });

    console.log('✅ Retrieved messages for conversation:', conversationId);
  } catch (error) {
    console.error('❌ Get messages error:', error);
    next(error);
  }
};

// 💬 CREATE CONVERSATION
export const createConversation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { recipientId, recipientType } = req.body;
    const userId = req.user!.id;

    const newConversation = {
      id: `conv-${Date.now()}`,
      participants: [
        { id: userId, name: req.user!.email, type: req.user!.role }, // 🔥 Use email
        { id: recipientId, type: recipientType },
      ],
      type: 'admin_to_org',
      lastMessageAt: new Date(),
      unreadCount: 0,
      createdAt: new Date(),
    };

    res.status(201).json({
      success: true,
      data: { conversation: newConversation },
      message: 'Conversation created successfully'
    });

    console.log('✅ Conversation created');
  } catch (error) {
    console.error('❌ Create conversation error:', error);
    next(error);
  }
};

// 💬 SEND MESSAGE
export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { conversationId } = req.params;
    const { content, messageType = 'text' } = req.body;
    const userId = req.user!.id;

    let attachments: any[] = [];
    
    if (req.files && Array.isArray(req.files)) {
      attachments = (req.files as Express.Multer.File[]).map((file) => ({
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

    const newMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: userId,
      senderName: req.user!.email, // 🔥 Use email
      senderType: req.user!.role,
      content,
      messageType,
      attachments: attachments.length > 0 ? attachments : undefined,
      readBy: [userId],
      createdAt: new Date(),
    };

    res.status(201).json({
      success: true,
      data: { message: newMessage },
      message: 'Message sent successfully'
    });

    console.log('✅ Message sent');
  } catch (error) {
    console.error('❌ Send message error:', error);
    next(error);
  }
};

// 💬 MARK MESSAGES AS READ
export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user!.id;

    res.json({
      success: true,
      message: 'Messages marked as read'
    });

    console.log('✅ Messages marked as read');
  } catch (error) {
    console.error('❌ Mark as read error:', error);
    next(error);
  }
};

// 💬 DELETE CONVERSATION
export const deleteConversation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user!.id;

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });

    console.log('✅ Conversation deleted');
  } catch (error) {
    console.error('❌ Delete conversation error:', error);
    next(error);
  }
};

// 💬 GET UNREAD COUNT
export const getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    res.json({
      success: true,
      data: { unreadCount: 0 }
    });

    console.log('✅ Retrieved unread count');
  } catch (error) {
    console.error('❌ Get unread count error:', error);
    next(error);
  }
};