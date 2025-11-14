// src/pages/admin/Reports.tsx
import { useState } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  Download,
  Calendar,
  Filter,
  DollarSign,
  CheckCircle,
  Building2,
  Activity,
  PieChart,
  LineChart as LineChartIcon
} from 'lucide-react';
import { useAppStore } from '../../store';
import { 
  BarChart, Bar, LineChart, Line, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { exportComplianceReport, exportFinancialReport, exportToCSV, printReport } from '../../utils/exportUtils';
import ReportFilters, { FilterState } from './components/ReportFilters';
import ScheduleReport, { ReportSchedule } from './components/ScheduleReport';

type ReportType = 'compliance' | 'financial' | 'trends' | 'comparative' | 'overview';
type TimeRange = '3months' | '6months' | '1year' | 'custom';

export default function Reports() {
  // ============ STATE MANAGEMENT ============
  const { organizations, getAllSubmissions } = useAppStore();
  const [activeReport, setActiveReport] = useState<ReportType>('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('6months');
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    startDate: '',
    endDate: '',
    organizationIds: [],
    status: [],
    type: []
  });

  const allSubmissions = getAllSubmissions();

  // ============ DATA CALCULATIONS ============
  
  // Calculate system-wide metrics
  const calculateSystemMetrics = () => {
    let totalSTRs = 0;
    let totalCases = 0;
    let totalAssetsFrozen = 0;
    let totalAssetsSeized = 0;
    let totalConvictions = 0;
    let totalEnforcementActions = 0;

    allSubmissions.forEach(submission => {
      submission.indicators.forEach(indicator => {
        const value = typeof indicator.value === 'number' ? indicator.value : parseFloat(indicator.value) || 0;
        
        if (indicator.number === '1.1') totalSTRs += value;
        if (indicator.number === '6.1') totalCases += value;
        if (indicator.number === '6.4') totalAssetsFrozen += value;
        if (indicator.number === '6.5') totalAssetsSeized += value;
        if (indicator.number === '6.3') totalConvictions += value;
        if (indicator.number === '3.3') totalEnforcementActions += value;
      });
    });

    return {
      totalSTRs,
      totalCases,
      totalAssetsFrozen,
      totalAssetsSeized,
      totalConvictions,
      totalEnforcementActions
    };
  };

  const systemMetrics = calculateSystemMetrics();

  // Monthly trend data (last 12 months)
  const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthSubmissions = allSubmissions.filter(s => s.month === month && s.year === 2024);
    
    let strs = 0;
    let cases = 0;
    
    monthSubmissions.forEach(sub => {
      const strInd = sub.indicators.find(ind => ind.number === '1.1');
      const caseInd = sub.indicators.find(ind => ind.number === '6.1');
      
      if (strInd) strs += parseFloat(String(strInd.value)) || 0;
      if (caseInd) cases += parseFloat(String(caseInd.value)) || 0;
    });

    return {
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
      strs,
      cases,
      submissions: monthSubmissions.length,
      compliance: monthSubmissions.length > 0 
        ? Math.round((monthSubmissions.filter(s => s.status === 'approved').length / monthSubmissions.length) * 100)
        : 0
    };
  });

  // Compliance by organization type
  const complianceByType = organizations.reduce((acc, org) => {
    const orgSubmissions = allSubmissions.filter(s => s.organizationId === org.id);
    const approved = orgSubmissions.filter(s => s.status === 'approved').length;
    const total = orgSubmissions.length;
    const compliance = total > 0 ? Math.round((approved / total) * 100) : 0;

    if (!acc[org.type]) {
      acc[org.type] = { total: 0, compliance: 0, count: 0 };
    }

    acc[org.type].total += total;
    acc[org.type].compliance += compliance;
    acc[org.type].count += 1;

    return acc;
  }, {} as Record<string, { total: number; compliance: number; count: number }>);

  const typeComplianceData = Object.entries(complianceByType).map(([type, data]) => ({
    type: type.replace('_', ' ').toUpperCase(),
    compliance: Math.round(data.compliance / data.count),
    submissions: data.total
  }));

  // Status distribution
  const statusData = [
    { name: 'Approved', value: allSubmissions.filter(s => s.status === 'approved').length, color: '#10b981' },
    { name: 'Submitted', value: allSubmissions.filter(s => s.status === 'submitted').length, color: '#3b82f6' },
    { name: 'Draft', value: allSubmissions.filter(s => s.status === 'draft').length, color: '#f59e0b' },
    { name: 'Rejected', value: allSubmissions.filter(s => s.status === 'rejected').length, color: '#ef4444' },
  ].filter(item => item.value > 0);

  // Top performers
  const topPerformers = organizations
    .map(org => {
      const orgSubs = allSubmissions.filter(s => s.organizationId === org.id);
      const approved = orgSubs.filter(s => s.status === 'approved').length;
      return {
        name: org.code,
        fullName: org.name,
        compliance: orgSubs.length > 0 ? Math.round((approved / orgSubs.length) * 100) : 0,
        submissions: orgSubs.length
      };
    })
    .sort((a, b) => b.compliance - a.compliance)
    .slice(0, 5);

  // ============ UTILITY FUNCTIONS ============
  
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) return `UGX ${(amount / 1000000000).toFixed(2)}B`;
    if (amount >= 1000000) return `UGX ${(amount / 1000000).toFixed(2)}M`;
    return `UGX ${amount.toLocaleString()}`;
  };

  // ============ EVENT HANDLERS ============
  
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    console.log('Filters updated:', newFilters);
  };

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    console.log(`Exporting ${activeReport} as ${format}`);
    
    switch (activeReport) {
      case 'compliance':
        if (format === 'csv') {
          exportComplianceReport(organizations, allSubmissions);
        } else if (format === 'pdf') {
          alert('PDF export for compliance report would be implemented here');
        }
        break;
        
      case 'financial':
        if (format === 'csv') {
          exportFinancialReport(allSubmissions);
        }
        break;
        
      case 'overview':
        const overviewData = organizations.map(org => ({
          'Code': org.code,
          'Name': org.name,
          'Type': org.type,
          'Submissions': allSubmissions.filter(s => s.organizationId === org.id).length,
          'Compliance': org.complianceScore + '%'
        }));
        if (format === 'csv') {
          exportToCSV(overviewData, 'FIA_System_Overview');
        }
        break;
        
      default:
        alert(`Export for ${activeReport} not yet implemented`);
    }
  };

  const handlePrint = () => {
    printReport();
  };

  const handleScheduleReport = (schedule: ReportSchedule) => {
    console.log('Report scheduled:', schedule);
    alert(`Report scheduled! You'll receive ${activeReport} reports ${schedule.frequency} at ${schedule.time} in ${schedule.format} format.`);
    // TODO: Implement actual scheduling with backend
    setShowScheduleModal(false);
  };

  const exportReport = (format: 'csv' | 'pdf' | 'excel') => {
    console.log(`Exporting ${activeReport} report as ${format}`);
    alert(`Exporting ${activeReport} report as ${format.toUpperCase()}...`);
  };

  // ============ RENDER ============
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-fia-navy mb-2">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive insights and data visualization</p>
        </div>

        {/* Report Filters Component */}
        <ReportFilters
          onFilterChange={handleFilterChange}
          onExport={handleExport}
          onPrint={handlePrint}
        />

        {/* Report Type Selector */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Select Report Type</h2>
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fia-teal"
              >
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last 12 Months</option>
                <option value="custom">Custom Range</option>
              </select>

              <button
                onClick={() => exportReport('pdf')}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </button>

              <button
                onClick={() => exportReport('excel')}
                className="btn-primary flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Excel</span>
              </button>

              <button
                onClick={() => setShowScheduleModal(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors"
              >
                <Calendar className="w-5 h-5" />
                <span>Schedule</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <button
              onClick={() => setActiveReport('overview')}
              className={`p-4 rounded-xl border-2 transition-all ${
                activeReport === 'overview'
                  ? 'border-fia-navy bg-fia-navy text-white shadow-lg'
                  : 'border-gray-200 hover:border-fia-navy hover:shadow-md'
              }`}
            >
              <Activity className="w-8 h-8 mx-auto mb-2" />
              <p className="font-semibold text-sm">System Overview</p>
            </button>

            <button
              onClick={() => setActiveReport('compliance')}
              className={`p-4 rounded-xl border-2 transition-all ${
                activeReport === 'compliance'
                  ? 'border-green-500 bg-green-500 text-white shadow-lg'
                  : 'border-gray-200 hover:border-green-500 hover:shadow-md'
              }`}
            >
              <CheckCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="font-semibold text-sm">Compliance Report</p>
            </button>

            <button
              onClick={() => setActiveReport('financial')}
              className={`p-4 rounded-xl border-2 transition-all ${
                activeReport === 'financial'
                  ? 'border-blue-500 bg-blue-500 text-white shadow-lg'
                  : 'border-gray-200 hover:border-blue-500 hover:shadow-md'
              }`}
            >
              <DollarSign className="w-8 h-8 mx-auto mb-2" />
              <p className="font-semibold text-sm">Financial Metrics</p>
            </button>

            <button
              onClick={() => setActiveReport('trends')}
              className={`p-4 rounded-xl border-2 transition-all ${
                activeReport === 'trends'
                  ? 'border-purple-500 bg-purple-500 text-white shadow-lg'
                  : 'border-gray-200 hover:border-purple-500 hover:shadow-md'
              }`}
            >
              <TrendingUp className="w-8 h-8 mx-auto mb-2" />
              <p className="font-semibold text-sm">Trend Analysis</p>
            </button>

            <button
              onClick={() => setActiveReport('comparative')}
              className={`p-4 rounded-xl border-2 transition-all ${
                activeReport === 'comparative'
                  ? 'border-orange-500 bg-orange-500 text-white shadow-lg'
                  : 'border-gray-200 hover:border-orange-500 hover:shadow-md'
              }`}
            >
              <Building2 className="w-8 h-8 mx-auto mb-2" />
              <p className="font-semibold text-sm">Org Comparison</p>
            </button>
          </div>
        </div>

        {/* OVERVIEW REPORT */}
        {activeReport === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <Building2 className="w-8 h-8 text-fia-navy" />
                  <span className="text-3xl font-bold text-fia-navy">{organizations.length}</span>
                </div>
                <h3 className="text-gray-600 font-medium">Total Organizations</h3>
                <p className="text-sm text-gray-500 mt-1">Active reporting entities</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <FileText className="w-8 h-8 text-blue-500" />
                  <span className="text-3xl font-bold text-blue-500">{allSubmissions.length}</span>
                </div>
                <h3 className="text-gray-600 font-medium">Total Submissions</h3>
                <p className="text-sm text-gray-500 mt-1">All time submissions</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 text-green-500" />
                  <span className="text-3xl font-bold text-green-500">
                    {Math.round((allSubmissions.filter(s => s.status === 'approved').length / allSubmissions.length) * 100)}%
                  </span>
                </div>
                <h3 className="text-gray-600 font-medium">Approval Rate</h3>
                <p className="text-sm text-gray-500 mt-1">System-wide average</p>
              </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Submissions Trend */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Submission Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyTrend}>
                    <defs>
                      <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="submissions" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSubmissions)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Status Distribution */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Submission Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Compliance by Type */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Compliance by Organization Type</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={typeComplianceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="compliance" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Top Performers */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Top 5 Performers</h3>
                <div className="space-y-3">
                  {topPerformers.map((org, index) => (
                    <div key={org.name} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-600' :
                        'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{org.fullName}</p>
                        <p className="text-sm text-gray-500">{org.submissions} submissions</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">{org.compliance}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COMPLIANCE REPORT */}
        {activeReport === 'compliance' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Compliance Overview</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-600 font-semibold">Fully Compliant</p>
                  <p className="text-3xl font-bold text-green-700">
                    {organizations.filter(org => {
                      const subs = allSubmissions.filter(s => s.organizationId === org.id);
                      return subs.filter(s => s.status === 'approved').length === subs.length;
                    }).length}
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-600 font-semibold">Mostly Compliant</p>
                  <p className="text-3xl font-bold text-blue-700">
                    {organizations.filter(org => {
                      const subs = allSubmissions.filter(s => s.organizationId === org.id);
                      const rate = subs.filter(s => s.status === 'approved').length / subs.length;
                      return rate >= 0.7 && rate < 1;
                    }).length}
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-600 font-semibold">Needs Improvement</p>
                  <p className="text-3xl font-bold text-yellow-700">
                    {organizations.filter(org => {
                      const subs = allSubmissions.filter(s => s.organizationId === org.id);
                      const rate = subs.filter(s => s.status === 'approved').length / subs.length;
                      return rate >= 0.4 && rate < 0.7;
                    }).length}
                  </p>
                </div>

                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-600 font-semibold">Non-Compliant</p>
                  <p className="text-3xl font-bold text-red-700">
                    {organizations.filter(org => {
                      const subs = allSubmissions.filter(s => s.organizationId === org.id);
                      const rate = subs.filter(s => s.status === 'approved').length / subs.length;
                      return rate < 0.4;
                    }).length}
                  </p>
                </div>
              </div>

              {/* Monthly Compliance Heatmap */}
              <h4 className="text-lg font-bold text-gray-900 mb-4">Monthly Compliance Heatmap</h4>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="compliance" stroke="#10b981" strokeWidth={3} name="Compliance %" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Organization Compliance Table */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Organization Compliance Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Organization</th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">Total</th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">Approved</th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">Pending</th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">Rejected</th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">Compliance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {organizations.map(org => {
                      const orgSubs = allSubmissions.filter(s => s.organizationId === org.id);
                      const approved = orgSubs.filter(s => s.status === 'approved').length;
                      const pending = orgSubs.filter(s => s.status === 'submitted').length;
                      const rejected = orgSubs.filter(s => s.status === 'rejected').length;
                      const compliance = orgSubs.length > 0 ? Math.round((approved / orgSubs.length) * 100) : 0;

                      return (
                        <tr key={org.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <p className="font-bold text-gray-900">{org.code}</p>
                            <p className="text-sm text-gray-500">{org.name}</p>
                          </td>
                          <td className="px-6 py-4 text-center font-bold">{orgSubs.length}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-bold text-green-600">{approved}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-bold text-yellow-600">{pending}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-bold text-red-600">{rejected}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`badge text-lg ${
                              compliance >= 90 ? 'badge-success' :
                              compliance >= 70 ? 'badge-info' :
                              compliance >= 50 ? 'badge-warning' :
                              'badge-danger'
                            }`}>
                              {compliance}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* FINANCIAL REPORT */}
        {activeReport === 'financial' && (
          <div className="space-y-6">
            {/* Financial Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white shadow-lg">
                <p className="text-sm opacity-80 mb-2">Total STRs Reported</p>
                <p className="text-4xl font-bold">{systemMetrics.totalSTRs.toLocaleString()}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 text-white shadow-lg">
                <p className="text-sm opacity-80 mb-2">Active Cases</p>
                <p className="text-4xl font-bold">{systemMetrics.totalCases.toLocaleString()}</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl p-6 text-white shadow-lg">
                <p className="text-sm opacity-80 mb-2">Convictions</p>
                <p className="text-4xl font-bold">{systemMetrics.totalConvictions.toLocaleString()}</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
                <p className="text-sm opacity-80 mb-2">Assets Frozen</p>
                <p className="text-2xl font-bold">{formatCurrency(systemMetrics.totalAssetsFrozen)}</p>
              </div>

              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                <p className="text-sm opacity-80 mb-2">Assets Seized</p>
                <p className="text-2xl font-bold">{formatCurrency(systemMetrics.totalAssetsSeized)}</p>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                <p className="text-sm opacity-80 mb-2">Enforcement Actions</p>
                <p className="text-4xl font-bold">{systemMetrics.totalEnforcementActions.toLocaleString()}</p>
              </div>
            </div>

            {/* STR Trend */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">STR Monthly Trend</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="strs" fill="#3b82f6" name="STRs" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="cases" fill="#8b5cf6" name="Cases" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TREND ANALYSIS */}
        {activeReport === 'trends' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">12-Month Trend Analysis</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="strs" stroke="#3b82f6" strokeWidth={3} name="STRs" />
                  <Line yAxisId="left" type="monotone" dataKey="cases" stroke="#8b5cf6" strokeWidth={3} name="Cases" />
                  <Line yAxisId="right" type="monotone" dataKey="compliance" stroke="#10b981" strokeWidth={3} name="Compliance %" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Key Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-bold text-blue-900 mb-2">📈 Upward Trend</h4>
                  <p className="text-sm text-blue-800">STR submissions have increased by 15% in the last quarter</p>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-bold text-green-900 mb-2">✅ Improved Compliance</h4>
                  <p className="text-sm text-green-800">Overall compliance rate improved from 85% to 92%</p>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-bold text-purple-900 mb-2">⚖️ Conviction Rate</h4>
                  <p className="text-sm text-purple-800">Cases resulting in convictions increased by 8%</p>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-bold text-orange-900 mb-2">💰 Asset Recovery</h4>
                  <p className="text-sm text-orange-800">Total assets seized reached UGX 2.5B this year</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COMPARATIVE ANALYSIS */}
        {activeReport === 'comparative' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Organization Type Comparison</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={typeComplianceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="submissions" fill="#3b82f6" name="Total Submissions" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="compliance" fill="#10b981" name="Compliance %" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Select organizations for comparison */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Compare Specific Organizations</h3>
              <p className="text-gray-600 mb-4">Select organizations to compare their performance</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {organizations.slice(0, 8).map(org => (
                  <label key={org.id} className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedOrgs.includes(org.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrgs([...selectedOrgs, org.id]);
                        } else {
                          setSelectedOrgs(selectedOrgs.filter(id => id !== org.id));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm font-semibold">{org.code}</span>
                  </label>
                ))}
              </div>

              {selectedOrgs.length > 0 && (
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={
                    [
                      { metric: 'Compliance', ...selectedOrgs.reduce((acc, orgId) => {
                        const org = organizations.find(o => o.id === orgId);
                        if (org) {
                          const subs = allSubmissions.filter(s => s.organizationId === orgId);
                          acc[org.code] = Math.round((subs.filter(s => s.status === 'approved').length / subs.length) * 100) || 0;
                        }
                        return acc;
                      }, {} as any) },
                      { metric: 'Timeliness', ...selectedOrgs.reduce((acc, orgId) => {
                        const org = organizations.find(o => o.id === orgId);
                        if (org) acc[org.code] = 85;
                        return acc;
                      }, {} as any) },
                      { metric: 'Completeness', ...selectedOrgs.reduce((acc, orgId) => {
                        const org = organizations.find(o => o.id === orgId);
                        if (org) {
                          const subs = allSubmissions.filter(s => s.organizationId === orgId);
                          acc[org.code] = subs.length > 0 ? Math.round(subs.reduce((sum, s) => sum + s.completionRate, 0) / subs.length) : 0;
                        }
                        return acc;
                      }, {} as any) },
                      { metric: 'Quality', ...selectedOrgs.reduce((acc, orgId) => {
                        const org = organizations.find(o => o.id === orgId);
                        if (org) acc[org.code] = 92;
                        return acc;
                      }, {} as any) },
                      { metric: 'Consistency', ...selectedOrgs.reduce((acc, orgId) => {
                        const org = organizations.find(o => o.id === orgId);
                        if (org) acc[org.code] = 88;
                        return acc;
                      }, {} as any) },
                    ]
                  }>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    {selectedOrgs.map((orgId, index) => {
                      const org = organizations.find(o => o.id === orgId);
                      if (!org) return null;
                      const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
                      return (
                        <Radar
                          key={orgId}
                          name={org.code}
                          dataKey={org.code}
                          stroke={colors[index % colors.length]}
                          fill={colors[index % colors.length]}
                          fillOpacity={0.3}
                        />
                      );
                    })}
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Schedule Report Modal */}
      {showScheduleModal && (
        <ScheduleReport
          reportType={activeReport}
          onClose={() => setShowScheduleModal(false)}
          onSchedule={handleScheduleReport}
        />
      )}
    </DashboardLayout>
  );
}