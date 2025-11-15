// backend/src/routes/chat.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { upload } from '../middleware/upload';
import {
  getConversations,
  getMessages,
  createConversation,
  sendMessage,
  markAsRead,
  deleteConversation,
  getUnreadCount
} from '../controllers/chatController';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// 💬 GET UNREAD COUNT
router.get('/unread-count', getUnreadCount);

// 💬 GET ALL CONVERSATIONS
router.get('/conversations', getConversations);

// 💬 CREATE CONVERSATION
router.post('/conversations', createConversation);

// 💬 GET MESSAGES FOR A CONVERSATION
router.get('/conversations/:conversationId/messages', getMessages);

// 💬 SEND MESSAGE (with optional file attachments)
router.post('/conversations/:conversationId/messages', upload.array('files', 5), sendMessage);

// 💬 MARK MESSAGES AS READ
router.put('/conversations/:conversationId/read', markAsRead);

// 💬 DELETE CONVERSATION
router.delete('/conversations/:conversationId', deleteConversation);

export default router;