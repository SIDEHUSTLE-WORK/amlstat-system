// src/controllers/submissionController.ts
import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma'; 

// 📊 GET ALL SUBMISSIONS (Admin)
export const getAllSubmissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, month, year, organizationId, page = 1, limit = 20 } = req.query;

    // Build Prisma where clause
    const where: any = {};

    if (status) where.status = status;
    if (month) where.month = parseInt(month as string);
    if (year) where.year = parseInt(year as string);
    if (organizationId) where.organizationId = organizationId;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Get count and submissions
    const [count, submissions] = await Promise.all([
      prisma.submission.count({ where }),
      prisma.submission.findMany({
        where,
        include: {
          organization: {
            select: {
              id: true,
              code: true,
              name: true,
              type: true
            }
          },
          submitter: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
        skip: offset
      })
    ]);

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

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        organization: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true
          }
        },
        submitter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ]
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

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
            contactEmail: true,
            contactPhone: true
          }
        },
        submitter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check access
    if (req.user!.role !== 'FIA_ADMIN' && submission.organizationId !== req.user!.organizationId) {
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
    const existingSubmission = await prisma.submission.findFirst({
      where: { 
        organizationId, 
        month, 
        year 
      }
    });

    if (existingSubmission) {
      return res.status(409).json({
        success: false,
        message: `Submission for ${getMonthName(month)} ${year} already exists`
      });
    }

    // Calculate filled indicators and completion rate
    const indicatorObj = indicators as Record<string, any>;
    const indicatorValues = Object.values(indicatorObj);
    const filledIndicators = indicatorValues.filter((val: any) => 
      val !== null && val !== undefined && val !== ''
    ).length;
    const totalIndicators = indicatorValues.length;
    const completionRate = Math.round((filledIndicators / totalIndicators) * 100);

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        organizationId,
        month,
        year,
        status: 'DRAFT',
        indicators: indicators, // JSON field
        filledIndicators,
        totalIndicators,
        completionRate,
        submittedBy: req.user!.id
      },
      include: {
        organization: true,
        submitter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Submission created successfully',
      data: { submission }
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

    const submission = await prisma.submission.findUnique({
      where: { id }
    });

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
    if (submission.status !== 'DRAFT' && submission.status !== 'REJECTED') {
      return res.status(400).json({
        success: false,
        message: 'Can only update draft or rejected submissions'
      });
    }

    // Calculate filled indicators and completion rate
    const indicatorObj = indicators as Record<string, any>;
    const indicatorValues = Object.values(indicatorObj);
    const filledIndicators = indicatorValues.filter((val: any) => 
      val !== null && val !== undefined && val !== ''
    ).length;
    const totalIndicators = indicatorValues.length;
    const completionRate = Math.round((filledIndicators / totalIndicators) * 100);

    // Update submission
    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: {
        indicators: indicators,
        filledIndicators,
        totalIndicators,
        completionRate,
        status: 'DRAFT', // Reset to draft if it was rejected
        reviewNotes: null // Clear rejection reason
      },
      include: {
        organization: true,
        submitter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
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

    const submission = await prisma.submission.findUnique({
      where: { id }
    });

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
    if (submission.status !== 'DRAFT' && submission.status !== 'REJECTED') {
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
    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        submittedBy: req.user!.id
      }
    });

    res.json({
      success: true,
      message: 'Submission sent for review',
      data: { submission: updatedSubmission }
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

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { organization: true }
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Can only approve submitted submissions
    if (submission.status !== 'SUBMITTED') {
      return res.status(400).json({
        success: false,
        message: 'Can only approve submitted submissions'
      });
    }

    // Update submission
    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date(),
        reviewedBy: req.user!.id,
        reviewNotes: comments
      }
    });

    // TODO: Send notification to organization

    res.json({
      success: true,
      message: 'Submission approved successfully',
      data: { submission: updatedSubmission }
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

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { organization: true }
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Can only reject submitted submissions
    if (submission.status !== 'SUBMITTED') {
      return res.status(400).json({
        success: false,
        message: 'Can only reject submitted submissions'
      });
    }

    // Update submission
    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewNotes: reason,
        reviewedAt: new Date(),
        reviewedBy: req.user!.id
      }
    });

    // TODO: Send notification to organization

    res.json({
      success: true,
      message: 'Submission rejected',
      data: { submission: updatedSubmission }
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

    const submission = await prisma.submission.findUnique({
      where: { id }
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check access
    const hasAccess = 
      req.user!.role === 'FIA_ADMIN' || 
      submission.organizationId === req.user!.organizationId;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Can only delete drafts
    if (submission.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        message: 'Can only delete draft submissions'
      });
    }

    await prisma.submission.delete({
      where: { id }
    });

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
    } else if (req.user!.role !== 'FIA_ADMIN') {
      where.organizationId = req.user!.organizationId;
    }

    const submissions = await prisma.submission.findMany({ where });

    const statistics = {
      total: submissions.length,
      byStatus: {
        draft: submissions.filter(s => s.status === 'DRAFT').length,
        submitted: submissions.filter(s => s.status === 'SUBMITTED').length,
        approved: submissions.filter(s => s.status === 'APPROVED').length,
        rejected: submissions.filter(s => s.status === 'REJECTED').length
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