// src/controllers/organizationController.ts
import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma'; 

// 🏢 GET ALL ORGANIZATIONS
export const getAllOrganizations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, isActive, search } = req.query;

    // Build Prisma where clause
    const where: any = {};

    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { code: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const organizations = await prisma.organization.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        submissions: true
      }
    });

    // Calculate statistics for each organization
    const orgsWithStats = organizations.map((org) => {
      const totalSubmissions = org.submissions.length;
      const completedSubmissions = org.submissions.filter(s => s.status === 'APPROVED').length;
      const pendingSubmissions = org.submissions.filter(s => s.status === 'SUBMITTED').length;
      const overdueSubmissions = org.overdueSubmissions;

      const complianceScore = org.complianceScore;

      const lastSubmission = org.submissions
        .filter(s => s.submittedAt)
        .sort((a, b) => b.submittedAt!.getTime() - a.submittedAt!.getTime())[0];

      return {
        id: org.id,
        code: org.code,
        name: org.name,
        type: org.type,
        sector: org.sector,
        contactEmail: org.contactEmail,
        contactPhone: org.contactPhone,
        isActive: org.isActive,
        createdAt: org.createdAt,
        totalSubmissions,
        completedSubmissions,
        pendingSubmissions,
        overdueSubmissions,
        complianceScore,
        lastSubmissionDate: lastSubmission?.submittedAt || null
      };
    });

    res.json({
      success: true,
      data: { organizations: orgsWithStats }
    });

    console.log('✅ Retrieved all organizations, count:', organizations.length);
  } catch (error) {
    console.error('❌ Get all organizations error:', error);
    next(error);
  }
};

// 🏢 GET SINGLE ORGANIZATION
export const getOrganizationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        submissions: true,
        users: true
      }
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check access
    if (req.user!.role !== 'FIA_ADMIN' && req.user!.organizationId !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get statistics
    const totalSubmissions = organization.submissions.length;
    const completedSubmissions = organization.submissions.filter(s => s.status === 'APPROVED').length;
    const pendingSubmissions = organization.submissions.filter(s => s.status === 'SUBMITTED').length;
    const rejectedSubmissions = organization.submissions.filter(s => s.status === 'REJECTED').length;

    const complianceScore = totalSubmissions > 0 
      ? Math.round((completedSubmissions / totalSubmissions) * 100)
      : 0;

    const orgWithStats = {
      ...organization,
      totalSubmissions,
      completedSubmissions,
      pendingSubmissions,
      rejectedSubmissions,
      complianceScore
    };

    res.json({
      success: true,
      data: { organization: orgWithStats }
    });

    console.log('✅ Retrieved organization:', id);
  } catch (error) {
    console.error('❌ Get organization error:', error);
    next(error);
  }
};

// 🏢 CREATE ORGANIZATION
export const createOrganization = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      code, 
      name, 
      type, 
      sector,
      registrationNo,
      contactEmail, 
      contactPhone, 
      address 
    } = req.body;

    // Check if organization code already exists
    const existingOrg = await prisma.organization.findUnique({ 
      where: { code } 
    });

    if (existingOrg) {
      return res.status(409).json({
        success: false,
        message: 'Organization with this code already exists'
      });
    }

    const organization = await prisma.organization.create({
      data: {
        code,
        name,
        type,
        sector,
        registrationNo,
        contactEmail,
        contactPhone,
        address,
        isActive: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Organization created successfully',
      data: { organization }
    });

    console.log('✅ Organization created:', organization.code);
  } catch (error) {
    console.error('❌ Create organization error:', error);
    next(error);
  }
};

// 🏢 UPDATE ORGANIZATION
export const updateOrganization = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      type, 
      sector,
      registrationNo,
      contactEmail, 
      contactPhone,
      address 
    } = req.body;

    const organization = await prisma.organization.findUnique({
      where: { id }
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    const updatedOrg = await prisma.organization.update({
      where: { id },
      data: {
        name,
        type,
        sector,
        registrationNo,
        contactEmail,
        contactPhone,
        address
      }
    });

    res.json({
      success: true,
      message: 'Organization updated successfully',
      data: { organization: updatedOrg }
    });

    console.log('✅ Organization updated:', id);
  } catch (error) {
    console.error('❌ Update organization error:', error);
    next(error);
  }
};

// 🏢 TOGGLE ORGANIZATION STATUS
export const toggleOrganizationStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const organization = await prisma.organization.findUnique({
      where: { id }
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    const updatedOrg = await prisma.organization.update({
      where: { id },
      data: { isActive }
    });

    res.json({
      success: true,
      message: `Organization ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { organization: updatedOrg }
    });

    console.log(`✅ Organization ${isActive ? 'activated' : 'deactivated'}:`, id);
  } catch (error) {
    console.error('❌ Toggle organization status error:', error);
    next(error);
  }
};

// 🏢 DELETE ORGANIZATION
export const deleteOrganization = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        submissions: true,
        users: true
      }
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if organization has submissions
    if (organization.submissions.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete organization with existing submissions'
      });
    }

    // Check if organization has users
    if (organization.users.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete organization with existing users'
      });
    }

    await prisma.organization.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Organization deleted successfully'
    });

    console.log('✅ Organization deleted:', id);
  } catch (error) {
    console.error('❌ Delete organization error:', error);
    next(error);
  }
};

// 🏢 GET ORGANIZATION STATISTICS
export const getOrganizationStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { year = new Date().getFullYear() } = req.query;

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        submissions: {
          where: {
            year: parseInt(year as string)
          }
        }
      }
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check access
    if (req.user!.role !== 'FIA_ADMIN' && req.user!.organizationId !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const submissions = organization.submissions;

    // Calculate monthly statistics
    const monthlyStats = Array.from({ length: 12 }, (_, i) => {
      const monthSubmissions = submissions.filter(s => s.month === i + 1);
      const submission = monthSubmissions[0];

      return {
        month: i + 1,
        hasSubmission: monthSubmissions.length > 0,
        status: submission?.status || null,
        completionRate: submission?.completionRate || 0,
        submittedAt: submission?.submittedAt || null
      };
    });

    // Calculate aggregate metrics from submissions
    const totalSTRs = submissions.reduce((sum, s) => {
      const indicators = s.indicators as any;
      const strValue = indicators['1.1'];
      return sum + (strValue ? parseFloat(strValue) || 0 : 0);
    }, 0);

    const statistics = {
      organization: {
        id: organization.id,
        code: organization.code,
        name: organization.name
      },
      year: parseInt(year as string),
      totalSubmissions: submissions.length,
      completedSubmissions: submissions.filter(s => s.status === 'APPROVED').length,
      pendingSubmissions: submissions.filter(s => s.status === 'SUBMITTED').length,
      rejectedSubmissions: submissions.filter(s => s.status === 'REJECTED').length,
      draftSubmissions: submissions.filter(s => s.status === 'DRAFT').length,
      avgCompletionRate: Math.round(
        submissions.reduce((sum, s) => sum + s.completionRate, 0) / (submissions.length || 1)
      ),
      monthlyStats,
      metrics: {
        totalSTRs,
        // Add more metrics as needed
      }
    };

    res.json({
      success: true,
      data: { statistics }
    });

    console.log('✅ Retrieved statistics for organization:', id);
  } catch (error) {
    console.error('❌ Get organization statistics error:', error);
    next(error);
  }
};