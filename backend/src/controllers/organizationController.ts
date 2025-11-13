// src/controllers/organizationController.ts
import { Request, Response, NextFunction } from 'express';
import { Organization } from '../models/Organization';
import { Submission } from '../models/Submission';
import { User } from '../models/User';
import { Op } from 'sequelize';

// 🏢 GET ALL ORGANIZATIONS
export const getAllOrganizations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, isActive, search } = req.query;

    const where: any = {};

    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const organizations = await Organization.findAll({
      where,
      order: [['name', 'ASC']]
    });

    // Calculate statistics for each organization
    const orgsWithStats = await Promise.all(
      organizations.map(async (org) => {
        const submissions = await Submission.findAll({
          where: { organizationId: org.id }
        });

        const totalSubmissions = submissions.length;
        const completedSubmissions = submissions.filter(s => s.status === 'approved').length;
        const pendingSubmissions = submissions.filter(s => s.status === 'submitted').length;
        const overdueSubmissions = 0; // TODO: Calculate based on deadlines

        const complianceScore = totalSubmissions > 0 
          ? Math.round((completedSubmissions / totalSubmissions) * 100)
          : 0;

        const lastSubmission = submissions
          .filter(s => s.submittedAt)
          .sort((a, b) => b.submittedAt!.getTime() - a.submittedAt!.getTime())[0];

        return {
          ...org.toJSON(),
          totalSubmissions,
          completedSubmissions,
          pendingSubmissions,
          overdueSubmissions,
          complianceScore,
          lastSubmissionDate: lastSubmission?.submittedAt || null
        };
      })
    );

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

    const organization = await Organization.findByPk(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check access
    if (req.user!.role !== 'fia_admin' && req.user!.organizationId !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get statistics
    const submissions = await Submission.findAll({
      where: { organizationId: id }
    });

    const totalSubmissions = submissions.length;
    const completedSubmissions = submissions.filter(s => s.status === 'approved').length;
    const pendingSubmissions = submissions.filter(s => s.status === 'submitted').length;
    const rejectedSubmissions = submissions.filter(s => s.status === 'rejected').length;

    const complianceScore = totalSubmissions > 0 
      ? Math.round((completedSubmissions / totalSubmissions) * 100)
      : 0;

    const orgWithStats = {
      ...organization.toJSON(),
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
    const { code, name, type, email, phone, contactPerson } = req.body;

    // Check if organization code already exists
    const existingOrg = await Organization.findOne({ where: { code } });

    if (existingOrg) {
      return res.status(409).json({
        success: false,
        message: 'Organization with this code already exists'
      });
    }

    const organization = await Organization.create({
      code,
      name,
      type,
      email,
      phone,
      contactPerson,
      isActive: true,
      createdBy: req.user!.id
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
    const { name, type, email, phone, contactPerson } = req.body;

    const organization = await Organization.findByPk(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    await organization.update({
      name,
      type,
      email,
      phone,
      contactPerson,
      updatedBy: req.user!.id
    });

    res.json({
      success: true,
      message: 'Organization updated successfully',
      data: { organization }
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

    const organization = await Organization.findByPk(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    await organization.update({ 
      isActive,
      updatedBy: req.user!.id
    });

    res.json({
      success: true,
      message: `Organization ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { organization }
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

    const organization = await Organization.findByPk(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if organization has submissions
    const submissionCount = await Submission.count({
      where: { organizationId: id }
    });

    if (submissionCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete organization with existing submissions'
      });
    }

    // Check if organization has users
    const userCount = await User.count({
      where: { organizationId: id }
    });

    if (userCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete organization with existing users'
      });
    }

    await organization.destroy();

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

    const organization = await Organization.findByPk(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check access
    if (req.user!.role !== 'fia_admin' && req.user!.organizationId !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get submissions for the year
    const submissions = await Submission.findAll({
      where: { 
        organizationId: id,
        year: parseInt(year as string)
      }
    });

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
      const strIndicator = s.indicators.find((i: any) => i.number === '1.1');
      return sum + (strIndicator ? parseFloat(strIndicator.value) || 0 : 0);
    }, 0);

    const statistics = {
      organization: {
        id: organization.id,
        code: organization.code,
        name: organization.name
      },
      year: parseInt(year as string),
      totalSubmissions: submissions.length,
      completedSubmissions: submissions.filter(s => s.status === 'approved').length,
      pendingSubmissions: submissions.filter(s => s.status === 'submitted').length,
      rejectedSubmissions: submissions.filter(s => s.status === 'rejected').length,
      draftSubmissions: submissions.filter(s => s.status === 'draft').length,
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