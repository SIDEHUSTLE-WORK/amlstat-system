// backend/src/routes/adminRoutes.ts
import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { 
  getDashboardStats,
  getSystemOverview,
  getComplianceReport,
  getFinancialMetrics,
  exportData,
  getSystemStatistics
} from '../controllers/adminController';

const router = Router();

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// 📊 DASHBOARD STATS
router.get('/dashboard', getDashboardStats);

// 📊 SYSTEM OVERVIEW
router.get('/overview', getSystemOverview);

// 📊 COMPLIANCE REPORT
router.get('/compliance-report', getComplianceReport);

// 📊 FINANCIAL METRICS
router.get('/financial-metrics', getFinancialMetrics);

// 📊 SYSTEM STATISTICS
router.get('/statistics', getSystemStatistics);

// 📊 EXPORT DATA
router.get('/export/:type', exportData);

export default router;