// src/controllers/submissionController.ts
import { Request, Response, NextFunction } from 'express';
import { Submission } from '../models/Submission';
import { Organization } from '../models/Organization';
import { User } from '../models/User';
import { Op } from 'sequelize';

// 📊 GET ALL SUBMISSIONS (Admin)
export const getAllSubmissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, month, year, organizationId, page = 1, limit = 20 } = req.query;

    const where: any = {};

    if (status) where.status = status;
    if (month) where.month = parseInt(month as string);
    if (year) where.year = parseInt(year as string);
    if (organizationId) where.organizationId = organizationId;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const { count, rows: submissions } = await Submission.findAndCountAll({
      where,
      include: [
        { 
          model: Organization,
          attributes: ['id', 'code', 'name', 'type']
        },
        {
          model: User,
          as: 'submitter',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit as string),
      offset
    });

    res.json({
      success: true,
      data: {
        submissions,
        pagination: {
          total: count,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          pages: Math.ceil(count / parseInt(limit as string))
        }
      }
    });

    console.log('✅ Retrieved all submissions, count:', count);
  } catch (error) {
    console.error('❌ Get all submissions error:', error);
    next(error);
  }
};

// 📊 GET SUBMISSIONS BY ORGANIZATION
export const getSubmissionsByOrg = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId } = req.params;
    const { status, month, year } = req.query;

    const where: any = { organizationId: orgId };

    if (status) where.status = status;
    if (month) where.month = parseInt(month as string);
    if (year) where.year = parseInt(year as string);

    const submissions = await Submission.findAll({
      where,
      include: [
        { 
          model: Organization,
          attributes: ['id', 'code', 'name', 'type']
        },
        {
          model: User,
          as: 'submitter',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['year', 'DESC'], ['month', 'DESC']]
    });

    res.json({
      success: true,
      data: { submissions }
    });

    console.log('✅ Retrieved submissions for org:', orgId, 'count:', submissions.length);
  } catch (error) {
    console.error('❌ Get submissions by org error:', error);
    next(error);
  }
};

// 📊 GET SINGLE SUBMISSION
export const getSubmissionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findByPk(id, {
      include: [
        { 
          model: Organization,
          attributes: ['id', 'code', 'name', 'type', 'contactPerson', 'email', 'phone']
        },
        {
          model: User,
          as: 'submitter',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check access
    if (req.user!.role !== 'fia_admin' && submission.organizationId !== req.user!.organizationId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { submission }
    });

    console.log('✅ Retrieved submission:', id);
  } catch (error) {
    console.error('❌ Get submission error:', error);
    next(error);
  }
};

// 📊 CREATE SUBMISSION
export const createSubmission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { organizationId, month, year, indicators } = req.body;

    // Check if user belongs to this organization
    if (req.user!.organizationId !== organizationId) {
      return res.status(403).json({
        success: false,
        message: 'You can only create submissions for your organization'
      });
    }

    // Check if submission already exists for this month/year
    const existingSubmission = await Submission.findOne({
      where: { organizationId, month, year }
    });

    if (existingSubmission) {
      return res.status(409).json({
        success: false,
        message: `Submission for ${getMonthName(month)} ${year} already exists`
      });
    }

    // Calculate filled indicators and completion rate
    const filledIndicators = indicators.filter((ind: any) => 
      ind.value !== null && ind.value !== undefined && ind.value !== ''
    ).length;
    const totalIndicators = indicators.length;
    const completionRate = Math.round((filledIndicators / totalIndicators) * 100);

    // Create submission
    const submission = await Submission.create({
      organizationId,
      month,
      year,
      status: 'draft',
      indicators,
      filledIndicators,
      totalIndicators,
      completionRate,
      submittedBy: req.user!.id,
      createdBy: req.user!.id
    });

    // Get submission with relations
    const submissionWithRelations = await Submission.findByPk(submission.id, {
      include: [
        { model: Organization },
        { model: User, as: 'submitter', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Submission created successfully',
      data: { submission: submissionWithRelations }
    });

    console.log('✅ Submission created:', submission.id);
  } catch (error) {
    console.error('❌ Create submission error:', error);
    next(error);
  }
};

// 📊 UPDATE SUBMISSION
export const updateSubmission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { indicators } = req.body;

    const submission = await Submission.findByPk(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check access
    if (submission.organizationId !== req.user!.organizationId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Can only update drafts or rejected submissions
    if (submission.status !== 'draft' && submission.status !== 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Can only update draft or rejected submissions'
      });
    }

    // Calculate filled indicators and completion rate
    const filledIndicators = indicators.filter((ind: any) => 
      ind.value !== null && ind.value !== undefined && ind.value !== ''
    ).length;
    const totalIndicators = indicators.length;
    const completionRate = Math.round((filledIndicators / totalIndicators) * 100);

    // Update submission
    await submission.update({
      indicators,
      filledIndicators,
      totalIndicators,
      completionRate,
      status: 'draft', // Reset to draft if it was rejected
      rejectionReason: undefined, // Clear rejection reason
      updatedBy: req.user!.id
    });

    // Get updated submission with relations
    const updatedSubmission = await Submission.findByPk(id, {
      include: [
        { model: Organization },
        { model: User, as: 'submitter', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.json({
      success: true,
      message: 'Submission updated successfully',
      data: { submission: updatedSubmission }
    });

    console.log('✅ Submission updated:', id);
  } catch (error) {
    console.error('❌ Update submission error:', error);
    next(error);
  }
};

// 📊 SUBMIT FOR REVIEW
export const submitForReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findByPk(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check access
    if (submission.organizationId !== req.user!.organizationId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Can only submit drafts or rejected submissions
    if (submission.status !== 'draft' && submission.status !== 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Can only submit draft or rejected submissions'
      });
    }

    // Check completion rate
    if (submission.completionRate < 80) {
      return res.status(400).json({
        success: false,
        message: `Submission must be at least 80% complete. Current: ${submission.completionRate}%`
      });
    }

    // Update status to submitted
    await submission.update({
      status: 'submitted',
      submittedAt: new Date(),
      submittedBy: req.user!.id
    });

    res.json({
      success: true,
      message: 'Submission sent for review',
      data: { submission }
    });

    console.log('✅ Submission submitted for review:', id);
  } catch (error) {
    console.error('❌ Submit for review error:', error);
    next(error);
  }
};

// 🔥 APPROVE SUBMISSION (Admin only)
export const approveSubmission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const submission = await Submission.findByPk(id, {
      include: [{ model: Organization }]
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Can only approve submitted submissions
    if (submission.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Can only approve submitted submissions'
      });
    }

    // Update submission
    await submission.update({
      status: 'approved',
      approvedAt: new Date(),
      approvedBy: req.user!.id,
      comments
    });

    // TODO: Send notification to organization

    res.json({
      success: true,
      message: 'Submission approved successfully',
      data: { submission }
    });

    console.log('✅ Submission approved:', id, 'by:', req.user!.email);
  } catch (error) {
    console.error('❌ Approve submission error:', error);
    next(error);
  }
};

