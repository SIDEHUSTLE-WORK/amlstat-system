// frontend/src/pages/admin/components/EditOrganizationModal.tsx
import { useState } from 'react';
import { X, Building2, Mail, Phone, User, Tag, Save, Trash2, Power } from 'lucide-react';
import { useAppStore } from '../../../store';
import { Organization } from '../../../types';
import { organizationsAPI } from '../../../services/api';
import toast from 'react-hot-toast';

interface EditOrganizationModalProps {
  organization: Organization;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditOrganizationModal({ organization, onClose, onSuccess }: EditOrganizationModalProps) {
  const { organizations } = useAppStore();
  
  const [formData, setFormData] = useState({
    code: organization.code,
    name: organization.name,
    type: organization.type,
    email: organization.email,
    phone: organization.phone,
    contactPerson: organization.contactPerson,
    isActive: organization.isActive
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Contact person is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🔥 REAL API UPDATE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await organizationsAPI.update(organization.id, {
        name: formData.name.trim(),
        type: formData.type as any,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        contactPerson: formData.contactPerson.trim(),
        isActive: formData.isActive
      });

      if (response.data.success) {
        toast.success('Organization updated successfully!');
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      console.error('Update organization error:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
        
        if (error.response.data.errors) {
          setErrors(error.response.data.errors);
        }
      } else {
        toast.error('Failed to update organization');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔥 REAL API TOGGLE STATUS
  const handleToggleStatus = async () => {
    const newStatus = !formData.isActive;
    const action = newStatus ? 'activate' : 'deactivate';
    
    if (!window.confirm(`Are you sure you want to ${action} ${organization.name}?`)) {
      return;
    }

    try {
      const response = await organizationsAPI.update(organization.id, {
        isActive: newStatus
      });

      if (response.data.success) {
        setFormData({ ...formData, isActive: newStatus });
        toast.success(`Organization ${action}d successfully!`);
        onSuccess?.();
      }
    } catch (error: any) {
      console.error('Toggle status error:', error);
      toast.error(error.response?.data?.message || `Failed to ${action} organization`);
    }
  };

  // 🔥 REAL API DELETE
  const handleDelete = async () => {
    if (organization.totalSubmissions > 0) {
      toast.error('Cannot delete organization with existing submissions. Deactivate it instead.');
      return;
    }

    setIsDeleting(true);

    try {
      const response = await organizationsAPI.delete(organization.id);

      if (response.data.success) {
        toast.success('Organization deleted successfully!');
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      console.error('Delete organization error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete organization');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-6 text-white sticky top-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Edit Organization</h2>
                <p className="text-white/80 text-sm">{organization.code}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting || isDeleting}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Organization Code (Read-only) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-2" />
              Organization Code
            </label>
            <input
              type="text"
              value={formData.code}
              disabled
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Organization code cannot be changed</p>
          </div>

          {/* Organization Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Building2 className="w-4 h-4 inline mr-2" />
              Organization Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Full organization name"
              disabled={isSubmitting}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Organization Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              disabled={isSubmitting}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="REGULATOR">Regulator</option>
              <option value="MINISTRY">Ministry</option>
              <option value="PROFESSIONAL">Professional Body</option>
              <option value="LAW_ENFORCEMENT">Law Enforcement</option>
              <option value="PROSECUTION">Prosecution</option>
              <option value="INTERNATIONAL">International</option>
              <option value="FIA">FIA</option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="statistics@organization.go.ug"
              disabled={isSubmitting}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+256 414 XXX XXX"
              disabled={isSubmitting}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          {/* Contact Person */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Contact Person *
            </label>
            <input
              type="text"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              placeholder="Name of primary contact"
              disabled={isSubmitting}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                errors.contactPerson ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.contactPerson && <p className="text-red-500 text-sm mt-1">{errors.contactPerson}</p>}
          </div>

          {/* Status Toggle */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Organization Status</p>
                <p className="text-sm text-gray-600">
                  {formData.isActive ? 'Active - Can submit statistics' : 'Inactive - Cannot submit'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={isSubmitting}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
                  formData.isActive
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>{formData.isActive ? 'Active' : 'Inactive'}</span>
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="font-semibold text-blue-900 mb-3">Organization Statistics</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-bold text-blue-700">{organization.totalSubmissions}</p>
                <p className="text-xs text-blue-600">Total Submissions</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{organization.completedSubmissions}</p>
                <p className="text-xs text-green-600">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-fia-navy">{organization.complianceScore}%</p>
                <p className="text-xs text-fia-navy">Compliance</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isSubmitting || isDeleting}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Organization</span>
            </button>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting || isDeleting}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isDeleting}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Delete Organization</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <span className="font-bold">{organization.name}</span>?
                {organization.totalSubmissions > 0 && (
                  <span className="block mt-2 text-red-600 font-semibold">
                    ⚠️ This organization has {organization.totalSubmissions} submissions and cannot be deleted.
                  </span>
                )}
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={organization.totalSubmissions > 0 || isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}