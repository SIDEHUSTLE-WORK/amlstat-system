// backend/src/routes/organizationRoutes.ts
import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  toggleOrganizationStatus,
  getOrganizationStatistics
} from '../controllers/organizationController';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// 🏢 GET ALL ORGANIZATIONS
router.get('/', getAllOrganizations);

// 🏢 CREATE ORGANIZATION (Admin only)
router.post('/', adminMiddleware, createOrganization);

// 🏢 GET ORGANIZATION STATISTICS (Must be before /:id)
router.get('/:id/statistics', getOrganizationStatistics);

// 🏢 TOGGLE ORGANIZATION STATUS (Admin only)
router.patch('/:id/toggle-status', adminMiddleware, toggleOrganizationStatus);

// 🏢 GET ORGANIZATION BY ID
router.get('/:id', getOrganizationById);

// 🏢 UPDATE ORGANIZATION (Admin only)
router.put('/:id', adminMiddleware, updateOrganization);

// 🏢 DELETE ORGANIZATION (Admin only)
router.delete('/:id', adminMiddleware, deleteOrganization);

export default router;