// 🔥 REJECT SUBMISSION (Admin only)
export const rejectSubmission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const submission = await Submission.findByPk(id, {
      include: [{ model: Organization }]
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Can only reject submitted submissions
    if (submission.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Can only reject submitted submissions'
      });
    }

    // Update submission
    await submission.update({
      status: 'rejected',
      rejectionReason: reason,
      comments: reason,
      reviewedAt: new Date(),
      reviewedBy: req.user!.id
    });

    // TODO: Send notification to organization

    res.json({
      success: true,
      message: 'Submission rejected',
      data: { submission }
    });

    console.log('❌ Submission rejected:', id, 'by:', req.user!.email);
  } catch (error) {
    console.error('❌ Reject submission error:', error);
    next(error);
  }
};

// 📊 DELETE SUBMISSION
export const deleteSubmission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findByPk(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check access
    const hasAccess = 
      req.user!.role === 'fia_admin' || 
      submission.organizationId === req.user!.organizationId;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Can only delete drafts
    if (submission.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Can only delete draft submissions'
      });
    }

    await submission.destroy();

    res.json({
      success: true,
      message: 'Submission deleted successfully'
    });

    console.log('✅ Submission deleted:', id);
  } catch (error) {
    console.error('❌ Delete submission error:', error);
    next(error);
  }
};

// 📊 GET SUBMISSION STATISTICS
export const getSubmissionStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { year = new Date().getFullYear(), organizationId } = req.query;

    const where: any = { year: parseInt(year as string) };
    
    if (organizationId) {
      where.organizationId = organizationId;
    } else if (req.user!.role !== 'fia_admin') {
      where.organizationId = req.user!.organizationId;
    }

    const submissions = await Submission.findAll({ where });

    const statistics = {
      total: submissions.length,
      byStatus: {
        draft: submissions.filter(s => s.status === 'draft').length,
        submitted: submissions.filter(s => s.status === 'submitted').length,
        approved: submissions.filter(s => s.status === 'approved').length,
        rejected: submissions.filter(s => s.status === 'rejected').length
      },
      byMonth: Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        count: submissions.filter(s => s.month === i + 1).length,
        avgCompletionRate: Math.round(
          submissions
            .filter(s => s.month === i + 1)
            .reduce((sum, s) => sum + s.completionRate, 0) / 
          (submissions.filter(s => s.month === i + 1).length || 1)
        )
      })),
      avgCompletionRate: Math.round(
        submissions.reduce((sum, s) => sum + s.completionRate, 0) / (submissions.length || 1)
      )
    };

    res.json({
      success: true,
      data: { statistics }
    });

    console.log('✅ Retrieved submission statistics');
  } catch (error) {
    console.error('❌ Get submission statistics error:', error);
    next(error);
  }
};

// Helper function
function getMonthName(month: number): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month - 1];
}