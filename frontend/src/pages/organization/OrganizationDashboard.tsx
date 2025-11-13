import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import { 
  FileText, 
  Upload, 
  TrendingUp, 
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  Calendar,
  BarChart3,
  Download,
  Eye
} from 'lucide-react';
import { useAppStore } from '../../store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function OrganizationDashboard() {
  const navigate = useNavigate();
  const { currentUser, getSubmissionsByOrg } = useAppStore();
  const org = currentUser?.organization;

  if (!org) {
    return <div>Loading...</div>;
  }

  // Get submissions for this organization
  const mySubmissions = getSubmissionsByOrg(org.id);
  
  // Calculate stats
  const submittedCount = mySubmissions.filter(s => s.status === 'submitted' || s.status === 'approved').length;
  const draftCount = mySubmissions.filter(s => s.status === 'draft').length;
  const totalIndicatorsFilled = mySubmissions.reduce((sum, s) => sum + s.filledIndicators, 0);
  const totalIndicatorsExpected = mySubmissions.reduce((sum, s) => sum + s.totalIndicators, 0);
  const avgCompletionRate = totalIndicatorsExpected > 0 ? Math.round((totalIndicatorsFilled / totalIndicatorsExpected) * 100) : 0;

  // Monthly submissions data (July - December 2024)
  const monthlySubmissions = [
    { month: 'Jul 2024', monthNum: 7, status: 'submitted', dueDate: '2024-08-05', submittedDate: '2024-08-03', indicators: 35, filled: 35 },
    { month: 'Aug 2024', monthNum: 8, status: 'submitted', dueDate: '2024-09-05', submittedDate: '2024-09-02', indicators: 35, filled: 35 },
    { month: 'Sep 2024', monthNum: 9, status: 'submitted', dueDate: '2024-10-05', submittedDate: '2024-10-04', indicators: 35, filled: 35 },
    { month: 'Oct 2024', monthNum: 10, status: 'submitted', dueDate: '2024-11-05', submittedDate: '2024-11-03', indicators: 35, filled: 35 },
    { month: 'Nov 2024', monthNum: 11, status: 'submitted', dueDate: '2024-12-05', submittedDate: '2024-12-04', indicators: 35, filled: 35 },
    { month: 'Dec 2024', monthNum: 12, status: 'pending', dueDate: '2025-01-05', submittedDate: null, indicators: 35, filled: 0 },
  ];

  // Check if December has been submitted
  const decSubmission = mySubmissions.find(s => s.month === 12 && s.year === 2024);
  if (decSubmission) {
    monthlySubmissions[5] = {
      ...monthlySubmissions[5],
      status: 'submitted',
      submittedDate: decSubmission.submittedAt?.toISOString() || new Date().toISOString(),
      filled: decSubmission.filledIndicators,
      indicators: decSubmission.totalIndicators,
    };
  }

  // Performance trend
  const performanceTrend = [
    { month: 'Jul', compliance: 95 },
    { month: 'Aug', compliance: 96 },
    { month: 'Sep', compliance: 94 },
    { month: 'Oct', compliance: 97 },
    { month: 'Nov', compliance: 95 },
    { month: 'Dec', compliance: decSubmission ? decSubmission.completionRate : 0 },
  ];

  // Completion rate over time
  const completionData = [
    { month: 'Jul', rate: 100 },
    { month: 'Aug', rate: 100 },
    { month: 'Sep', rate: 100 },
    { month: 'Oct', rate: 100 },
    { month: 'Nov', rate: 100 },
    { month: 'Dec', rate: decSubmission ? decSubmission.completionRate : 0 },
  ];

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { class: string; icon: any; text: string }> = {
      submitted: { class: 'badge-success', icon: CheckCircle, text: 'Submitted' },
      approved: { class: 'badge-success', icon: CheckCircle, text: 'Approved' },
      pending: { class: 'badge-warning', icon: Clock, text: 'Pending' },
      draft: { class: 'badge-info', icon: FileText, text: 'Draft' },
      rejected: { class: 'badge-danger', icon: AlertTriangle, text: 'Rejected' },
      overdue: { class: 'badge-danger', icon: AlertTriangle, text: 'Overdue' },
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`badge ${badge.class} flex items-center space-x-1`}>
        <Icon className="w-3 h-3" />
        <span>{badge.text}</span>
      </span>
    );
  };

  const currentMonth = monthlySubmissions[5]; // December 2024

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-fia-navy mb-2">{org.name}</h1>
            <p className="text-gray-600">Your monthly statistics submission portal</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/organization/submit')}
              className="btn-primary flex items-center space-x-2"
            >
              <FileText className="w-5 h-5" />
              <span>Submit Statistics</span>
            </button>
            <button
              onClick={() => navigate('/organization/upload')}
              className="btn-secondary flex items-center space-x-2"
            >
              <Upload className="w-5 h-5" />
              <span>Bulk Upload</span>
            </button>
          </div>
        </div>

        {/* Organization Info Card */}
        <div className="bg-gradient-to-br from-fia-navy to-fia-teal rounded-xl p-6 text-white shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div>
              <p className="text-fia-gold text-sm font-semibold mb-1">Organization Code</p>
              <p className="text-2xl font-bold">{org.code}</p>
            </div>
            <div>
              <p className="text-fia-gold text-sm font-semibold mb-1">Type</p>
              <p className="text-2xl font-bold capitalize">{org.type.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-fia-gold text-sm font-semibold mb-1">Compliance Score</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold">{org.complianceScore}%</p>
                {org.complianceScore >= 90 ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                )}
              </div>
            </div>
            <div>
              <p className="text-fia-gold text-sm font-semibold mb-1">Your Submissions</p>
              <p className="text-2xl font-bold">{submittedCount}/{6}</p>
            </div>
            <div>
              <p className="text-fia-gold text-sm font-semibold mb-1">Status</p>
              <div className="flex items-center space-x-2">
                <span className="status-dot status-active" />
                <p className="text-2xl font-bold">Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Month Alert */}
        {currentMonth.status === 'pending' && !decSubmission && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-xl p-6 shadow-lg">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-yellow-900 mb-2">
                  December 2024 Statistics Due!
                </h3>
                <p className="text-yellow-800 mb-4">
                  Your monthly statistics for December 2024 are due by <strong>January 5, 2025</strong>. 
                  Please submit your indicators before the deadline.
                </p>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => navigate('/organization/submit')}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                  >
                    Submit Now
                  </button>
                  <button 
                    onClick={() => navigate('/organization/upload')}
                    className="bg-white hover:bg-gray-50 text-yellow-900 border-2 border-yellow-500 px-6 py-3 rounded-lg font-bold transition-colors"
                  >
                    Upload Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success message if December submitted */}
        {decSubmission && (
          <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-6 shadow-lg">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-green-900 mb-2">
                  December 2024 Statistics Submitted! ✅
                </h3>
                <p className="text-green-800 mb-2">
                  Your statistics were successfully submitted on {decSubmission.submittedAt?.toLocaleDateString()}.
                </p>
                <p className="text-green-700 text-sm">
                  <strong>Completion Rate:</strong> {decSubmission.completionRate}% 
                  ({decSubmission.filledIndicators}/{decSubmission.totalIndicators} indicators filled)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500 card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-3xl font-bold text-green-500">{submittedCount}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Submitted</h3>
            <p className="text-sm text-gray-500 mt-1">Months completed</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500 card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-3xl font-bold text-blue-500">{draftCount}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Drafts</h3>
            <p className="text-sm text-gray-500 mt-1">In progress</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-fia-teal card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-fia-teal/10 rounded-lg">
                <BarChart3 className="w-6 h-6 text-fia-teal" />
              </div>
              <span className="text-3xl font-bold text-fia-teal">{totalIndicatorsFilled}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Indicators Filled</h3>
            <p className="text-sm text-gray-500 mt-1">Total data points</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-fia-navy card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-fia-navy/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-fia-navy" />
              </div>
              <span className="text-3xl font-bold text-fia-navy">{avgCompletionRate}%</span>
            </div>
            <h3 className="text-gray-600 font-medium">Avg Completion</h3>
            <p className="text-sm text-gray-500 mt-1">Overall rate</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Trend */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Your Compliance Trend (6 Months)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="compliance" stroke="#1C3D5A" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Completion Rate */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Completion Rate</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={completionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="rate" fill="#2C7A7B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Submissions Timeline */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Monthly Submissions (Jul - Dec 2024)</h2>
              <button className="btn-outline text-sm flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export History</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {monthlySubmissions.map((submission, index) => {
                // Find actual submission
                const actualSubmission = mySubmissions.find(s => s.month === submission.monthNum && s.year === 2024);
                
                return (
                  <div
                    key={index}
                    className={`border-2 rounded-xl p-6 transition-all ${
                      submission.status === 'submitted' || actualSubmission
                        ? 'border-green-200 bg-green-50'
                        : submission.status === 'overdue'
                        ? 'border-red-200 bg-red-50'
                        : 'border-yellow-200 bg-yellow-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <h3 className="text-xl font-bold text-gray-900">{submission.month}</h3>
                          {getStatusBadge(actualSubmission ? actualSubmission.status : submission.status)}
                          <span className="text-sm text-gray-600">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Due: {new Date(submission.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Indicators:</span>
                            <p className="font-semibold text-gray-900">
                              {actualSubmission ? actualSubmission.totalIndicators : submission.indicators} total
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Filled:</span>
                            <p className="font-semibold text-gray-900">
                              {actualSubmission ? actualSubmission.filledIndicators : submission.filled}/
                              {actualSubmission ? actualSubmission.totalIndicators : submission.indicators}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Completion:</span>
                            <p className="font-semibold text-gray-900">
                              {actualSubmission ? actualSubmission.completionRate : 
                                ((submission.filled / submission.indicators) * 100).toFixed(0)}%
                            </p>
                          </div>
                        </div>

                        {(submission.submittedDate || actualSubmission) && (
                          <p className="text-sm text-gray-600 mt-2">
                            ✅ Submitted on {actualSubmission 
                              ? actualSubmission.submittedAt?.toLocaleDateString() 
                              : new Date(submission.submittedDate!).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      <div className="ml-6">
                        {(submission.status === 'submitted' || actualSubmission) ? (
                          <button 
                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                          >
                            <Eye className="w-5 h-5" />
                            <span>View Details</span>
                          </button>
                        ) : (
                          <button 
                            onClick={() => navigate('/organization/submit')}
                            className="bg-fia-navy hover:bg-fia-navy-light text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                          >
                            <FileText className="w-5 h-5" />
                            <span>Submit Now</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate('/organization/submit')}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-left card-hover border-2 border-transparent hover:border-fia-navy"
          >
            <FileText className="w-12 h-12 text-fia-navy mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Submit Statistics</h3>
            <p className="text-gray-600 text-sm mb-4">Fill out monthly indicators one by one</p>
            <div className="flex items-center text-fia-navy font-semibold">
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </div>
          </button>

          <button
            onClick={() => navigate('/organization/upload')}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-left card-hover border-2 border-transparent hover:border-fia-teal"
          >
            <Upload className="w-12 h-12 text-fia-teal mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Bulk Upload</h3>
            <p className="text-gray-600 text-sm mb-4">Upload Excel file with all indicators</p>
            <div className="flex items-center text-fia-teal font-semibold">
              <span>Upload Now</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </div>
          </button>

          <button
            onClick={() => navigate('/organization/reports')}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-left card-hover border-2 border-transparent hover:border-fia-gold"
          >
            <BarChart3 className="w-12 h-12 text-fia-gold mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">View Reports</h3>
            <p className="text-gray-600 text-sm mb-4">Access your analytics and reports</p>
            <div className="flex items-center text-fia-gold font-semibold">
              <span>View Reports</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </div>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
