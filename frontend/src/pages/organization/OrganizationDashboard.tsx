// frontend/src/pages/organization/OrganizationDashboard.tsx
import { useState, useEffect } from 'react';
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
  const { 
    currentUser, 
    getSubmissionsByOrg,
    fetchSubmissionsByOrg,
    fetchDashboardStats,
    isLoadingSubmissions,
    dashboardStats
  } = useAppStore();
  
  const org = currentUser?.organization;

  // 🔥 FETCH REAL DATA ON MOUNT
  useEffect(() => {
    if (org?.id) {
      fetchSubmissionsByOrg(org.id);
      fetchDashboardStats();
    }
  }, [org?.id, fetchSubmissionsByOrg, fetchDashboardStats]);

  if (!org) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-fia-navy mb-4"></div>
            <p className="text-gray-600 text-lg">Loading organization...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Get submissions for this organization
  const mySubmissions = getSubmissionsByOrg(org.id);
  
  // Calculate stats
  const submittedCount = mySubmissions.filter(s => 
    s.status === 'SUBMITTED' || s.status === 'APPROVED' || s.status === 'UNDER_REVIEW'
  ).length;
  const draftCount = mySubmissions.filter(s => s.status === 'DRAFT').length;
  const approvedCount = mySubmissions.filter(s => s.status === 'APPROVED').length;
  
  // Calculate total indicators
  const totalIndicatorsFilled = mySubmissions.reduce((sum, s) => sum + (s.filledIndicators || 0), 0);
  const totalIndicatorsExpected = mySubmissions.reduce((sum, s) => sum + (s.totalIndicators || 0), 0);
  const avgCompletionRate = totalIndicatorsExpected > 0 
    ? Math.round((totalIndicatorsFilled / totalIndicatorsExpected) * 100) 
    : 0;

  // Get current date info
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();

  // Check if current month has been submitted
  const currentMonthSubmission = mySubmissions.find(
    s => s.month === currentMonth && s.year === currentYear
  );

  // Monthly submissions data (last 6 months)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(currentYear, currentMonth - 6 + i, 1);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const submission = mySubmissions.find(s => s.month === month && s.year === year);
    
    return {
      month: monthNames[date.getMonth()],
      monthNum: month,
      year: year,
      compliance: submission ? submission.completionRate : 0,
      rate: submission ? submission.completionRate : 0,
      hasSubmission: !!submission,
      status: submission?.status || 'PENDING'
    };
  });

  // Performance trend
  const performanceTrend = last6Months;
  const completionData = last6Months;

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { class: string; icon: any; text: string }> = {
      SUBMITTED: { class: 'badge-info', icon: Clock, text: 'Submitted' },
      APPROVED: { class: 'badge-success', icon: CheckCircle, text: 'Approved' },
      PENDING: { class: 'badge-warning', icon: Clock, text: 'Pending' },
      DRAFT: { class: 'badge-info', icon: FileText, text: 'Draft' },
      REJECTED: { class: 'badge-danger', icon: AlertTriangle, text: 'Rejected' },
      UNDER_REVIEW: { class: 'badge-info', icon: Clock, text: 'Under Review' },
    };
    const badge = badges[status] || badges.PENDING;
    const Icon = badge.icon;
    return (
      <span className={`badge ${badge.class} flex items-center space-x-1`}>
        <Icon className="w-3 h-3" />
        <span>{badge.text}</span>
      </span>
    );
  };

  // 🔥 LOADING STATE
  if (isLoadingSubmissions) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-fia-navy mb-4"></div>
            <p className="text-gray-600 text-lg">Loading your submissions...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
              <p className="text-2xl font-bold capitalize">{org.type?.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-fia-gold text-sm font-semibold mb-1">Compliance Score</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold">{org.complianceScore || 0}%</p>
                {(org.complianceScore || 0) >= 90 ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                )}
              </div>
            </div>
            <div>
              <p className="text-fia-gold text-sm font-semibold mb-1">Your Submissions</p>
              <p className="text-2xl font-bold">{approvedCount}/{mySubmissions.length}</p>
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
        {!currentMonthSubmission && dashboardStats && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-xl p-6 shadow-lg">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-yellow-900 mb-2">
                  {dashboardStats.currentMonth} Statistics Due!
                </h3>
                <p className="text-yellow-800 mb-4">
                  Your monthly statistics for {dashboardStats.currentMonth} are due soon. 
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

        {/* Success message if current month submitted */}
        {currentMonthSubmission && (
          <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-6 shadow-lg">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-green-900 mb-2">
                  {monthNames[currentMonth - 1]} {currentYear} Statistics Submitted! ✅
                </h3>
                <p className="text-green-800 mb-2">
                  Your statistics were successfully submitted
                  {currentMonthSubmission.submittedAt && ` on ${new Date(currentMonthSubmission.submittedAt).toLocaleDateString()}`}.
                </p>
                <p className="text-green-700 text-sm">
                  <strong>Status:</strong> {currentMonthSubmission.status} | 
                  <strong> Completion Rate:</strong> {currentMonthSubmission.completionRate}% 
                  ({currentMonthSubmission.filledIndicators}/{currentMonthSubmission.totalIndicators} indicators filled)
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
              <span className="text-3xl font-bold text-green-500">{approvedCount}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Approved</h3>
            <p className="text-sm text-gray-500 mt-1">Months approved</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500 card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-3xl font-bold text-blue-500">{submittedCount}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Submitted</h3>
            <p className="text-sm text-gray-500 mt-1">Awaiting review</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-yellow-500 card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <FileText className="w-6 h-6 text-yellow-500" />
              </div>
              <span className="text-3xl font-bold text-yellow-500">{draftCount}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Drafts</h3>
            <p className="text-sm text-gray-500 mt-1">In progress</p>
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
        {mySubmissions.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trend */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Your Compliance Trend (Last 6 Months)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="compliance" 
                    stroke="#1C3D5A" 
                    strokeWidth={3} 
                    dot={{ r: 5 }} 
                    name="Completion Rate"
                  />
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
                  <Bar dataKey="rate" fill="#2C7A7B" radius={[8, 8, 0, 0]} name="Completion %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 shadow-lg text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Submissions Yet</h3>
            <p className="text-gray-600 mb-6">Your charts will appear here once you start submitting statistics.</p>
            <button 
              onClick={() => navigate('/organization/submit')}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <FileText className="w-5 h-5" />
              <span>Submit Your First Statistics</span>
            </button>
          </div>
        )}

        {/* 🔥 SUBMISSIONS HISTORY - COMPLETE WITH REVIEW NOTES */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Your Submissions History</h2>
              <button className="btn-outline text-sm flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export History</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {mySubmissions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Submissions Yet</h3>
                <p className="text-gray-600 mb-6">Start by submitting your monthly statistics.</p>
                <div className="flex justify-center space-x-3">
                  <button 
                    onClick={() => navigate('/organization/submit')}
                    className="btn-primary"
                  >
                    Submit Statistics
                  </button>
                  <button 
                    onClick={() => navigate('/organization/upload')}
                    className="btn-secondary"
                  >
                    Upload Excel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {mySubmissions
                  .sort((a, b) => b.year - a.year || b.month - a.month)
                  .map((submission) => (
                    <div
                      key={submission.id}
                      className={`border-2 rounded-xl p-6 transition-all ${
                        submission.status === 'APPROVED'
                          ? 'border-green-200 bg-green-50'
                          : submission.status === 'REJECTED'
                          ? 'border-red-200 bg-red-50'
                          : submission.status === 'SUBMITTED' || submission.status === 'UNDER_REVIEW'
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-yellow-200 bg-yellow-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-3">
                            <h3 className="text-xl font-bold text-gray-900">
                              {monthNames[submission.month - 1]} {submission.year}
                            </h3>
                            {getStatusBadge(submission.status)}
                            {submission.submittedAt && (
                              <span className="text-sm text-gray-600">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Indicators:</span>
                              <p className="font-semibold text-gray-900">{submission.totalIndicators} total</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Filled:</span>
                              <p className="font-semibold text-gray-900">
                                {submission.filledIndicators}/{submission.totalIndicators}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">Completion:</span>
                              <p className="font-semibold text-gray-900">{submission.completionRate}%</p>
                            </div>
                          </div>

                          {/* 🔥 REVIEW NOTES DISPLAY */}
                          {submission.reviewNotes && (
                            <div className="mt-3 p-3 bg-white/50 rounded-lg">
                              <p className="text-sm font-semibold text-gray-700">Review Notes:</p>
                              <p className="text-sm text-gray-600 mt-1">{submission.reviewNotes}</p>
                            </div>
                          )}
                        </div>

                        <div className="ml-6">
                          <button 
                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                          >
                            <Eye className="w-5 h-5" />
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
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