// backend/src/routes/authRoutes.ts
import { Router } from 'express';
import { 
  login, 
  register, 
  refreshToken, 
  forgotPassword, 
  resetPassword, 
  logout,
  getCurrentUser,
  changePassword
} from '../controllers/authController';
import { authMiddleware } from '../middleware/auth'; // ✅ Changed from authenticate

const router = Router();

// Public routes
router.post('/login', login);
router.post('/register', register);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.post('/logout', authMiddleware, logout); // ✅ Changed from authenticate
router.get('/me', authMiddleware, getCurrentUser); // ✅ Changed from authenticate
router.post('/change-password', authMiddleware, changePassword); // ✅ Changed from authenticate

export default router;