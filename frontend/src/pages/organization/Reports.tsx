import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import { 
  FileText, 
  TrendingUp, 
  BarChart3,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Search,
  Filter,
  ArrowLeft,
  X,
  AlertTriangle
} from 'lucide-react';
import { useAppStore } from '../../store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import type { MonthlySubmission } from '../../types';

export default function Reports() {
  const navigate = useNavigate();
  const { currentUser, getSubmissionsByOrg } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [selectedReport, setSelectedReport] = useState<MonthlySubmission | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const org = currentUser?.organization;
  if (!org) return <div>Loading...</div>;

  // Get all submissions for this organization
  const mySubmissions = getSubmissionsByOrg(org.id);

  // Calculate analytics
  const totalSubmissions = mySubmissions.length;
  const submittedReports = mySubmissions.filter(s => s.status === 'submitted' || s.status === 'approved').length;
  const approvedReports = mySubmissions.filter(s => s.status === 'approved').length;
  const rejectedReports = mySubmissions.filter(s => s.status === 'rejected').length;
  const draftReports = mySubmissions.filter(s => s.status === 'draft').length;
  
  const totalIndicatorsFilled = mySubmissions.reduce((sum, s) => sum + s.filledIndicators, 0);
  const averageCompletionRate = totalSubmissions > 0 
    ? Math.round(mySubmissions.reduce((sum, s) => sum + s.completionRate, 0) / totalSubmissions) 
    : 0;

  // Monthly trend data
  const monthlyTrendData = [
    { month: 'Jul', submissions: mySubmissions.filter(s => s.month === 7).length },
    { month: 'Aug', submissions: mySubmissions.filter(s => s.month === 8).length },
    { month: 'Sep', submissions: mySubmissions.filter(s => s.month === 9).length },
    { month: 'Oct', submissions: mySubmissions.filter(s => s.month === 10).length },
    { month: 'Nov', submissions: mySubmissions.filter(s => s.month === 11).length },
    { month: 'Dec', submissions: mySubmissions.filter(s => s.month === 12).length },
  ];

  // Status distribution
  const statusDistribution = [
    { name: 'Submitted', value: submittedReports, color: '#3b82f6' },
    { name: 'Approved', value: approvedReports, color: '#10b981' },
    { name: 'Draft', value: draftReports, color: '#f59e0b' },
    { name: 'Rejected', value: rejectedReports, color: '#ef4444' },
  ].filter(item => item.value > 0);

  // Section breakdown (aggregate all indicators by section)
  const sectionBreakdown = mySubmissions.reduce((acc, submission) => {
    submission.indicators.forEach(indicator => {
      const section = indicator.section;
      if (!acc[section]) {
        acc[section] = { section, total: 0, filled: 0 };
      }
      acc[section].total += 1;
      if (indicator.value) acc[section].filled += 1;
    });
    return acc;
  }, {} as Record<string, { section: string; total: number; filled: number }>);

  const sectionData = Object.values(sectionBreakdown).map(item => ({
    section: `Section ${item.section}`,
    filled: item.filled,
    total: item.total,
    percentage: Math.round((item.filled / item.total) * 100),
  }));

  // Filter submissions
  const filteredSubmissions = mySubmissions.filter(sub => {
    const matchesSearch = 
      sub.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      new Date(sub.year, sub.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    const matchesMonth = filterMonth === 'all' || sub.month.toString() === filterMonth;
    
    return matchesSearch && matchesStatus && matchesMonth;
  });

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { class: string; icon: any; text: string }> = {
      draft: { class: 'badge-info', icon: Clock, text: 'Draft' },
      submitted: { class: 'badge-success', icon: CheckCircle, text: 'Submitted' },
      approved: { class: 'badge-success', icon: CheckCircle, text: 'Approved' },
      rejected: { class: 'badge-danger', icon: XCircle, text: 'Rejected' },
    };
    const badge = badges[status] || badges.draft;
    const Icon = badge.icon;
    return (
      <span className={`badge ${badge.class} flex items-center space-x-1`}>
        <Icon className="w-3 h-3" />
        <span>{badge.text}</span>
      </span>
    );
  };

  const getSectionName = (section: string) => {
    const sections: Record<string, string> = {
      A: 'STRs and SARs',
      B: 'Reporting Entities',
      C: 'Compliance & Supervision',
      D: 'International Cooperation',
      E: 'Training & Capacity',
      F: 'Investigations',
    };
    return sections[section] || section;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/organization/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-fia-navy">Your Reports & Analytics</h1>
              <p className="text-gray-600">{org.name} - Submission History</p>
            </div>
          </div>
          <button className="btn-secondary flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Export All Reports</span>
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 opacity-80" />
              <span className="text-4xl font-bold">{totalSubmissions}</span>
            </div>
            <h3 className="font-semibold">Total Reports</h3>
            <p className="text-sm opacity-80">All time</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 opacity-80" />
              <span className="text-4xl font-bold">{approvedReports}</span>
            </div>
            <h3 className="font-semibold">Approved</h3>
            <p className="text-sm opacity-80">By FIA</p>
          </div>

          <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 opacity-80" />
              <span className="text-4xl font-bold">{submittedReports}</span>
            </div>
            <h3 className="font-semibold">Submitted</h3>
            <p className="text-sm opacity-80">Under review</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-8 h-8 opacity-80" />
              <span className="text-4xl font-bold">{totalIndicatorsFilled}</span>
            </div>
            <h3 className="font-semibold">Indicators</h3>
            <p className="text-sm opacity-80">Total filled</p>
          </div>

          <div className="bg-gradient-to-br from-fia-teal to-fia-navy rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <span className="text-4xl font-bold">{averageCompletionRate}%</span>
            </div>
            <h3 className="font-semibold">Avg Rate</h3>
            <p className="text-sm opacity-80">Completion</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Submissions Trend */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Submissions (6 Months)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="submissions" stroke="#1C3D5A" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Report Status Distribution</h3>
            {statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <p>No data to display</p>
              </div>
            )}
          </div>
        </div>

        {/* Section Performance Breakdown */}
        {sectionData.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Performance by Section</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="section" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="filled" fill="#2C7A7B" name="Filled" radius={[8, 8, 0, 0]} />
                <Bar dataKey="total" fill="#E2E8F0" name="Total" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* All Reports Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">All Your Reports ({filteredSubmissions.length})</h2>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fia-teal"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fia-teal"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fia-teal"
              >
                <option value="all">All Months</option>
                <option value="7">July 2024</option>
                <option value="8">August 2024</option>
                <option value="9">September 2024</option>
                <option value="10">October 2024</option>
                <option value="11">November 2024</option>
                <option value="12">December 2024</option>
              </select>
            </div>
          </div>

          <div className="p-6">
            {filteredSubmissions.length > 0 ? (
              <div className="space-y-4">
                {filteredSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all hover:border-fia-teal"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <h3 className="text-xl font-bold text-gray-900">
                            {new Date(submission.year, submission.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </h3>
                          {getStatusBadge(submission.status)}
                          <span className="text-sm text-gray-500">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Submitted: {submission.submittedAt?.toLocaleDateString() || 'Not submitted'}
                          </span>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Report ID</p>
                            <p className="font-mono font-bold text-gray-900 text-sm">{submission.id}</p>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600">Indicators</p>
                            <p className="font-bold text-blue-600">{submission.filledIndicators}/{submission.totalIndicators}</p>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-sm text-gray-600">Completion</p>
                            <p className="font-bold text-green-600">{submission.completionRate}%</p>
                          </div>
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <p className="text-sm text-gray-600">Submitted By</p>
                            <p className="font-bold text-purple-600 text-sm">{submission.submittedBy}</p>
                          </div>
                        </div>

                        {/* FIA Feedback */}
                        {submission.status === 'approved' && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                              <p className="font-semibold text-green-900">Approved by FIA</p>
                              <p className="text-sm text-green-700">
                                {submission.approvedAt?.toLocaleDateString()} - Report accepted for analysis
                              </p>
                            </div>
                          </div>
                        )}

                        {submission.status === 'rejected' && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                            <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                            <div>
                              <p className="font-semibold text-red-900">Rejected by FIA</p>
                              <p className="text-sm text-red-700">
                                {submission.comments || 'Please review and resubmit with corrections'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="ml-6 flex flex-col space-y-2">
                        <button
                          onClick={() => {
                            setSelectedReport(submission);
                            setShowDetailModal(true);
                          }}
                          className="bg-fia-navy hover:bg-fia-navy-light text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                        >
                          <Eye className="w-5 h-5" />
                          <span>View Details</span>
                        </button>
                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2">
                          <Download className="w-5 h-5" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No reports found</h3>
                <p className="text-gray-600">
                  {mySubmissions.length === 0 
                    ? 'Submit your first report to get started' 
                    : 'Try adjusting your filters'}
                </p>
                {mySubmissions.length === 0 && (
                  <button
                    onClick={() => navigate('/organization/submit')}
                    className="mt-4 btn-primary"
                  >
                    Submit Your First Report
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-fia-navy to-fia-teal p-6 text-white sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Report Details</h2>
                  <p className="text-white/80">
                    {new Date(selectedReport.year, selectedReport.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - 
                    {org.name}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedReport(null);
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="text-3xl font-bold text-gray-900">{selectedReport.totalIndicators}</div>
                  <div className="text-sm text-gray-600 mt-1">Total Indicators</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-600">{selectedReport.filledIndicators}</div>
                  <div className="text-sm text-gray-600 mt-1">Filled</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-600">{selectedReport.completionRate}%</div>
                  <div className="text-sm text-gray-600 mt-1">Completion Rate</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <div className="mb-2">{getStatusBadge(selectedReport.status)}</div>
                  <div className="text-sm text-gray-600">Status</div>
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <h3 className="font-bold text-gray-900 mb-3">Submission Information</h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Report ID:</span>
                    <span className="font-mono font-semibold">{selectedReport.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Submitted By:</span>
                    <span className="font-semibold">{selectedReport.submittedBy}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Submitted At:</span>
                    <span className="font-semibold">{selectedReport.submittedAt?.toLocaleString() || 'N/A'}</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <h3 className="font-bold text-gray-900 mb-3">FIA Review Status</h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-semibold capitalize">{selectedReport.status}</span>
                  </div>
                  {selectedReport.approvedBy && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Reviewed By:</span>
                      <span className="font-semibold">{selectedReport.approvedBy}</span>
                    </div>
                  )}
                  {selectedReport.approvedAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Reviewed At:</span>
                      <span className="font-semibold">{selectedReport.approvedAt.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* FIA Comments */}
              {selectedReport.comments && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-yellow-900 mb-1">FIA Comments</h3>
                      <p className="text-yellow-800">{selectedReport.comments}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Indicators by Section */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4">All Indicators ({selectedReport.indicators.length})</h3>
                
                {/* Group by section */}
                {['A', 'B', 'C', 'D', 'E', 'F'].map(section => {
                  const sectionIndicators = selectedReport.indicators.filter(i => i.section === section);
                  if (sectionIndicators.length === 0) return null;

                  return (
                    <div key={section} className="mb-6">
                      <h4 className="font-bold text-fia-navy mb-3 flex items-center space-x-2">
                        <span className="bg-fia-navy text-white w-8 h-8 rounded-full flex items-center justify-center">
                          {section}
                        </span>
                        <span>Section {section}: {getSectionName(section)}</span>
                      </h4>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left font-bold text-gray-700 w-24">Number</th>
                              <th className="px-4 py-3 text-left font-bold text-gray-700">Description</th>
                              <th className="px-4 py-3 text-left font-bold text-gray-700 w-32">Value</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {sectionIndicators.map((indicator, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-semibold text-fia-navy">{indicator.number}</td>
                                <td className="px-4 py-3 text-gray-700">{indicator.description}</td>
                                <td className="px-4 py-3">
                                  <span className="font-bold text-fia-teal">{indicator.value || '-'}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-6 border-t border-gray-200">
                <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center justify-center space-x-2">
                  <Download className="w-5 h-5" />
                  <span>Download PDF Report</span>
                </button>
                <button className="flex-1 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center justify-center space-x-2">
                  <Download className="w-5 h-5" />
                  <span>Export to Excel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
