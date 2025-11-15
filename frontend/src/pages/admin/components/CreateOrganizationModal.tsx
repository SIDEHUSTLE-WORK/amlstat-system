// frontend/src/pages/admin/components/CreateOrganizationModal.tsx
import { useState } from 'react';
import { X, Building2, Mail, Phone, User, Tag } from 'lucide-react';
import { useAppStore } from '../../../store';
import { organizationsAPI } from '../../../services/api';
import toast from 'react-hot-toast';

interface CreateOrganizationModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateOrganizationModal({ onClose, onSuccess }: CreateOrganizationModalProps) {
  const { organizations } = useAppStore();
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'REGULATOR',
    email: '',
    phone: '',
    contactPerson: '',
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Code is required';
    } else if (formData.code.length < 2 || formData.code.length > 10) {
      newErrors.code = 'Code must be between 2 and 10 characters';
    } else if (organizations.some(org => org.code === formData.code.toUpperCase())) {
      newErrors.code = 'This code is already in use';
    }

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

  // 🔥 REAL API INTEGRATION
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await organizationsAPI.create({
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        type: formData.type as any,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        contactPerson: formData.contactPerson.trim(),
        isActive: formData.isActive
      });

      if (response.data.success) {
        toast.success('Organization created successfully!');
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      console.error('Create organization error:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
        
        if (error.response.data.errors) {
          setErrors(error.response.data.errors);
        }
      } else {
        toast.error('Failed to create organization');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-teal-600 p-6 text-white sticky top-0 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Create New Organization</h2>
                <p className="text-white/80 text-sm">Add a new reporting entity</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Organization Code */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-2" />
              Organization Code *
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g., BOU, CMA, IRA"
              maxLength={10}
              disabled={isSubmitting}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                errors.code ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
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
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
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
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
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
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
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
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
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
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                errors.contactPerson ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.contactPerson && <p className="text-red-500 text-sm mt-1">{errors.contactPerson}</p>}
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              disabled={isSubmitting}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Set as Active (organization can immediately start submitting)
            </label>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Organization</span>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}