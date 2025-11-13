// src/pages/admin/AdminSettings.tsx
import { useState } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { 
  Settings as SettingsIcon, 
  Bell, 
  User, 
  Shield, 
  Database,
  Download,
  FileText,
  Key,
  Mail,
  Zap,
  AlertCircle,
  CheckCircle,
  Server,
  HardDrive,
  RefreshCw,
  Clock,
  Users,
  BarChart,
  Lock,
  Unlock,
  Eye,
  X,
  Search,
  Filter
} from 'lucide-react';
import { useAppStore } from '../../store';
import toast from 'react-hot-toast';

type AuditLog = {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  details: string;
  ipAddress: string;
  status: 'success' | 'failed';
};

export default function AdminSettings() {
  const { currentUser } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  
  // Profile state
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    email: true,
    submissions: true,
    overdue: true,
    system: true,
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  // System preferences
  const [systemPrefs, setSystemPrefs] = useState({
    timezone: 'EAT',
    dateFormat: 'DD/MM/YYYY',
    maintenanceMode: false,
    autoBackup: true,
  });

  // Mock Audit Logs
  const [auditLogs] = useState<AuditLog[]>([
    {
      id: '1',
      timestamp: new Date('2024-12-13T10:30:00'),
      user: 'Admin User',
      action: 'User Login',
      details: 'Successful admin login',
      ipAddress: '192.168.1.100',
      status: 'success'
    },
    {
      id: '2',
      timestamp: new Date('2024-12-13T09:15:00'),
      user: 'Admin User',
      action: 'Organization Created',
      details: 'Created new organization: Bank of Uganda',
      ipAddress: '192.168.1.100',
      status: 'success'
    },
    {
      id: '3',
      timestamp: new Date('2024-12-13T08:45:00'),
      user: 'System',
      action: 'Auto Backup',
      details: 'Database backup completed successfully',
      ipAddress: 'System',
      status: 'success'
    },
    {
      id: '4',
      timestamp: new Date('2024-12-12T16:20:00'),
      user: 'Admin User',
      action: 'Failed Login Attempt',
      details: 'Invalid password attempt',
      ipAddress: '192.168.1.105',
      status: 'failed'
    },
    {
      id: '5',
      timestamp: new Date('2024-12-12T14:10:00'),
      user: 'Admin User',
      action: 'Submission Approved',
      details: 'Approved December 2024 submission for FIA',
      ipAddress: '192.168.1.100',
      status: 'success'
    },
  ]);

  // Export Data Handler
  const handleExportData = async (type: 'json' | 'csv' | 'excel') => {
    setLoading(true);
    toast.loading('Preparing export...');
    
    try {
      // Simulate export preparation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real app, this would call API
      const data = {
        organizations: 17,
        submissions: 204,
        users: 45,
        exportDate: new Date().toISOString(),
        exportedBy: currentUser?.name,
      };
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fia-system-export-${new Date().toISOString().split('T')[0]}.${type}`;
      link.click();
      
      toast.dismiss();
      toast.success(`Data exported successfully as ${type.toUpperCase()}!`);
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  // Backup Handler
  const handleBackup = async () => {
    setLoading(true);
    toast.loading('Creating system backup...');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.dismiss();
      toast.success('System backup created successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('Backup failed');
    } finally {
      setLoading(false);
    }
  };

  // Password Update
  const handlePasswordUpdate = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast.error('Passwords do not match!');
      return;
    }

    if (passwordData.new.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password updated successfully!');
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  // Profile Save
  const handleProfileSave = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Filter audit logs
  const filteredAuditLogs = auditLogs.filter(log => 
    log.user.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
    log.action.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
    log.details.toLowerCase().includes(auditSearchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-fia-navy mb-2">Admin Settings</h1>
            <p className="text-gray-600">Manage system settings and configurations</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-semibold flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>System Healthy</span>
            </span>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="bg-gradient-to-r from-fia-navy to-fia-teal rounded-xl p-6 text-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => handleExportData('json')}
              disabled={loading}
              className="flex flex-col items-center space-y-2 p-4 bg-white/20 hover:bg-white/30 rounded-lg transition-all transform hover:scale-105"
            >
              <Download className="w-8 h-8" />
              <span className="font-semibold">Export Data</span>
            </button>
            
            <button
              onClick={() => setShowAuditLogs(true)}
              className="flex flex-col items-center space-y-2 p-4 bg-white/20 hover:bg-white/30 rounded-lg transition-all transform hover:scale-105"
            >
              <FileText className="w-8 h-8" />
              <span className="font-semibold">Audit Logs</span>
            </button>
            
            <button
              onClick={handleBackup}
              disabled={loading}
              className="flex flex-col items-center space-y-2 p-4 bg-white/20 hover:bg-white/30 rounded-lg transition-all transform hover:scale-105"
            >
              <HardDrive className="w-8 h-8" />
              <span className="font-semibold">Backup Now</span>
            </button>
            
            <button
              onClick={() => setShowApiKeys(true)}
              className="flex flex-col items-center space-y-2 p-4 bg-white/20 hover:bg-white/30 rounded-lg transition-all transform hover:scale-105"
            >
              <Key className="w-8 h-8" />
              <span className="font-semibold">API Keys</span>
            </button>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Profile Settings */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-fia-teal/10 rounded-lg">
                <User className="w-6 h-6 text-fia-teal" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Profile Settings</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="input-field"
                  placeholder="Admin Name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="input-field"
                  placeholder="admin@fia.ug"
                />
              </div>

              <button 
                onClick={handleProfileSave}
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Bell className="w-6 h-6 text-blue-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-700">Email Notifications</span>
                <input 
                  type="checkbox" 
                  checked={notifications.email}
                  onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                  className="w-5 h-5 rounded text-fia-teal focus:ring-fia-teal" 
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-700">Submission Alerts</span>
                <input 
                  type="checkbox" 
                  checked={notifications.submissions}
                  onChange={(e) => setNotifications({ ...notifications, submissions: e.target.checked })}
                  className="w-5 h-5 rounded text-fia-teal focus:ring-fia-teal" 
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-700">Overdue Reminders</span>
                <input 
                  type="checkbox" 
                  checked={notifications.overdue}
                  onChange={(e) => setNotifications({ ...notifications, overdue: e.target.checked })}
                  className="w-5 h-5 rounded text-fia-teal focus:ring-fia-teal" 
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-700">System Alerts</span>
                <input 
                  type="checkbox" 
                  checked={notifications.system}
                  onChange={(e) => setNotifications({ ...notifications, system: e.target.checked })}
                  className="w-5 h-5 rounded text-fia-teal focus:ring-fia-teal" 
                />
              </label>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-red-50 rounded-lg">
                <Shield className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Security</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>

              <button 
                onClick={handlePasswordUpdate}
                disabled={loading || !passwordData.current || !passwordData.new}
                className="btn-primary w-full"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Database className="w-6 h-6 text-purple-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">System</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">System Timezone</label>
                <select 
                  value={systemPrefs.timezone}
                  onChange={(e) => setSystemPrefs({ ...systemPrefs, timezone: e.target.value })}
                  className="input-field"
                >
                  <option value="EAT">East Africa Time (EAT)</option>
                  <option value="UTC">UTC</option>
                  <option value="GMT">GMT</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date Format</label>
                <select 
                  value={systemPrefs.dateFormat}
                  onChange={(e) => setSystemPrefs({ ...systemPrefs, dateFormat: e.target.value })}
                  className="input-field"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div>
                  <span className="font-medium text-gray-700 block">Maintenance Mode</span>
                  <span className="text-xs text-gray-500">Disable user access for maintenance</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={systemPrefs.maintenanceMode}
                  onChange={(e) => {
                    setSystemPrefs({ ...systemPrefs, maintenanceMode: e.target.checked });
                    toast(e.target.checked ? '⚠️ Maintenance mode enabled' : '✅ Maintenance mode disabled');
                  }}
                  className="w-5 h-5 rounded text-red-500 focus:ring-red-500" 
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div>
                  <span className="font-medium text-gray-700 block">Auto Backup</span>
                  <span className="text-xs text-gray-500">Daily automatic backups at 2:00 AM</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={systemPrefs.autoBackup}
                  onChange={(e) => setSystemPrefs({ ...systemPrefs, autoBackup: e.target.checked })}
                  className="w-5 h-5 rounded text-fia-teal focus:ring-fia-teal" 
                />
              </label>
            </div>
          </div>

          {/* Email Configuration */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-green-50 rounded-lg">
                <Mail className="w-6 h-6 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Email Configuration</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">SMTP Server</label>
                <input
                  type="text"
                  defaultValue="smtp.fia.ug"
                  className="input-field"
                  placeholder="smtp.example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">SMTP Port</label>
                <input
                  type="text"
                  defaultValue="587"
                  className="input-field"
                  placeholder="587"
                />
              </div>

              <button className="btn-secondary w-full">
                Test Email Configuration
              </button>
            </div>
          </div>

          {/* User Management */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-indigo-50 rounded-lg">
                <Users className="w-6 h-6 text-indigo-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">User Management</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-700">Total Users</p>
                  <p className="text-2xl font-bold text-fia-navy">45</p>
                </div>
                <Users className="w-8 h-8 text-gray-400" />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-700">Active Sessions</p>
                  <p className="text-2xl font-bold text-green-600">12</p>
                </div>
                <Zap className="w-8 h-8 text-gray-400" />
              </div>

              <button className="btn-secondary w-full">
                Manage Users
              </button>
            </div>
          </div>

        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-6">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Server Status</span>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-600">Online</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Database</span>
                <CheckCircle className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-600">Connected</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Last Backup</span>
                <Clock className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-lg font-bold text-purple-600">2 hours ago</p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Storage Used</span>
                <HardDrive className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-orange-600">45%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs Modal */}
      {showAuditLogs && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-fia-navy to-fia-teal p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">System Audit Logs</h2>
                  <p className="text-white/80">Track all system activities and changes</p>
                </div>
                <button
                  onClick={() => setShowAuditLogs(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Search */}
              <div className="mb-6 flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={auditSearchQuery}
                    onChange={(e) => setAuditSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fia-teal"
                  />
                </div>
                <button className="btn-secondary flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>

              {/* Logs Table */}
              <div className="overflow-y-auto" style={{ maxHeight: '60vh' }}>
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Timestamp</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">User</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Action</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Details</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">IP Address</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {log.timestamp.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {log.user}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {log.action}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {log.details}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {log.ipAddress}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            log.status === 'success' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Keys Modal */}
      {showApiKeys && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-fia-navy to-fia-teal p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">API Keys Management</h2>
                  <p className="text-white/80">Manage system API keys and integrations</p>
                </div>
                <button
                  onClick={() => setShowApiKeys(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">Production API Key</h3>
                    <p className="text-sm text-gray-600">Used for live system integrations</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                    Active
                  </span>
                </div>
                <div className="mt-3 flex items-center space-x-2">
                  <code className="flex-1 p-3 bg-gray-100 rounded font-mono text-sm">
                    fia_prod_••••••••••••••••••••••••••••
                  </code>
                  <button className="btn-secondary">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">Development API Key</h3>
                    <p className="text-sm text-gray-600">Used for testing and development</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                    Active
                  </span>
                </div>
                <div className="mt-3 flex items-center space-x-2">
                  <code className="flex-1 p-3 bg-gray-100 rounded font-mono text-sm">
                    fia_dev_••••••••••••••••••••••••••••
                  </code>
                  <button className="btn-secondary">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button className="btn-primary w-full">
                Generate New API Key
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}