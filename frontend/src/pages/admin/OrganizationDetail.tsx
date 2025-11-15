// frontend/src/pages/admin/OrganizationDetail.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import toast from 'react-hot-toast';
import { 
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  User,
  Calendar,
  TrendingUp,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Download,
  Eye,
  BarChart3,
  DollarSign,
  Scale,
  ShieldAlert,
  Briefcase,
  Gavel,
  Activity,
  Send,
  Lock,
  Unlock,
  Edit,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  X
} from 'lucide-react';
import { useAppStore, getOrgTheme } from '../../store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useNotifications } from '../../utils/notificationUtils';
import { submissionsAPI, organizationsAPI } from '../../services/api';

export default function OrganizationDetail() {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { organizations, getSubmissionsByOrg, fetchSubmissionsByOrg } = useAppStore();
  const notifications = useNotifications();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'analytics' | 'compare'>('overview');
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalComments, setApprovalComments] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Find organization
  const organization = organizations.find(o => o.id === orgId);
  
  // 🔥 FETCH SUBMISSIONS ON MOUNT
  useEffect(() => {
    if (orgId) {
      fetchSubmissionsByOrg(orgId);
    }
  }, [orgId, fetchSubmissionsByOrg]);

  if (!organization) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Organization Not Found</h3>
          <button onClick={() => navigate('/admin/dashboard')} className="btn-primary mt-4">
            Back to Dashboard
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Get organization theme
  const theme = getOrgTheme(organization.code);

  // Get submissions
  const orgSubmissions = getSubmissionsByOrg(organization.id);

  // Calculate organization-specific metrics
  const calculateOrgMetrics = () => {
    let totalSTRs = 0;
    let totalCases = 0;
    let totalAssetsFrozen = 0;
    let totalAssetsSeized = 0;
    let totalConvictions = 0;
    let totalTransactionAmount = 0;
    let totalEnforcementActions = 0;
    let totalInspections = 0;

    orgSubmissions.forEach(submission => {
      // Handle both array and object formats
      const indicators = Array.isArray(submission.indicators) 
        ? submission.indicators 
        : Object.entries(submission.indicators || {}).map(([key, value]) => ({
            number: key,
            value: value
          }));

      indicators.forEach((indicator: any) => {
        const value = typeof indicator.value === 'number' ? indicator.value : parseFloat(indicator.value) || 0;
        
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

  const orgMetrics = calculateOrgMetrics();

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `UGX ${(amount / 1000000000).toFixed(2)}B`;
    } else if (amount >= 1000000) {
      return `UGX ${(amount / 1000000).toFixed(2)}M`;
    }
    return `UGX ${amount.toLocaleString()}`;
  };

  // Monthly trend for this org
  const monthlyTrend = [
    { 
      month: 'Jul', 
      submissions: orgSubmissions.filter(s => s.month === 7).length,
      compliance: orgSubmissions.find(s => s.month === 7)?.completionRate || 0,
      strs: orgSubmissions.filter(s => s.month === 7).reduce((sum, s) => {
        const indicators = Array.isArray(s.indicators) ? s.indicators : Object.entries(s.indicators || {}).map(([k, v]) => ({ number: k, value: v }));
        const str = indicators.find((i: any) => i.number === '1.1');
        return sum + (str ? (parseFloat(String(str.value)) || 0) : 0);
      }, 0)
    },
    { 
      month: 'Aug', 
      submissions: orgSubmissions.filter(s => s.month === 8).length,
      compliance: orgSubmissions.find(s => s.month === 8)?.completionRate || 0,
      strs: orgSubmissions.filter(s => s.month === 8).reduce((sum, s) => {
        const indicators = Array.isArray(s.indicators) ? s.indicators : Object.entries(s.indicators || {}).map(([k, v]) => ({ number: k, value: v }));
        const str = indicators.find((i: any) => i.number === '1.1');
        return sum + (str ? (parseFloat(String(str.value)) || 0) : 0);
      }, 0)
    },
    { 
      month: 'Sep', 
      submissions: orgSubmissions.filter(s => s.month === 9).length,
      compliance: orgSubmissions.find(s => s.month === 9)?.completionRate || 0,
      strs: orgSubmissions.filter(s => s.month === 9).reduce((sum, s) => {
        const indicators = Array.isArray(s.indicators) ? s.indicators : Object.entries(s.indicators || {}).map(([k, v]) => ({ number: k, value: v }));
        const str = indicators.find((i: any) => i.number === '1.1');
        return sum + (str ? (parseFloat(String(str.value)) || 0) : 0);
      }, 0)
    },
    { 
      month: 'Oct', 
      submissions: orgSubmissions.filter(s => s.month === 10).length,
      compliance: orgSubmissions.find(s => s.month === 10)?.completionRate || 0,
      strs: orgSubmissions.filter(s => s.month === 10).reduce((sum, s) => {
        const indicators = Array.isArray(s.indicators) ? s.indicators : Object.entries(s.indicators || {}).map(([k, v]) => ({ number: k, value: v }));
        const str = indicators.find((i: any) => i.number === '1.1');
        return sum + (str ? (parseFloat(String(str.value)) || 0) : 0);
      }, 0)
    },
    { 
      month: 'Nov', 
      submissions: orgSubmissions.filter(s => s.month === 11).length,
      compliance: orgSubmissions.find(s => s.month === 11)?.completionRate || 0,
      strs: orgSubmissions.filter(s => s.month === 11).reduce((sum, s) => {
        const indicators = Array.isArray(s.indicators) ? s.indicators : Object.entries(s.indicators || {}).map(([k, v]) => ({ number: k, value: v }));
        const str = indicators.find((i: any) => i.number === '1.1');
        return sum + (str ? (parseFloat(String(str.value)) || 0) : 0);
      }, 0)
    },
    { 
      month: 'Dec', 
      submissions: orgSubmissions.filter(s => s.month === 12).length,
      compliance: orgSubmissions.find(s => s.month === 12)?.completionRate || 0,
      strs: orgSubmissions.filter(s => s.month === 12).reduce((sum, s) => {
        const indicators = Array.isArray(s.indicators) ? s.indicators : Object.entries(s.indicators || {}).map(([k, v]) => ({ number: k, value: v }));
        const str = indicators.find((i: any) => i.number === '1.1');
        return sum + (str ? (parseFloat(String(str.value)) || 0) : 0);
      }, 0)
    },
  ];

  // Submission status distribution - 🔥 UPPERCASE STATUS
  const statusData = [
    { name: 'Approved', value: orgSubmissions.filter(s => s.status === 'APPROVED').length, color: '#10b981' },
    { name: 'Submitted', value: orgSubmissions.filter(s => s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW').length, color: '#3b82f6' },
    { name: 'Draft', value: orgSubmissions.filter(s => s.status === 'DRAFT').length, color: '#f59e0b' },
    { name: 'Rejected', value: orgSubmissions.filter(s => s.status === 'REJECTED').length, color: '#ef4444' },
  ].filter(item => item.value > 0);

  // Performance radar data
  const performanceData = [
    { metric: 'Timeliness', value: organization.complianceScore, fullMark: 100 },
    { metric: 'Completeness', value: orgSubmissions.length > 0 ? Math.round(orgSubmissions.reduce((sum, s) => sum + (s.completionRate || 0), 0) / orgSubmissions.length) : 0, fullMark: 100 },
    { metric: 'Accuracy', value: 92, fullMark: 100 },
    { metric: 'Consistency', value: 88, fullMark: 100 },
    { metric: 'Quality', value: 95, fullMark: 100 },
  ];

  // 🔥 UPDATED STATUS BADGE - UPPERCASE
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { class: string; icon: any; text: string }> = {
      DRAFT: { class: 'badge-info', icon: Clock, text: 'Draft' },
      SUBMITTED: { class: 'badge-info', icon: Clock, text: 'Submitted' },
      UNDER_REVIEW: { class: 'badge-warning', icon: Clock, text: 'Under Review' },
      APPROVED: { class: 'badge-success', icon: CheckCircle, text: 'Approved' },
      REJECTED: { class: 'badge-danger', icon: XCircle, text: 'Rejected' },
    };
    const badge = badges[status] || badges.DRAFT;
    const Icon = badge.icon;
    return (
      <span className={`badge ${badge.class} flex items-center space-x-1`}>
        <Icon className="w-3 h-3" />
        <span>{badge.text}</span>
      </span>
    );
  };

  // 🔥 APPROVAL HANDLER WITH REAL API
  const handleApprove = async () => {
    if (!selectedSubmission) return;
    
    setIsProcessing(true);
    try {
      const response = await submissionsAPI.approve(selectedSubmission.id, approvalComments);
      
      if (response.data.success) {
        // 🔔 SEND NOTIFICATION TO ORGANIZATION
        notifications.submissionApproved(
          organization.name,
          selectedSubmission.month,
          selectedSubmission.year,
          selectedSubmission.id
        );
        
        // Show toast
        toast.success('Submission approved successfully!');
        
        // Refresh data
        await fetchSubmissionsByOrg(organization.id);
        
        // Close modal and reset
        setShowApprovalModal(false);
        setApprovalComments('');
        setSelectedSubmission(null);
      }
    } catch (error: any) {
      console.error('Approval error:', error);
      toast.error(error.response?.data?.message || 'Failed to approve submission');
    } finally {
      setIsProcessing(false);
    }
  };

  // 🔥 REJECTION HANDLER WITH REAL API
  const handleReject = async () => {
    if (!selectedSubmission || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    
    setIsProcessing(true);
    try {
      const response = await submissionsAPI.reject(selectedSubmission.id, rejectionReason);
      
      if (response.data.success) {
        // 🔔 SEND NOTIFICATION TO ORGANIZATION WITH REASON
        notifications.submissionRejected(
          organization.name,
          selectedSubmission.month,
          selectedSubmission.year,
          rejectionReason,
          selectedSubmission.id
        );
        
        // Show toast
        toast.error('Submission rejected');
        
        // Refresh data
        await fetchSubmissionsByOrg(organization.id);
        
        // Close modal and reset
        setShowApprovalModal(false);
        setRejectionReason('');
        setSelectedSubmission(null);
      }
    } catch (error: any) {
      console.error('Rejection error:', error);
      toast.error(error.response?.data?.message || 'Failed to reject submission');
    } finally {
      setIsProcessing(false);
    }
  };

  const openApprovalModal = (submission: any, action: 'approve' | 'reject') => {
    setSelectedSubmission(submission);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Gradient */}
        <div className={`bg-gradient-to-r ${theme.gradient} rounded-2xl p-8 text-white shadow-2xl`}>
          <button
            onClick={() => navigate('/admin/organizations')}
            className="mb-4 flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Organizations</span>
          </button>
          
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                <Building2 className="w-12 h-12" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">{organization.name}</h1>
                <p className="text-white/80 text-lg mb-4">Code: {organization.code}</p>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{organization.contactPerson}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>{organization.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>{organization.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end space-y-3">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                {organization.isActive ? (
                  <>
                    <Unlock className="w-5 h-5" />
                    <span className="font-semibold">Active</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span className="font-semibold">Inactive</span>
                  </>
                )}
              </div>
              <div className="flex space-x-2">
                <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2">
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>Message</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <span className="text-3xl font-bold text-green-500">{organization.completedSubmissions}</span>
            </div>
            <h3 className="text-gray-600 font-medium text-sm">Completed</h3>
            <p className="text-xs text-gray-500 mt-1">Submissions</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-yellow-500" />
              <span className="text-3xl font-bold text-yellow-500">{organization.pendingSubmissions}</span>
            </div>
            <h3 className="text-gray-600 font-medium text-sm">Pending</h3>
            <p className="text-xs text-gray-500 mt-1">Awaiting</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <span className="text-3xl font-bold text-red-500">{organization.overdueSubmissions}</span>
            </div>
            <h3 className="text-gray-600 font-medium text-sm">Overdue</h3>
            <p className="text-xs text-gray-500 mt-1">Late</p>
          </div>

          <div className={`bg-white rounded-xl p-6 shadow-lg border-l-4`} style={{ borderColor: theme.primary }}>
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8" style={{ color: theme.primary }} />
              <span className="text-3xl font-bold" style={{ color: theme.primary }}>{organization.complianceScore}%</span>
            </div>
            <h3 className="text-gray-600 font-medium text-sm">Compliance</h3>
            <p className="text-xs text-gray-500 mt-1">Score</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-blue-500" />
              <span className="text-sm font-bold text-blue-500">
                {organization.lastSubmissionDate 
                  ? new Date(organization.lastSubmissionDate).toLocaleDateString() 
                  : 'N/A'}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium text-sm">Last Submission</h3>
            <p className="text-xs text-gray-500 mt-1">Date</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'overview'
                    ? 'border-b-2 text-fia-navy'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={activeTab === 'overview' ? { borderColor: theme.primary } : {}}
              >
                <Activity className="w-5 h-5 inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'submissions'
                    ? 'border-b-2 text-fia-navy'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={activeTab === 'submissions' ? { borderColor: theme.primary } : {}}
              >
                <FileText className="w-5 h-5 inline mr-2" />
                Submissions ({orgSubmissions.length})
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'analytics'
                    ? 'border-b-2 text-fia-navy'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={activeTab === 'analytics' ? { borderColor: theme.primary } : {}}
              >
                <BarChart3 className="w-5 h-5 inline mr-2" />
                Analytics
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Financial Metrics */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Financial & Operational Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white">
                      <ShieldAlert className="w-8 h-8 mb-3 opacity-80" />
                      <div className="text-3xl font-bold mb-1">{orgMetrics.totalSTRs.toLocaleString()}</div>
                      <div className="text-sm opacity-80">Total STRs</div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 text-white">
                      <Briefcase className="w-8 h-8 mb-3 opacity-80" />
                      <div className="text-3xl font-bold mb-1">{orgMetrics.totalCases}</div>
                      <div className="text-sm opacity-80">Active Cases</div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white">
                      <DollarSign className="w-8 h-8 mb-3 opacity-80" />
                      <div className="text-xl font-bold mb-1">{formatCurrency(orgMetrics.totalAssetsFrozen)}</div>
                      <div className="text-sm opacity-80">Assets Frozen</div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl p-6 text-white">
                      <Scale className="w-8 h-8 mb-3 opacity-80" />
                      <div className="text-xl font-bold mb-1">{formatCurrency(orgMetrics.totalAssetsSeized)}</div>
                      <div className="text-sm opacity-80">Assets Seized</div>
                    </div>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Compliance Trend */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Compliance Trend (6 Months)</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={monthlyTrend}>
                        <defs>
                          <linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme.primary} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={theme.primary} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Area type="monotone" dataKey="compliance" stroke={theme.primary} fillOpacity={1} fill="url(#colorCompliance)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Status Distribution */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Submission Status</h4>
                    {statusData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[250px] text-gray-500">
                        <p>No data to display</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Performance Radar */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Performance Assessment</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={performanceData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar name="Score" dataKey="value" stroke={theme.primary} fill={theme.primary} fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* SUBMISSIONS TAB */}
            {activeTab === 'submissions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">All Submissions</h3>
                  <button className="btn-secondary flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Export All</span>
                  </button>
                </div>

                {orgSubmissions.length > 0 ? (
                  <div className="space-y-4">
                    {orgSubmissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-3">
                              <h4 className="text-lg font-bold text-gray-900">
                                {new Date(submission.year, submission.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                              </h4>
                              {getStatusBadge(submission.status)}
                              <span className="text-sm text-gray-500">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                {submission.submittedAt 
                                  ? new Date(submission.submittedAt).toLocaleDateString() 
                                  : 'Not submitted'}
                              </span>
                            </div>

                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div className="p-3 bg-blue-50 rounded-lg">
                                <p className="text-gray-600">Indicators</p>
                                <p className="font-bold text-blue-600">{submission.filledIndicators}/{submission.totalIndicators}</p>
                              </div>
                              <div className="p-3 bg-green-50 rounded-lg">
                                <p className="text-gray-600">Completion</p>
                                <p className="font-bold text-green-600">{submission.completionRate}%</p>
                              </div>
                              <div className="p-3 bg-purple-50 rounded-lg">
                                <p className="text-gray-600">Report ID</p>
                                <p className="font-mono font-bold text-purple-600 text-xs">{submission.id}</p>
                              </div>
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-gray-600">Submitted By</p>
                                <p className="font-bold text-gray-900 text-xs">{submission.submittedBy || 'N/A'}</p>
                              </div>
                            </div>

                            {/* FIA Feedback */}
                            {submission.reviewNotes && (
                              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-2">
                                <MessageSquare className="w-5 h-5 text-yellow-600 mt-0.5" />
                                <div>
                                  <p className="font-semibold text-yellow-900 text-sm">Admin Feedback</p>
                                  <p className="text-sm text-yellow-800">{submission.reviewNotes}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="ml-6 flex flex-col space-y-2">
                            <button
                              onClick={() => {
                                setSelectedSubmission(submission);
                                setShowSubmissionModal(true);
                              }}
                              className="px-6 py-3 rounded-lg text-white font-semibold transition-colors flex items-center space-x-2"
                              style={{ backgroundColor: theme.primary }}
                            >
                              <Eye className="w-5 h-5" />
                              <span>View</span>
                            </button>

                            {(submission.status === 'SUBMITTED' || submission.status === 'UNDER_REVIEW') && (
                              <>
                                <button
                                  onClick={() => openApprovalModal(submission, 'approve')}
                                  disabled={isProcessing}
                                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 disabled:opacity-50"
                                >
                                  <ThumbsUp className="w-5 h-5" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => openApprovalModal(submission, 'reject')}
                                  disabled={isProcessing}
                                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 disabled:opacity-50"
                                >
                                  <ThumbsDown className="w-5 h-5" />
                                  <span>Reject</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No Submissions Yet</h3>
                    <p className="text-gray-600">This organization hasn't submitted any reports</p>
                  </div>
                )}
              </div>
            )}

            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Detailed Analytics</h3>
                
                {/* Monthly STR Trend */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Monthly STR Trend</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="strs" fill={theme.primary} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* More analytics... */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-6 text-white">
                    <Gavel className="w-8 h-8 mb-3 opacity-80" />
                    <div className="text-3xl font-bold mb-1">{orgMetrics.totalConvictions}</div>
                    <div className="text-sm opacity-80">Total Convictions</div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-6 text-white">
                    <AlertTriangle className="w-8 h-8 mb-3 opacity-80" />
                    <div className="text-3xl font-bold mb-1">{orgMetrics.totalEnforcementActions}</div>
                    <div className="text-sm opacity-80">Enforcement Actions</div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
                    <Eye className="w-8 h-8 mb-3 opacity-80" />
                    <div className="text-3xl font-bold mb-1">{orgMetrics.totalInspections}</div>
                    <div className="text-sm opacity-80">Inspections Conducted</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🔥 SUBMISSION DETAIL MODAL */}
      {showSubmissionModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className={`bg-gradient-to-r ${theme.gradient} p-6 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Submission Details</h2>
                  <p className="text-white/80">
                    {new Date(selectedSubmission.year, selectedSubmission.month - 1).toLocaleDateString('en-US', { 
                      month: 'long', year: 'numeric' 
                    })}
                  </p>
                </div>
                <button onClick={() => setShowSubmissionModal(false)} className="p-2 hover:bg-white/20 rounded-lg">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto" style={{ maxHeight: '70vh' }}>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Status</p>
                    <div className="mt-2">{getStatusBadge(selectedSubmission.status)}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {selectedSubmission.completionRate}%
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Indicators Summary</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      {selectedSubmission.filledIndicators} of {selectedSubmission.totalIndicators} indicators filled
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 APPROVAL/REJECTION MODAL */}
      {showApprovalModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className={`${approvalAction === 'approve' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600'} p-6 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {approvalAction === 'approve' ? 'Approve Submission' : 'Reject Submission'}
                  </h2>
                  <p className="text-white/80">
                    {new Date(selectedSubmission.year, selectedSubmission.month - 1).toLocaleDateString('en-US', { 
                      month: 'long', year: 'numeric' 
                    })}
                  </p>
                </div>
                <button 
                  onClick={() => setShowApprovalModal(false)} 
                  disabled={isProcessing}
                  className="p-2 hover:bg-white/20 rounded-lg disabled:opacity-50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {approvalAction === 'approve' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Comments (Optional)
                    </label>
                    <textarea
                      value={approvalComments}
                      onChange={(e) => setApprovalComments(e.target.value)}
                      placeholder="Add any comments for the organization..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      rows={4}
                      disabled={isProcessing}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleApprove}
                      disabled={isProcessing}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <ThumbsUp className="w-5 h-5" />
                      <span>{isProcessing ? 'Approving...' : 'Approve Submission'}</span>
                    </button>
                    <button
                      onClick={() => setShowApprovalModal(false)}
                      disabled={isProcessing}
                      className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Rejection Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Please provide a detailed reason for rejection..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      rows={4}
                      disabled={isProcessing}
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-yellow-900 text-sm">Organization Will Be Notified</p>
                        <p className="text-sm text-yellow-800">
                          The organization will receive your rejection reason and can resubmit after corrections.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleReject}
                      disabled={isProcessing || !rejectionReason.trim()}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <ThumbsDown className="w-5 h-5" />
                      <span>{isProcessing ? 'Rejecting...' : 'Reject Submission'}</span>
                    </button>
                    <button
                      onClick={() => setShowApprovalModal(false)}
                      disabled={isProcessing}
                      className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}