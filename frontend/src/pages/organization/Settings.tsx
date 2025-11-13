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
import toast from 'react-hot-toast';

export default function Settings() {
  const navigate = useNavigate();
  const { currentUser } = useAppStore();
  const org = currentUser?.organization;

  const [activeTab, setActiveTab] = useState('profile');
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

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  if (!org) return <div>Loading...</div>;

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
                      />
                    </div>
                  </div>

                  <button onClick={handleSave} className="btn-primary flex items-center space-x-2">
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
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
                        <p className="text-xl font-bold capitalize">{org.type.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-fia-gold text-sm mb-1">Status</p>
                        <p className="text-xl font-bold">Active</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Person</label>
                      <input
                        type="text"
                        value={settings.contactPerson}
                        onChange={(e) => setSettings({...settings, contactPerson: e.target.value})}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Security Settings</h2>
                    <p className="text-gray-600">Change your password</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                      <input
                        type="password"
                        value={settings.password.current}
                        onChange={(e) => setSettings({...settings, password: {...settings.password, current: e.target.value}})}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                      <input
                        type="password"
                        value={settings.password.new}
                        onChange={(e) => setSettings({...settings, password: {...settings.password, new: e.target.value}})}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={settings.password.confirm}
                        onChange={(e) => setSettings({...settings, password: {...settings.password, confirm: e.target.value}})}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <button onClick={handleSave} className="btn-primary flex items-center space-x-2">
                    <Lock className="w-5 h-5" />
                    <span>Update Password</span>
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
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900">Email Notifications</h3>
                        <p className="text-sm text-gray-600">Receive updates via email</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.email}
                        onChange={(e) => setSettings({...settings, notifications: {...settings.notifications, email: e.target.checked}})}
                        className="w-6 h-6"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900">Deadline Reminders</h3>
                        <p className="text-sm text-gray-600">Get reminded before submission deadlines</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.deadline}
                        onChange={(e) => setSettings({...settings, notifications: {...settings.notifications, deadline: e.target.checked}})}
                        className="w-6 h-6"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900">Approval Notifications</h3>
                        <p className="text-sm text-gray-600">Get notified when FIA reviews your submission</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.approval}
                        onChange={(e) => setSettings({...settings, notifications: {...settings.notifications, approval: e.target.checked}})}
                        className="w-6 h-6"
                      />
                    </div>
                  </div>

                  <button onClick={handleSave} className="btn-primary flex items-center space-x-2">
                    <Save className="w-5 h-5" />
                    <span>Save Preferences</span>
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
