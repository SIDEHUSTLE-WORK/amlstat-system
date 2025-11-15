// frontend/src/pages/organization/Settings.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import { 
  User,
  Mail,
  Phone,
  Building2,
  Lock,
  Bell,
  Shield,
  Save,
  ArrowLeft
} from 'lucide-react';
import { useAppStore } from '../../store';
import { authAPI, organizationsAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const navigate = useNavigate();
  const { currentUser } = useAppStore();
  const org = currentUser?.organization;

  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    email: currentUser?.email || '',
    name: currentUser?.name || '',
    phone: org?.phone || '',
    contactPerson: org?.contactPerson || '',
    notifications: {
      email: true,
      deadline: true,
      approval: true,
    },
    password: {
      current: '',
      new: '',
      confirm: '',
    }
  });

  // 🔥 SAVE PROFILE WITH REAL API
  const handleSaveProfile = async () => {
    if (!currentUser?.id) {
      toast.error('User not found');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.updateProfile({
        name: settings.name,
        email: settings.email,
        phone: settings.phone,
      });

      if (response.data.success) {
        toast.success('Profile updated successfully!');
        
        // Update local user data
        // Note: You might want to refresh the user from the store here
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 UPDATE PASSWORD WITH REAL API
  const handleUpdatePassword = async () => {
    if (!settings.password.current || !settings.password.new || !settings.password.confirm) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (settings.password.new !== settings.password.confirm) {
      toast.error('New passwords do not match');
      return;
    }

    if (settings.password.new.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.changePassword(
        settings.password.current,
        settings.password.new
      );

      if (response.data.success) {
        toast.success('Password updated successfully!');
        
        // Clear password fields
        setSettings({
          ...settings,
          password: {
            current: '',
            new: '',
            confirm: '',
          }
        });
      }
    } catch (error: any) {
      console.error('Update password error:', error);
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 UPDATE ORGANIZATION INFO WITH REAL API
  const handleUpdateOrganization = async () => {
    if (!org?.id) {
      toast.error('Organization not found');
      return;
    }

    setIsLoading(true);
    try {
      const response = await organizationsAPI.update(org.id, {
        contactPerson: settings.contactPerson,
        phone: settings.phone,
      });

      if (response.data.success) {
        toast.success('Organization details updated successfully!');
      }
    } catch (error: any) {
      console.error('Update organization error:', error);
      toast.error(error.response?.data?.message || 'Failed to update organization');
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 SAVE NOTIFICATION PREFERENCES
  const handleSaveNotifications = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement notification preferences API endpoint
      // For now, just save to local storage
      localStorage.setItem('notificationPreferences', JSON.stringify(settings.notifications));
      
      toast.success('Notification preferences saved!');
    } catch (error: any) {
      console.error('Save notifications error:', error);
      toast.error('Failed to save notification preferences');
    } finally {
      setIsLoading(false);
    }
  };

  if (!org) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-fia-navy mb-4"></div>
            <p className="text-gray-600 text-lg">Loading settings...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/organization/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-fia-navy">Settings</h1>
            <p className="text-gray-600">Manage your account and preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                    activeTab === 'profile' ? 'bg-fia-navy text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-semibold">Profile</span>
                </button>
                <button
                  onClick={() => setActiveTab('organization')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                    activeTab === 'organization' ? 'bg-fia-navy text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  <span className="font-semibold">Organization</span>
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                    activeTab === 'security' ? 'bg-fia-navy text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span className="font-semibold">Security</span>
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                    activeTab === 'notifications' ? 'bg-fia-navy text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  <span className="font-semibold">Notifications</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="col-span-9">
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Information</h2>
                    <p className="text-gray-600">Update your personal details</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={settings.name}
                        onChange={(e) => setSettings({...settings, name: e.target.value})}
                        className="input-field"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={settings.email}
                        onChange={(e) => setSettings({...settings, email: e.target.value})}
                        className="input-field"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={settings.phone}
                        onChange={(e) => setSettings({...settings, phone: e.target.value})}
                        className="input-field"
                        placeholder="+256 700 000 000"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleSaveProfile} 
                    disabled={isLoading}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}

              {/* Organization Tab */}
              {activeTab === 'organization' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Organization Details</h2>
                    <p className="text-gray-600">Your organization information</p>
                  </div>

                  <div className="bg-gradient-to-br from-fia-navy to-fia-teal rounded-xl p-6 text-white">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-fia-gold text-sm mb-1">Organization Name</p>
                        <p className="text-xl font-bold">{org.name}</p>
                      </div>
                      <div>
                        <p className="text-fia-gold text-sm mb-1">Organization Code</p>
                        <p className="text-xl font-bold">{org.code}</p>
                      </div>
                      <div>
                        <p className="text-fia-gold text-sm mb-1">Type</p>
                        <p className="text-xl font-bold capitalize">{org.type?.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-fia-gold text-sm mb-1">Status</p>
                        <p className="text-xl font-bold">
                          {org.isActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Organization name, code, and type cannot be changed. 
                      Please contact FIA support if you need to update these details.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Contact Person
                      </label>
                      <input
                        type="text"
                        value={settings.contactPerson}
                        onChange={(e) => setSettings({...settings, contactPerson: e.target.value})}
                        className="input-field"
                        placeholder="Primary contact name"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Organization Phone
                      </label>
                      <input
                        type="tel"
                        value={settings.phone}
                        onChange={(e) => setSettings({...settings, phone: e.target.value})}
                        className="input-field"
                        placeholder="+256 700 000 000"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleUpdateOrganization}
                    disabled={isLoading}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Security Settings</h2>
                    <p className="text-gray-600">Change your password</p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Password Requirements:</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• At least 8 characters long</li>
                      <li>• Mix of uppercase and lowercase letters</li>
                      <li>• Include at least one number</li>
                      <li>• Include at least one special character</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={settings.password.current}
                        onChange={(e) => setSettings({...settings, password: {...settings.password, current: e.target.value}})}
                        className="input-field"
                        placeholder="Enter current password"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={settings.password.new}
                        onChange={(e) => setSettings({...settings, password: {...settings.password, new: e.target.value}})}
                        className="input-field"
                        placeholder="Enter new password"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={settings.password.confirm}
                        onChange={(e) => setSettings({...settings, password: {...settings.password, confirm: e.target.value}})}
                        className="input-field"
                        placeholder="Confirm new password"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleUpdatePassword}
                    disabled={isLoading}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Lock className="w-5 h-5" />
                    <span>{isLoading ? 'Updating...' : 'Update Password'}</span>
                  </button>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Notification Preferences</h2>
                    <p className="text-gray-600">Manage how you receive updates</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <h3 className="font-semibold text-gray-900">Email Notifications</h3>
                        <p className="text-sm text-gray-600">Receive updates via email</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.email}
                        onChange={(e) => setSettings({...settings, notifications: {...settings.notifications, email: e.target.checked}})}
                        className="w-6 h-6 text-fia-navy focus:ring-fia-teal rounded"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <h3 className="font-semibold text-gray-900">Deadline Reminders</h3>
                        <p className="text-sm text-gray-600">Get reminded before submission deadlines</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.deadline}
                        onChange={(e) => setSettings({...settings, notifications: {...settings.notifications, deadline: e.target.checked}})}
                        className="w-6 h-6 text-fia-navy focus:ring-fia-teal rounded"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <h3 className="font-semibold text-gray-900">Approval Notifications</h3>
                        <p className="text-sm text-gray-600">Get notified when FIA reviews your submission</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.approval}
                        onChange={(e) => setSettings({...settings, notifications: {...settings.notifications, approval: e.target.checked}})}
                        className="w-6 h-6 text-fia-navy focus:ring-fia-teal rounded"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleSaveNotifications}
                    disabled={isLoading}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    <span>{isLoading ? 'Saving...' : 'Save Preferences'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}