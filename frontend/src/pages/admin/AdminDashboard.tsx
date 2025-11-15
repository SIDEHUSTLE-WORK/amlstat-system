// frontend/src/pages/admin/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import { 
  Building2, 
  FileText, 
  AlertTriangle, 
  TrendingUp,
  CheckCircle,
  Clock,
  ArrowRight,
  Search,
  Eye,
  Download,
  X,
  DollarSign,
  Scale,
  ShieldAlert,
  Briefcase,
  Gavel,
  TrendingDown,
  Activity
} from 'lucide-react';
import { useAppStore } from '../../store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

type ModalType = 'none' | 'organizations' | 'pending' | 'overdue' | 'compliance';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { 
    dashboardStats, 
    organizations, 
    selectOrganization, 
    getAllSubmissions,
    fetchDashboardStats,
    fetchOrganizations,
    fetchSubmissions,
    isLoadingDashboard,
    isLoadingOrganizations
  } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [activeModal, setActiveModal] = useState<ModalType>('none');

  // 🔥 FETCH REAL DATA ON MOUNT
  useEffect(() => {
    fetchDashboardStats();
    fetchOrganizations();
    fetchSubmissions();
  }, [fetchDashboardStats, fetchOrganizations, fetchSubmissions]);

  // Get all submissions
  const allSubmissions = getAllSubmissions();

  // Calculate Financial Metrics from Submissions
  const calculateMetrics = () => {
    let totalSTRs = 0;
    let totalCases = 0;
    let totalAssetsFrozen = 0;
    let totalAssetsSeized = 0;
    let totalConvictions = 0;
    let totalTransactionAmount = 0;
    let totalEnforcementActions = 0;
    let totalInspections = 0;

    allSubmissions.forEach(submission => {
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

    return {
      totalSTRs,
      totalCases,
      totalAssetsFrozen,
      totalAssetsSeized,
      totalConvictions,
      totalTransactionAmount,
      totalEnforcementActions,
      totalInspections,
    };
  };

  const metrics = calculateMetrics();

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `UGX ${(amount / 1000000000).toFixed(2)}B`;
    } else if (amount >= 1000000) {
      return `UGX ${(amount / 1000000).toFixed(2)}M`;
    }
    return `UGX ${amount.toLocaleString()}`;
  };

  const filteredOrgs = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         org.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || org.type === filterType;
    return matchesSearch && matchesType;
  });

  const pendingOrgs = organizations.filter(org => org.pendingSubmissions > 0);
  const overdueOrgs = organizations.filter(org => org.overdueSubmissions > 0);

  const getOrgTypeBadge = (type: string) => {
    const badges: Record<string, string> = {
      REGULATOR: 'bg-blue-100 text-blue-800 border-blue-200',
      MINISTRY: 'bg-purple-100 text-purple-800 border-purple-200',
      PROFESSIONAL: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      LAW_ENFORCEMENT: 'bg-red-100 text-red-800 border-red-200',
      PROSECUTION: 'bg-orange-100 text-orange-800 border-orange-200',
      INTERNATIONAL: 'bg-teal-100 text-teal-800 border-teal-200',
      FIA: 'bg-fia-gold/20 text-fia-navy border-fia-gold',
    };
    return badges[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getComplianceBadge = (score: number) => {
    if (score >= 90) return 'badge-success';
    if (score >= 80) return 'badge-info';
    if (score >= 70) return 'badge-warning';
    return 'badge-danger';
  };

  // 🔥 LOADING STATE
  if (isLoadingDashboard || isLoadingOrganizations) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-fia-navy mb-4"></div>
            <p className="text-gray-600 text-lg">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // 🔥 NO DATA STATE
  if (!dashboardStats) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600">Dashboard stats will appear here once submissions are made.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Monthly submission trends (will be empty until data exists)
  const monthlyTrend = [
    { month: 'Jul', submitted: 0, pending: 0 },
    { month: 'Aug', submitted: 0, pending: 0 },
    { month: 'Sep', submitted: 0, pending: 0 },
    { month: 'Oct', submitted: 0, pending: 0 },
    { month: 'Nov', submitted: 0, pending: 0 },
    { month: 'Dec', submitted: dashboardStats.currentMonthSubmissions, pending: dashboardStats.currentMonthPending },
  ];

  // Compliance distribution (empty until data exists)
  const complianceData = dashboardStats.totalSubmissions > 0 ? [
    { name: 'Excellent (90-100%)', value: 12, color: '#10b981' },
    { name: 'Good (80-89%)', value: 4, color: '#3b82f6' },
    { name: 'Fair (70-79%)', value: 1, color: '#f59e0b' },
  ] : [];

  // Organization type breakdown
  const orgTypeData = [
    { type: 'Regulators', count: organizations.filter(o => o.type === 'REGULATOR').length, submitted: 0 },
    { type: 'Law Enforcement', count: organizations.filter(o => o.type === 'LAW_ENFORCEMENT').length, submitted: 0 },
    { type: 'Professional', count: organizations.filter(o => o.type === 'PROFESSIONAL').length, submitted: 0 },
    { type: 'Ministry', count: organizations.filter(o => o.type === 'MINISTRY').length, submitted: 0 },
    { type: 'Prosecution', count: organizations.filter(o => o.type === 'PROSECUTION').length, submitted: 0 },
    { type: 'International', count: organizations.filter(o => o.type === 'INTERNATIONAL').length, submitted: 0 },
    { type: 'FIA', count: organizations.filter(o => o.type === 'FIA').length, submitted: 0 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-fia-navy mb-2">FIA Admin Dashboard</h1>
          <p className="text-gray-600">Monitor monthly statistics from all {dashboardStats.totalOrganizations} government organizations</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          
          {/* Total Organizations */}
          <div 
            onClick={() => setActiveModal('organizations')}
            className="bg-gradient-to-br from-fia-navy to-fia-teal rounded-xl p-6 shadow-lg text-white card-hover cursor-pointer relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-white/80 font-medium mb-1">Total Organizations</h3>
              <div className="text-4xl font-bold mb-2">{dashboardStats.totalOrganizations}</div>
              <p className="text-white/70 text-sm">All active entities</p>
              <div className="mt-4 flex items-center text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                <span>View All</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </div>

          {/* Completed Submissions */}
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500 card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-3xl font-bold text-green-500">{dashboardStats.completedSubmissions}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Completed</h3>
            <p className="text-sm text-gray-500 mt-1">Submissions approved</p>
          </div>

          {/* Pending Submissions */}
          <div 
            onClick={() => setActiveModal('pending')}
            className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-yellow-500 card-hover cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-50 rounded-lg group-hover:bg-yellow-100 transition-colors">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              <span className="text-3xl font-bold text-yellow-500">{dashboardStats.pendingSubmissions}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Pending</h3>
            <p className="text-sm text-gray-500 mt-1">Awaiting submission</p>
            <div className="mt-4 flex items-center text-yellow-500 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              <span>View Details</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </div>

          {/* Overdue */}
          <div 
            onClick={() => setActiveModal('overdue')}
            className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-red-500 card-hover cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <span className="text-3xl font-bold text-red-500">{dashboardStats.overdueSubmissions}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Overdue</h3>
            <p className="text-sm text-gray-500 mt-1">Require attention</p>
            <div className="mt-4 flex items-center text-red-500 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              <span>View Alerts</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </div>

          {/* Average Compliance */}
          <div 
            onClick={() => setActiveModal('compliance')}
            className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-fia-teal card-hover cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-fia-teal/10 rounded-lg group-hover:bg-fia-teal/20 transition-colors">
                <TrendingUp className="w-6 h-6 text-fia-teal" />
              </div>
              <span className="text-3xl font-bold text-fia-teal">{dashboardStats.averageComplianceRate}%</span>
            </div>
            <h3 className="text-gray-600 font-medium">Avg Compliance</h3>
            <p className="text-sm text-gray-500 mt-1">System-wide average</p>
            <div className="mt-4 flex items-center text-fia-teal text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              <span>View Breakdown</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="bg-gradient-to-r from-fia-navy/5 via-fia-teal/5 to-fia-navy/5 rounded-2xl p-6 border-2 border-fia-teal/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-fia-navy flex items-center space-x-2">
              <Activity className="w-8 h-8" />
              <span>Key Financial & Operational Metrics</span>
            </h2>
            <button className="btn-secondary text-sm">View Detailed Report</button>
          </div>

          {allSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Data Yet</h3>
              <p className="text-gray-600">Financial metrics will appear here once submissions are made.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total STRs */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <ShieldAlert className="w-8 h-8 opacity-80" />
                  <div className="text-right">
                    <div className="text-3xl font-bold">{metrics.totalSTRs.toLocaleString()}</div>
                  </div>
                </div>
                <h3 className="font-semibold text-sm">Total STRs</h3>
                <p className="text-xs opacity-80 mt-1">Suspicious Transaction Reports</p>
              </div>

              {/* Other metrics... */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <Briefcase className="w-8 h-8 opacity-80" />
                  <div className="text-right">
                    <div className="text-3xl font-bold">{metrics.totalCases.toLocaleString()}</div>
                  </div>
                </div>
                <h3 className="font-semibold text-sm">Active Cases</h3>
                <p className="text-xs opacity-80 mt-1">Ongoing investigations</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <DollarSign className="w-8 h-8 opacity-80" />
                  <div className="text-right">
                    <div className="text-2xl font-bold">{formatCurrency(metrics.totalAssetsFrozen)}</div>
                  </div>
                </div>
                <h3 className="font-semibold text-sm">Assets Frozen</h3>
                <p className="text-xs opacity-80 mt-1">Total value secured</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <Scale className="w-8 h-8 opacity-80" />
                  <div className="text-right">
                    <div className="text-2xl font-bold">{formatCurrency(metrics.totalAssetsSeized)}</div>
                  </div>
                </div>
                <h3 className="font-semibold text-sm">Assets Seized</h3>
                <p className="text-xs opacity-80 mt-1">Total recovered</p>
              </div>

              <div className="bg-gradient-to-br from-rose-500 to-pink-700 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <Gavel className="w-8 h-8 opacity-80" />
                  <div className="text-right">
                    <div className="text-3xl font-bold">{metrics.totalConvictions}</div>
                  </div>
                </div>
                <h3 className="font-semibold text-sm">Convictions</h3>
                <p className="text-xs opacity-80 mt-1">Cases won</p>
              </div>

              <div className="bg-gradient-to-br from-cyan-500 to-blue-700 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <TrendingDown className="w-8 h-8 opacity-80" />
                  <div className="text-right">
                    <div className="text-xl font-bold">{formatCurrency(metrics.totalTransactionAmount)}</div>
                  </div>
                </div>
                <h3 className="font-semibold text-sm">STR Total Value</h3>
                <p className="text-xs opacity-80 mt-1">Suspicious amounts</p>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-orange-700 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <AlertTriangle className="w-8 h-8 opacity-80" />
                  <div className="text-right">
                    <div className="text-3xl font-bold">{metrics.totalEnforcementActions}</div>
                  </div>
                </div>
                <h3 className="font-semibold text-sm">Enforcement</h3>
                <p className="text-xs opacity-80 mt-1">Penalties & sanctions</p>
              </div>

              <div className="bg-gradient-to-br from-indigo-500 to-purple-700 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <Eye className="w-8 h-8 opacity-80" />
                  <div className="text-right">
                    <div className="text-3xl font-bold">{metrics.totalInspections}</div>
                  </div>
                </div>
                <h3 className="font-semibold text-sm">Inspections</h3>
                <p className="text-xs opacity-80 mt-1">Compliance checks</p>
              </div>
            </div>
          )}
        </div>

        {/* Current Month Status */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Current Month: {dashboardStats.currentMonth}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Submitted</p>
                <p className="text-3xl font-bold text-green-600">{dashboardStats.currentMonthSubmissions}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{dashboardStats.currentMonthPending}</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-500" />
            </div>
            <div className="mt-4 bg-gray-100 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${dashboardStats.totalOrganizations > 0 ? (dashboardStats.currentMonthSubmissions / dashboardStats.totalOrganizations) * 100 : 0}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 text-center">
              {dashboardStats.totalOrganizations > 0 ? Math.round((dashboardStats.currentMonthSubmissions / dashboardStats.totalOrganizations) * 100) : 0}% completion rate
            </p>
          </div>
        </div>

        {/* All Organizations Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">All Organizations ({organizations.length})</h2>
              <button className="btn-secondary flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search organizations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fia-teal focus:border-transparent"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fia-teal"
              >
                <option value="all">All Types</option>
                <option value="REGULATOR">Regulators</option>
                <option value="LAW_ENFORCEMENT">Law Enforcement</option>
                <option value="MINISTRY">Ministry</option>
                <option value="PROFESSIONAL">Professional Bodies</option>
                <option value="PROSECUTION">Prosecution</option>
                <option value="INTERNATIONAL">International</option>
                <option value="FIA">FIA</option>
              </select>
            </div>

            {organizations.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Organizations Yet</h3>
                <p className="text-gray-600">Organizations will appear here once they are added to the system.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Code</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Organization</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Type</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">Completed</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">Pending</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">Overdue</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">Compliance</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Last Submission</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOrgs.map((org) => (
                      <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-bold text-fia-navy">{org.code}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">{org.name}</p>
                          <p className="text-sm text-gray-500">{org.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`badge border ${getOrgTypeBadge(org.type)}`}>
                            {org.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-green-600 font-bold text-lg">{org.completedSubmissions || 0}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-yellow-600 font-bold text-lg">{org.pendingSubmissions || 0}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-red-600 font-bold text-lg">{org.overdueSubmissions || 0}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`badge text-lg ${getComplianceBadge(org.complianceScore || 0)}`}>
                            {org.complianceScore || 0}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {org.lastSubmissionDate ? new Date(org.lastSubmissionDate).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => navigate(`/admin/organization/${org.id}`)}
                            className="text-fia-teal hover:text-fia-teal-dark font-semibold flex items-center space-x-1 hover:scale-105 transition-transform"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Details</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      {/* Organizations Modal */}
      {activeModal === 'organizations' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-fia-navy to-fia-teal p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">All Organizations</h2>
                  <p className="text-white/80">17 government entities reporting monthly statistics</p>
                </div>
                <button
                  onClick={() => setActiveModal('none')}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto" style={{ maxHeight: '70vh' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {organizations.map((org) => (
                  <div 
                    key={org.id} 
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => {
                      setActiveModal('none');
                      navigate(`/admin/organization/${org.id}`);
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{org.code}</h3>
                        <p className="text-sm text-gray-600">{org.name}</p>
                      </div>
                      <span className={`badge ${getComplianceBadge(org.complianceScore)}`}>
                        {org.complianceScore}%
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="text-center p-2 bg-green-50 rounded">
                        <p className="font-bold text-green-600">{org.completedSubmissions}</p>
                        <p className="text-xs text-gray-600">Completed</p>
                      </div>
                      <div className="text-center p-2 bg-yellow-50 rounded">
                        <p className="font-bold text-yellow-600">{org.pendingSubmissions}</p>
                        <p className="text-xs text-gray-600">Pending</p>
                      </div>
                      <div className="text-center p-2 bg-red-50 rounded">
                        <p className="font-bold text-red-600">{org.overdueSubmissions}</p>
                        <p className="text-xs text-gray-600">Overdue</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Modal */}
      {activeModal === 'pending' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Pending Submissions</h2>
                  <p className="text-white/80">{pendingOrgs.length} organizations with pending submissions</p>
                </div>
                <button
                  onClick={() => setActiveModal('none')}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto" style={{ maxHeight: '70vh' }}>
              <div className="space-y-4">
                {pendingOrgs.map((org) => (
                  <div key={org.id} className="border border-yellow-200 rounded-xl p-6 bg-yellow-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{org.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{org.code}</p>
                        <p className="text-sm text-yellow-600 mt-2">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {org.pendingSubmissions} month(s) pending
                        </p>
                      </div>
                      <button className="btn-primary">Send Reminder</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overdue Modal */}
      {activeModal === 'overdue' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-red-500 to-red-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Overdue Submissions</h2>
                  <p className="text-white/80">{overdueOrgs.length} organizations requiring immediate attention</p>
                </div>
                <button
                  onClick={() => setActiveModal('none')}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto" style={{ maxHeight: '70vh' }}>
              {overdueOrgs.length > 0 ? (
                <div className="space-y-4">
                  {overdueOrgs.map((org) => (
                    <div key={org.id} className="border-2 border-red-300 rounded-xl p-6 bg-red-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{org.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{org.code}</p>
                          <p className="text-sm text-red-600 mt-2 font-semibold">
                            <AlertTriangle className="w-4 h-4 inline mr-1" />
                            {org.overdueSubmissions} month(s) overdue
                          </p>
                        </div>
                        <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold">
                          Escalate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">All Clear!</h3>
                  <p className="text-gray-600">No overdue submissions at this time.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}