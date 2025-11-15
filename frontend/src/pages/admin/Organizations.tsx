// frontend/src/pages/admin/Organizations.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import { 
  Building2, 
  Plus, 
  Grid3x3, 
  List, 
  Search,
  Filter,
  Download,
  Upload,
  Trash2,
  Edit,
  Users,
  Activity,
  MoreVertical,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { useAppStore, getOrgTheme } from '../../store';
import CreateOrganizationModal from './components/CreateOrganizationModal';
import EditOrganizationModal from './components/EditOrganizationModal';
import UserManagementModal from './components/UserManagementModal';
import BulkOperations from './components/BulkOperations';
import { Organization } from '../../types';
import { organizationsAPI, adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

type ViewMode = 'grid' | 'table';
type FilterType = 'all' | 'active' | 'inactive' | 'regulator' | 'ministry' | 'professional' | 'law_enforcement';

export default function Organizations() {
  const navigate = useNavigate();
  const { organizations, fetchOrganizations, setLoading: setStoreLoading } = useAppStore();
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [managingUsersOrg, setManagingUsersOrg] = useState<Organization | null>(null);
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 🔥 FETCH ORGANIZATIONS ON MOUNT
  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    setIsLoading(true);
    try {
      await fetchOrganizations();
    } catch (error) {
      console.error('Failed to load organizations:', error);
      toast.error('Failed to load organizations');
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 REFRESH ORGANIZATIONS
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchOrganizations();
      toast.success('Organizations refreshed!');
    } catch (error) {
      console.error('Refresh failed:', error);
      toast.error('Failed to refresh');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter and search organizations
  const filteredOrganizations = organizations.filter(org => {
    // Search filter
    const matchesSearch = 
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Type filter
    let matchesType = true;
    if (filterType === 'active') matchesType = org.isActive;
    else if (filterType === 'inactive') matchesType = !org.isActive;
    else if (filterType !== 'all') {
      matchesType = org.type === filterType as any;
      
    }

    return matchesSearch && matchesType;
  });

  // Toggle selection
  const toggleSelection = (orgId: string) => {
    setSelectedOrgs(prev => 
      prev.includes(orgId) 
        ? prev.filter(id => id !== orgId)
        : [...prev, orgId]
    );
  };

  // Select all
  const toggleSelectAll = () => {
    if (selectedOrgs.length === filteredOrganizations.length) {
      setSelectedOrgs([]);
    } else {
      setSelectedOrgs(filteredOrganizations.map(org => org.id));
    }
  };

  // 🔥 EXPORT ORGANIZATIONS WITH REAL API
  const exportOrganizations = async () => {
    setIsExporting(true);
    toast.loading('Preparing export...');
    
    try {
      const response = await adminAPI.exportData({ 
        format: 'csv',
        type: 'organizations'
      });

      if (response.data.success) {
        // Create CSV from data
        const exportData = filteredOrganizations.map(org => ({
          Code: org.code,
          Name: org.name,
          Type: org.type,
          Email: org.email,
          Phone: org.phone,
          'Contact Person': org.contactPerson,
          Status: org.isActive ? 'Active' : 'Inactive',
          'Compliance Score': `${org.complianceScore}%`,
          'Total Submissions': org.totalSubmissions
        }));

        const csv = [
          Object.keys(exportData[0]).join(','),
          ...exportData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `organizations_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        toast.dismiss();
        toast.success('Organizations exported successfully!');
      }
    } catch (error: any) {
      console.error('Export error:', error);
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to export organizations');
    } finally {
      setIsExporting(false);
    }
  };

  // 🔥 HANDLE MODAL CALLBACKS
  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    loadOrganizations(); // Refresh list
    toast.success('Organization created successfully!');
  };

  const handleEditSuccess = () => {
    setEditingOrg(null);
    loadOrganizations(); // Refresh list
    toast.success('Organization updated successfully!');
  };

  const handleBulkSuccess = () => {
    setShowBulkMenu(false);
    setSelectedOrgs([]);
    loadOrganizations(); // Refresh list
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-fia-navy mb-2">Organizations</h1>
            <p className="text-gray-600">
              Manage {organizations.length} reporting entities
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Organization</span>
            </button>
          </div>
        </div>

        {/* Filters & Actions Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search organizations..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fia-teal focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fia-teal"
              >
                <option value="all">All Types</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
                <option value="regulator">Regulators</option>
                <option value="ministry">Ministries</option>
                <option value="professional">Professional Bodies</option>
                <option value="law_enforcement">Law Enforcement</option>
              </select>

              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${
                    viewMode === 'grid' 
                      ? 'bg-white shadow-sm text-fia-navy' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded ${
                    viewMode === 'table' 
                      ? 'bg-white shadow-sm text-fia-navy' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Export */}
              <button
                onClick={exportOrganizations}
                disabled={isExporting}
                className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                <span>{isExporting ? 'Exporting...' : 'Export'}</span>
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedOrgs.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedOrgs.length === filteredOrganizations.length}
                    onChange={toggleSelectAll}
                    className="rounded text-fia-teal focus:ring-fia-teal"
                  />
                  <span className="font-semibold text-gray-900">
                    {selectedOrgs.length} selected
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowBulkMenu(true)}
                    className="px-4 py-2 bg-fia-navy text-white rounded-lg font-semibold hover:bg-fia-navy-dark"
                  >
                    Bulk Actions
                  </button>
                  <button
                    onClick={() => setSelectedOrgs([])}
                    className="px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Building2 className="w-8 h-8 text-blue-500" />
              <span className="text-3xl font-bold text-blue-500">{organizations.length}</span>
            </div>
            <p className="text-gray-600 font-medium">Total Organizations</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <span className="text-3xl font-bold text-green-500">
                {organizations.filter(o => o.isActive).length}
              </span>
            </div>
            <p className="text-gray-600 font-medium">Active</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-8 h-8 text-red-500" />
              <span className="text-3xl font-bold text-red-500">
                {organizations.filter(o => !o.isActive).length}
              </span>
            </div>
            <p className="text-gray-600 font-medium">Inactive</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-purple-500" />
              <span className="text-3xl font-bold text-purple-500">
                {organizations.length > 0 
                  ? Math.round(organizations.reduce((sum, org) => sum + org.complianceScore, 0) / organizations.length)
                  : 0
                }%
              </span>
            </div>
            <p className="text-gray-600 font-medium">Avg Compliance</p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <RefreshCw className="w-16 h-16 text-fia-teal animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Loading organizations...</h3>
            <p className="text-gray-600">Please wait</p>
          </div>
        )}

        {/* Organizations Display */}
        {!isLoading && (
          <>
            {viewMode === 'grid' ? (
              // GRID VIEW
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrganizations.map(org => {
                  const theme = getOrgTheme(org.code);
                  const isSelected = selectedOrgs.includes(org.id);

                  return (
                    <div
                      key={org.id}
                      className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl ${
                        isSelected ? 'ring-4 ring-fia-teal' : ''
                      }`}
                    >
                      {/* Card Header */}
                      <div className={`bg-gradient-to-r ${theme.gradient} p-6 text-white`}>
                        <div className="flex items-start justify-between mb-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelection(org.id)}
                            className="rounded text-white focus:ring-white"
                            onClick={(e) => e.stopPropagation()}
                          />
                          
                          <div className="relative">
                            <button
                              onClick={() => setActionMenuOpen(actionMenuOpen === org.id ? null : org.id)}
                              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>

                            {actionMenuOpen === org.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                                <button
                                  onClick={() => {
                                    navigate(`/admin/organizations/${org.id}`);
                                    setActionMenuOpen(null);
                                  }}
                                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-2 text-gray-700"
                                >
                                  <Activity className="w-4 h-4" />
                                  <span>View Details</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingOrg(org);
                                    setActionMenuOpen(null);
                                  }}
                                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-2 text-gray-700"
                                >
                                  <Edit className="w-4 h-4" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setManagingUsersOrg(org);
                                    setActionMenuOpen(null);
                                  }}
                                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-2 text-gray-700"
                                >
                                  <Users className="w-4 h-4" />
                                  <span>Manage Users</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <h3 className="text-2xl font-bold mb-1">{org.code}</h3>
                        <p className="text-white/90 text-sm">{org.name}</p>
                      </div>

                      {/* Card Body */}
                      <div className="p-6 space-y-4">
                        {/* Status Badge */}
                        <div className="flex items-center justify-between">
                          <span className={`badge ${org.isActive ? 'badge-success' : 'badge-danger'}`}>
                            {org.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className="badge badge-info capitalize">
                            {org.type.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{org.email}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{org.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>{org.contactPerson}</span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{org.totalSubmissions}</p>
                            <p className="text-xs text-gray-500">Submissions</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{org.completedSubmissions}</p>
                            <p className="text-xs text-gray-500">Completed</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-fia-navy">{org.complianceScore}%</p>
                            <p className="text-xs text-gray-500">Compliance</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2 pt-4">
                          <button
                            onClick={() => navigate(`/admin/organizations/${org.id}`)}
                            className="flex-1 px-4 py-2 bg-fia-navy text-white rounded-lg font-semibold hover:bg-fia-navy-dark transition-colors"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => setEditingOrg(org)}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // TABLE VIEW
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left">
                          <input
                            type="checkbox"
                            checked={selectedOrgs.length === filteredOrganizations.length && filteredOrganizations.length > 0}
                            onChange={toggleSelectAll}
                            className="rounded text-fia-teal focus:ring-fia-teal"
                          />
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Code</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Organization</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Type</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Contact</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">Submissions</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">Compliance</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">Status</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredOrganizations.map(org => {
                        const theme = getOrgTheme(org.code);
                        const isSelected = selectedOrgs.includes(org.id);

                        return (
                          <tr 
                            key={org.id} 
                            className={`hover:bg-gray-50 transition-colors ${
                              isSelected ? 'bg-blue-50' : ''
                            }`}
                          >
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelection(org.id)}
                                className="rounded text-fia-teal focus:ring-fia-teal"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <span className={`font-bold text-lg px-3 py-1 rounded bg-gradient-to-r ${theme.gradient} text-white`}>
                                {org.code}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-bold text-gray-900">{org.name}</p>
                              <p className="text-sm text-gray-500">{org.contactPerson}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="badge badge-info capitalize">
                                {org.type.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-900">{org.email}</p>
                              <p className="text-sm text-gray-500">{org.phone}</p>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <p className="text-2xl font-bold text-gray-900">{org.totalSubmissions}</p>
                              <p className="text-xs text-green-600">{org.completedSubmissions} completed</p>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <div className="w-16 h-16 rounded-full border-4 border-gray-200 flex items-center justify-center relative">
                                  <svg className="absolute top-0 left-0 w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                                    <circle
                                      cx="32"
                                      cy="32"
                                      r="28"
                                      fill="none"
                                      stroke={
                                        org.complianceScore >= 90 ? '#10b981' :
                                        org.complianceScore >= 70 ? '#3b82f6' :
                                        org.complianceScore >= 50 ? '#f59e0b' :
                                        '#ef4444'
                                      }
                                      strokeWidth="4"
                                      strokeDasharray={`${org.complianceScore * 1.76} 176`}
                                    />
                                  </svg>
                                  <span className="text-lg font-bold">{org.complianceScore}%</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`badge ${org.isActive ? 'badge-success' : 'badge-danger'}`}>
                                {org.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => navigate(`/admin/organizations/${org.id}`)}
                                  className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <Activity className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => setEditingOrg(org)}
                                  className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => setManagingUsersOrg(org)}
                                  className="p-2 hover:bg-purple-50 text-purple-600 rounded-lg transition-colors"
                                  title="Manage Users"
                                >
                                  <Users className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* No Results */}
            {filteredOrganizations.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No organizations found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateOrganizationModal 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={handleCreateSuccess}
        />
      )}

      {editingOrg && (
        <EditOrganizationModal
          organization={editingOrg}
          onClose={() => setEditingOrg(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {managingUsersOrg && (
        <UserManagementModal
          organization={managingUsersOrg}
          onClose={() => setManagingUsersOrg(null)}
        />
      )}

      {showBulkMenu && (
        <BulkOperations
          selectedOrgs={selectedOrgs}
          onClose={() => {
            setShowBulkMenu(false);
            setSelectedOrgs([]);
          }}
          onSuccess={handleBulkSuccess}
        />
      )}
    </DashboardLayout>
  );
}