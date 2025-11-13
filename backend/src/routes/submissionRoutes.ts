// backend/src/routes/submissionRoutes.ts
import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import {
  getAllSubmissions,
  getSubmissionsByOrg,
  getSubmissionById,
  createSubmission,
  updateSubmission,
  submitForReview,
  approveSubmission,
  rejectSubmission,
  deleteSubmission,
  getSubmissionStatistics
} from '../controllers/submissionController';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// 📊 GET SUBMISSION STATISTICS (Must be before /:id route)
router.get('/statistics', getSubmissionStatistics);

// 📊 GET ALL SUBMISSIONS (Admin only)
router.get('/', adminMiddleware, getAllSubmissions);

// 📊 GET SUBMISSIONS BY ORGANIZATION
router.get('/organization/:orgId', getSubmissionsByOrg);

// 📊 GET SINGLE SUBMISSION
router.get('/:id', getSubmissionById);

// 📊 CREATE SUBMISSION
router.post('/', createSubmission);

// 📊 UPDATE SUBMISSION
router.put('/:id', updateSubmission);

// 📊 SUBMIT FOR REVIEW
router.post('/:id/submit', submitForReview);

// 🔥 APPROVE SUBMISSION (Admin only)
router.post('/:id/approve', adminMiddleware, approveSubmission);

// 🔥 REJECT SUBMISSION (Admin only)
router.post('/:id/reject', adminMiddleware, rejectSubmission);

// 📊 DELETE SUBMISSION
router.delete('/:id', deleteSubmission);

export default router;