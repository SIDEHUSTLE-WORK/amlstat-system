// src/utils/exportUtils.ts
import { Organization, MonthlySubmission } from '../types';

// 📊 EXPORT TO CSV
export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 📊 EXPORT COMPLIANCE REPORT TO CSV
export const exportComplianceReport = (organizations: Organization[], submissions: MonthlySubmission[]) => {
  const reportData = organizations.map(org => {
    const orgSubs = submissions.filter(s => s.organizationId === org.id);
    const approved = orgSubs.filter(s => s.status === 'approved').length;
    const pending = orgSubs.filter(s => s.status === 'submitted').length;
    const rejected = orgSubs.filter(s => s.status === 'rejected').length;
    const compliance = orgSubs.length > 0 ? Math.round((approved / orgSubs.length) * 100) : 0;

    return {
      'Organization Code': org.code,
      'Organization Name': org.name,
      'Type': org.type,
      'Total Submissions': orgSubs.length,
      'Approved': approved,
      'Pending': pending,
      'Rejected': rejected,
      'Compliance Rate': `${compliance}%`,
      'Last Submission': org.lastSubmissionDate?.toLocaleDateString() || 'N/A'
    };
  });

  exportToCSV(reportData, 'FIA_Compliance_Report');
};

// 📊 EXPORT FINANCIAL REPORT TO CSV
export const exportFinancialReport = (submissions: MonthlySubmission[]) => {
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthName = new Date(2024, i).toLocaleDateString('en-US', { month: 'long' });
    const monthSubs = submissions.filter(s => s.month === month && s.year === 2024);
    
    let strs = 0;
    let cases = 0;
    let assetsFrozen = 0;
    let assetsSeized = 0;
    let convictions = 0;

    monthSubs.forEach(sub => {
      sub.indicators.forEach(ind => {
        const value = parseFloat(ind.value) || 0;
        if (ind.number === '1.1') strs += value;
        if (ind.number === '6.1') cases += value;
        if (ind.number === '6.4') assetsFrozen += value;
        if (ind.number === '6.5') assetsSeized += value;
        if (ind.number === '6.3') convictions += value;
      });
    });

    return {
      'Month': monthName,
      'STRs': strs,
      'Cases': cases,
      'Assets Frozen (UGX)': assetsFrozen,
      'Assets Seized (UGX)': assetsSeized,
      'Convictions': convictions
    };
  });

  exportToCSV(monthlyData, 'FIA_Financial_Report');
};

// 🖨️ PRINT REPORT
export const printReport = () => {
  window.print();
};

// 📊 EXPORT TO EXCEL (Basic - would need library like xlsx for full functionality)
export const exportToExcel = (data: any[], filename: string) => {
  // For now, use CSV format
  // In production, use a library like 'xlsx' or 'exceljs'
  exportToCSV(data, filename);
  console.log('Note: Full Excel export requires xlsx library. Using CSV format.');
};

// 📄 PREPARE PDF EXPORT DATA
export const preparePDFData = (reportType: string, data: any) => {
  // This would integrate with a PDF library like jsPDF or pdfmake
  console.log('PDF Export:', reportType, data);
  alert('PDF export would be implemented with jsPDF library in production');
  
  // Example structure for future implementation:
  return {
    reportType,
    generatedDate: new Date().toISOString(),
    data
  };
};