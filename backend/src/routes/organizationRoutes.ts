// backend/src/routes/organizationRoutes.ts
import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth'; // ✅ Changed from authenticate, authorize
import {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization
} from '../controllers/organizationController';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware); // ✅ Changed from authenticate

// Get all organizations
router.get('/', getAllOrganizations);

// Get single organization
router.get('/:id', getOrganizationById);

// Create organization (Admin only)
router.post('/', adminMiddleware, createOrganization); // ✅ Changed from authorize

// Update organization (Admin only)
router.put('/:id', adminMiddleware, updateOrganization); // ✅ Changed from authorize

// Delete organization (Admin only)
router.delete('/:id', adminMiddleware, deleteOrganization); // ✅ Changed from authorize

export default router;