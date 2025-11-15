// backend/src/controllers/adminController.ts
import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

// Helper function
function getMonthName(month: number): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month - 1];
}

// 📊 GET DASHBOARD STATS (For Admin Dashboard)
export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Count organizations
    const totalOrganizations = await prisma.organization.count();
    const activeOrganizations = await prisma.organization.count({ 
      where: { isActive: true } 
    });

    // Count submissions
    const totalSubmissions = await prisma.submission.count();
    const completedSubmissions = await prisma.submission.count({ 
      where: { status: 'APPROVED' } 
    });
    const pendingSubmissions = await prisma.submission.count({ 
      where: { status: 'SUBMITTED' } 
    });
    
    // Calculate overdue - orgs that haven't submitted for current month
    const orgsWithCurrentMonthSubmission = await prisma.submission.count({
      where: {
        year: currentYear,
        month: currentMonth,
        status: { in: ['SUBMITTED', 'APPROVED', 'UNDER_REVIEW'] }
      }
    });
    const overdueSubmissions = activeOrganizations - orgsWithCurrentMonthSubmission;

    // Calculate average compliance rate
    const organizations = await prisma.organization.findMany({
      where: { isActive: true },
      include: {
        submissions: true
      }
    });

    const orgStats = organizations.map((org) => {
      const completed = org.submissions.filter(s => s.status === 'APPROVED').length;
      return org.submissions.length > 0 ? (completed / org.submissions.length) * 100 : 0;
    });

    const averageComplianceRate = orgStats.length > 0 
      ? orgStats.reduce((sum, score) => sum + score, 0) / orgStats.length 
      : 0;

    // Current month stats
    const currentMonthSubmissions = await prisma.submission.count({
      where: { 
        year: currentYear, 
        month: currentMonth 
      }
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

    console.log('✅ Retrieved admin dashboard stats');
  } catch (error) {
    console.error('❌ Get dashboard stats error:', error);
    next(error);
  }
};

// 📊 GET SYSTEM OVERVIEW
export const getSystemOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const organizations = await prisma.organization.findMany({
      where: { isActive: true },
      include: {
        submissions: {
          where: {
            year: parseInt(year as string)
          }
        }
      }
    });

    const overview = organizations.map((org) => {
      const submissions = org.submissions;

      return {
        id: org.id,
        code: org.code,
        name: org.name,
        type: org.type,
        totalSubmissions: submissions.length,
        completedSubmissions: submissions.filter(s => s.status === 'APPROVED').length,
        pendingSubmissions: submissions.filter(s => s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW').length,
        rejectedSubmissions: submissions.filter(s => s.status === 'REJECTED').length,
        complianceScore: submissions.length > 0
          ? Math.round((submissions.filter(s => s.status === 'APPROVED').length / submissions.length) * 100)
          : 0
      };
    });

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

    const organizations = await prisma.organization.findMany({
      include: {
        submissions: {
          where: {
            year: parseInt(year as string)
          }
        }
      }
    });

    const complianceData = organizations.map((org) => {
      const submissions = org.submissions;

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
        totalApproved: submissions.filter(s => s.status === 'APPROVED').length,
        complianceRate: Math.round((submissions.filter(s => s.status === 'APPROVED').length / 12) * 100),
        monthlyCompliance
      };
    });

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

    const submissions = await prisma.submission.findMany({
      where: { 
        year: parseInt(year as string),
        status: 'APPROVED'
      },
      include: { 
        organization: true 
      }
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
      const indicators = submission.indicators as any;
      
      if (indicators['1.1']) totalSTRs += parseFloat(indicators['1.1']) || 0;
      if (indicators['6.1']) totalCases += parseFloat(indicators['6.1']) || 0;
      if (indicators['6.4']) totalAssetsFrozen += parseFloat(indicators['6.4']) || 0;
      if (indicators['6.5']) totalAssetsSeized += parseFloat(indicators['6.5']) || 0;
      if (indicators['6.3']) totalConvictions += parseFloat(indicators['6.3']) || 0;
      if (indicators['1.6']) totalTransactionAmount += parseFloat(indicators['1.6']) || 0;
      if (indicators['3.3']) totalEnforcementActions += parseFloat(indicators['3.3']) || 0;
      if (indicators['3.1']) totalInspections += parseFloat(indicators['3.1']) || 0;
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
      monthlyMetrics: Array.from({ length: 12 }, (_, i) => {
        const monthSubmissions = submissions.filter(s => s.month === i + 1);
        let monthlySTRs = 0;
        
        monthSubmissions.forEach(sub => {
          const indicators = sub.indicators as any;
          if (indicators['1.1']) {
            monthlySTRs += parseFloat(indicators['1.1']) || 0;
          }
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
        data = await prisma.submission.findMany({
          where: year ? { year: parseInt(year as string) } : {},
          include: { organization: true }
        });
        break;

      case 'organizations':
        data = await prisma.organization.findMany();
        break;

      case 'compliance':
        const organizations = await prisma.organization.findMany({
          include: {
            submissions: {
              where: year ? { year: parseInt(year as string) } : {}
            }
          }
        });
        data = organizations.map(org => ({
          organizationCode: org.code,
          organizationName: org.name,
          totalSubmissions: org.submissions.length,
          approvedSubmissions: org.submissions.filter(s => s.status === 'APPROVED').length,
          complianceRate: org.submissions.length > 0
            ? Math.round((org.submissions.filter(s => s.status === 'APPROVED').length / org.submissions.length) * 100)
            : 0
        }));
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type. Use: submissions, organizations, or compliance'
        });
    }

    res.json({
      success: true,
      data,
      format,
      count: Array.isArray(data) ? data.length : 1
    });

    console.log('✅ Exported data:', type);
  } catch (error) {
    console.error('❌ Export data error:', error);
    next(error);
  }
};

// 📊 GET SYSTEM STATISTICS
export const getSystemStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { isActive: true } });
    const totalOrgs = await prisma.organization.count();
    const activeOrgs = await prisma.organization.count({ where: { isActive: true } });
    const totalSubmissions = await prisma.submission.count();
    
    const recentActivity = await prisma.submission.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        organization: {
          select: { code: true, name: true }
        },
        submitter: {
          select: { name: true, email: true }
        }
      }
    });

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, active: activeUsers },
        organizations: { total: totalOrgs, active: activeOrgs },
        submissions: { total: totalSubmissions },
        recentActivity
      }
    });

    console.log('✅ Retrieved system statistics');
  } catch (error) {
    console.error('❌ Get system statistics error:', error);
    next(error);
  }
};