// src/controllers/adminController.ts
import { Request, Response, NextFunction } from 'express';
import { Organization } from '../models/Organization';
import { Submission } from '../models/Submission';
import { User } from '../models/User';
import { Op } from 'sequelize';

// 📊 GET DASHBOARD STATS
export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Count organizations
    const totalOrganizations = await Organization.count();
    const activeOrganizations = await Organization.count({ where: { isActive: true } });

    // Count submissions
    const totalSubmissions = await Submission.count();
    const completedSubmissions = await Submission.count({ where: { status: 'approved' } });
    const pendingSubmissions = await Submission.count({ where: { status: 'submitted' } });
    const overdueSubmissions = 0; // TODO: Calculate based on deadlines

    // Calculate average compliance rate
    const organizations = await Organization.findAll();
    const orgStats = await Promise.all(
      organizations.map(async (org) => {
        const submissions = await Submission.findAll({
          where: { organizationId: org.id }
        });
        const completed = submissions.filter(s => s.status === 'approved').length;
        return submissions.length > 0 ? (completed / submissions.length) * 100 : 0;
      })
    );
    const averageComplianceRate = orgStats.reduce((sum, score) => sum + score, 0) / orgStats.length;

    // Current month stats
    const currentMonthSubmissions = await Submission.count({
      where: { year: currentYear, month: currentMonth }
    });
    const currentMonthPending = activeOrganizations - currentMonthSubmissions;

    const stats = {
      totalOrganizations,
      activeOrganizations,
      totalSubmissions,
      completedSubmissions,
      pendingSubmissions,
      overdueSubmissions,
      averageComplianceRate: Math.round(averageComplianceRate * 10) / 10,
      currentMonth: `${getMonthName(currentMonth)} ${currentYear}`,
      currentMonthSubmissions,
      currentMonthPending
    };

    res.json({
      success: true,
      data: { stats }
    });

    console.log('✅ Retrieved dashboard stats');
  } catch (error) {
    console.error('❌ Get dashboard stats error:', error);
    next(error);
  }
};

// 📊 GET SYSTEM OVERVIEW
export const getSystemOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const organizations = await Organization.findAll({
      where: { isActive: true }
    });

    const overview = await Promise.all(
      organizations.map(async (org) => {
        const submissions = await Submission.findAll({
          where: { 
            organizationId: org.id,
            year: parseInt(year as string)
          }
        });

        return {
          id: org.id,
          code: org.code,
          name: org.name,
          type: org.type,
          totalSubmissions: submissions.length,
          completedSubmissions: submissions.filter(s => s.status === 'approved').length,
          pendingSubmissions: submissions.filter(s => s.status === 'submitted').length,
          rejectedSubmissions: submissions.filter(s => s.status === 'rejected').length,
          complianceScore: submissions.length > 0
            ? Math.round((submissions.filter(s => s.status === 'approved').length / submissions.length) * 100)
            : 0
        };
      })
    );

    res.json({
      success: true,
      data: { overview }
    });

    console.log('✅ Retrieved system overview');
  } catch (error) {
    console.error('❌ Get system overview error:', error);
    next(error);
  }
};

// 📊 GET COMPLIANCE REPORT
export const getComplianceReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const organizations = await Organization.findAll();

    const complianceData = await Promise.all(
      organizations.map(async (org) => {
        const submissions = await Submission.findAll({
          where: { 
            organizationId: org.id,
            year: parseInt(year as string)
          }
        });

        const monthlyCompliance = Array.from({ length: 12 }, (_, i) => {
          const monthSubmission = submissions.find(s => s.month === i + 1);
          return {
            month: i + 1,
            submitted: !!monthSubmission,
            status: monthSubmission?.status || null,
            completionRate: monthSubmission?.completionRate || 0
          };
        });

        return {
          organizationId: org.id,
          organizationCode: org.code,
          organizationName: org.name,
          totalExpected: 12,
          totalSubmitted: submissions.length,
          totalApproved: submissions.filter(s => s.status === 'approved').length,
          complianceRate: Math.round((submissions.filter(s => s.status === 'approved').length / 12) * 100),
          monthlyCompliance
        };
      })
    );

    res.json({
      success: true,
      data: { 
        year: parseInt(year as string),
        complianceData 
      }
    });

    console.log('✅ Retrieved compliance report');
  } catch (error) {
    console.error('❌ Get compliance report error:', error);
    next(error);
  }
};

// 📊 GET FINANCIAL METRICS
export const getFinancialMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const submissions = await Submission.findAll({
      where: { 
        year: parseInt(year as string),
        status: 'approved'
      },
      include: [{ model: Organization }]
    });

    // Calculate aggregate metrics
    let totalSTRs = 0;
    let totalCases = 0;
    let totalAssetsFrozen = 0;
    let totalAssetsSeized = 0;
    let totalConvictions = 0;
    let totalTransactionAmount = 0;
    let totalEnforcementActions = 0;
    let totalInspections = 0;

    submissions.forEach(submission => {
      submission.indicators.forEach((indicator: any) => {
        const value = parseFloat(indicator.value) || 0;
        
        if (indicator.number === '1.1') totalSTRs += value;
        if (indicator.number === '6.1') totalCases += value;
        if (indicator.number === '6.4') totalAssetsFrozen += value;
        if (indicator.number === '6.5') totalAssetsSeized += value;
        if (indicator.number === '6.3') totalConvictions += value;
        if (indicator.number === '1.6') totalTransactionAmount += value;
        if (indicator.number === '3.3') totalEnforcementActions += value;
        if (indicator.number === '3.1') totalInspections += value;
      });
    });

    const metrics = {
      year: parseInt(year as string),
      totalSTRs,
      totalCases,
      totalAssetsFrozen,
      totalAssetsSeized,
      totalConvictions,
      totalTransactionAmount,
      totalEnforcementActions,
      totalInspections,
      // Monthly breakdown
      monthlyMetrics: Array.from({ length: 12 }, (_, i) => {
        const monthSubmissions = submissions.filter(s => s.month === i + 1);
        let monthlySTRs = 0;
        
        monthSubmissions.forEach(sub => {
          const strIndicator = sub.indicators.find((ind: any) => ind.number === '1.1');
          if (strIndicator) monthlySTRs += parseFloat(strIndicator.value) || 0;
        });

        return {
          month: i + 1,
          strs: monthlySTRs
        };
      })
    };

    res.json({
      success: true,
      data: { metrics }
    });

    console.log('✅ Retrieved financial metrics');
  } catch (error) {
    console.error('❌ Get financial metrics error:', error);
    next(error);
  }
};

// 📊 EXPORT DATA
export const exportData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.params;
    const { year, format = 'json' } = req.query;

    let data: any;

    switch (type) {
      case 'submissions':
        data = await Submission.findAll({
          where: year ? { year: parseInt(year as string) } : {},
          include: [{ model: Organization }]
        });
        break;

      case 'organizations':
        data = await Organization.findAll();
        break;

      case 'compliance':
        // Implement compliance export
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }

    // For now, return JSON. In production, implement CSV/Excel export
    res.json({
      success: true,
      data,
      format
    });

    console.log('✅ Exported data:', type);
  } catch (error) {
    console.error('❌ Export data error:', error);
    next(error);
  }
};

// Helper function
function getMonthName(month: number): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month - 1];
}