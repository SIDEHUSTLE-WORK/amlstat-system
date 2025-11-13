// backend/src/routes/adminRoutes.ts
import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth'; 
import { 
  getDashboardStats, 
} from '../controllers/adminController';

const router = Router();

// Apply auth and admin middleware to all routes
router.use(authMiddleware); // ✅ Changed from authenticate
router.use(adminMiddleware); // ✅ Changed from authorize

// Dashboard stats
router.get('/dashboard', getDashboardStats);

// System statistics


export default router;