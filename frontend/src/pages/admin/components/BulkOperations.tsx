// frontend/src/pages/admin/components/BulkOperations.tsx
import { useState } from 'react';
import { X, Power, Trash2, Mail, Download, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../../../store';
import { organizationsAPI } from '../../../services/api';
import toast from 'react-hot-toast';

interface BulkOperationsProps {
  selectedOrgs: string[];
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BulkOperations({ selectedOrgs, onClose, onSuccess }: BulkOperationsProps) {
  const { organizations } = useAppStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [action, setAction] = useState<'activate' | 'deactivate' | 'delete' | 'email' | 'export' | null>(null);

  const selectedOrgsList = organizations.filter(org => selectedOrgs.includes(org.id));

  // 🔥 REAL API BULK ACTIVATE
  const handleActivate = async () => {
    if (!window.confirm(`Are you sure you want to activate ${selectedOrgs.length} organization(s)?`)) {
      return;
    }

    setAction('activate');
    setIsProcessing(true);

    try {
      const response = await organizationsAPI.bulkUpdate(selectedOrgs, { isActive: true });

      if (response.data.success) {
        toast.success(`${selectedOrgs.length} organization(s) activated successfully!`);
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      console.error('Bulk activate error:', error);
      toast.error(error.response?.data?.message || 'Failed to activate organizations');
    } finally {
      setIsProcessing(false);
      setAction(null);
    }
  };

  // 🔥 REAL API BULK DEACTIVATE
  const handleDeactivate = async () => {
    if (!window.confirm(`Are you sure you want to deactivate ${selectedOrgs.length} organization(s)?`)) {
      return;
    }

    setAction('deactivate');
    setIsProcessing(true);

    try {
      const response = await organizationsAPI.bulkUpdate(selectedOrgs, { isActive: false });

      if (response.data.success) {
        toast.success(`${selectedOrgs.length} organization(s) deactivated successfully!`);
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      console.error('Bulk deactivate error:', error);
      toast.error(error.response?.data?.message || 'Failed to deactivate organizations');
    } finally {
      setIsProcessing(false);
      setAction(null);
    }
  };

  // 🔥 REAL API BULK DELETE
  const handleDelete = async () => {
    const hasSubmissions = selectedOrgsList.some(org => org.totalSubmissions > 0);
    
    if (hasSubmissions) {
      toast.error('Cannot delete organizations with existing submissions');
      return;
    }

    if (!window.confirm(`⚠️ Are you sure you want to DELETE ${selectedOrgs.length} organization(s)? This action CANNOT be undone!`)) {
      return;
    }

    setAction('delete');
    setIsProcessing(true);

    try {
      const response = await organizationsAPI.bulkDelete(selectedOrgs);

      if (response.data.success) {
        toast.success(`${selectedOrgs.length} organization(s) deleted successfully!`);
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      console.error('Bulk delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete organizations');
    } finally {
      setIsProcessing(false);
      setAction(null);
    }
  };

  // Export as CSV
  const handleExport = () => {
    const exportData = selectedOrgsList.map(org => ({
      Code: org.code,
      Name: org.name,
      Type: org.type,
      Email: org.email,
      Phone: org.phone,
      'Contact Person': org.contactPerson,
      Status: org.isActive ? 'Active' : 'Inactive',
      'Compliance Score': `${org.complianceScore}%`
    }));

    const csv = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selected_organizations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Organizations exported successfully!');
  };

  // Send Email
  const handleSendEmail = () => {
    const emails = selectedOrgsList.map(org => org.email).join(', ');
    toast.success(`Email composer would open with: ${emails}`);
    // In production, this would open an email composer or trigger backend email
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Bulk Operations</h2>
              <p className="text-white/80 text-sm">{selectedOrgs.length} organization(s) selected</p>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Selected Organizations Preview */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 mb-3">Selected Organizations:</h3>
          <div className="flex flex-wrap gap-2">
            {selectedOrgsList.slice(0, 10).map(org => (
              <span key={org.id} className="badge badge-info">
                {org.code}
              </span>
            ))}
            {selectedOrgsList.length > 10 && (
              <span className="badge badge-secondary">
                +{selectedOrgsList.length - 10} more
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 space-y-3">
          <h3 className="font-bold text-gray-900 mb-4">Choose an action:</h3>

          {/* Activate */}
          <button
            onClick={handleActivate}
            disabled={isProcessing}
            className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Power className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Activate Organizations</p>
                <p className="text-sm text-gray-600">Enable submissions for selected organizations</p>
              </div>
            </div>
            {action === 'activate' && isProcessing && (
              <div className="animate-spin w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full" />
            )}
          </button>

          {/* Deactivate */}
          <button
            onClick={handleDeactivate}
            disabled={isProcessing}
            className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Power className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Deactivate Organizations</p>
                <p className="text-sm text-gray-600">Disable submissions for selected organizations</p>
              </div>
            </div>
            {action === 'deactivate' && isProcessing && (
              <div className="animate-spin w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full" />
            )}
          </button>

          {/* Send Email */}
          <button
            onClick={handleSendEmail}
            disabled={isProcessing}
            className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Send Email</p>
                <p className="text-sm text-gray-600">Compose message to selected organizations</p>
              </div>
            </div>
          </button>

          {/* Export */}
          <button
            onClick={handleExport}
            disabled={isProcessing}
            className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Export Selection</p>
                <p className="text-sm text-gray-600">Download selected organizations as CSV</p>
              </div>
            </div>
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            disabled={isProcessing || selectedOrgsList.some(org => org.totalSubmissions > 0)}
            className="w-full flex items-center justify-between p-4 border-2 border-red-200 rounded-lg hover:border-red-600 hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Delete Organizations</p>
                <p className="text-sm text-gray-600">
                  {selectedOrgsList.some(org => org.totalSubmissions > 0)
                    ? '⚠️ Cannot delete organizations with submissions'
                    : 'Permanently remove selected organizations'
                  }
                </p>
              </div>
            </div>
            {action === 'delete' && isProcessing && (
              <div className="animate-spin w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full" />
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-full px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-white transition-colors disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}