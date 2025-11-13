// backend/src/routes/chat.routes.ts
import { Router } from 'express';
import {
  getConversations,
  getMessages,
  createConversation,
  sendMessage,
  markAsRead,
} from '../controllers/chatController';
import { upload } from '../middleware/upload';
import { authMiddleware } from '../middleware/auth'; 

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all conversations for a user
router.get('/conversations/:userId', getConversations);

// Get messages for a specific conversation
router.get('/conversations/:conversationId/messages', getMessages);

// Create a new conversation
router.post('/conversations', createConversation);

// Send a message (with optional file attachments)
router.post('/conversations/:conversationId/messages', upload.array('files', 5), sendMessage);

// Mark messages as read
router.put('/conversations/:conversationId/read', markAsRead);

export default router;