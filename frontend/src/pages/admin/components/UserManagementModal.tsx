// frontend/src/pages/admin/components/UserManagementModal.tsx
import { useState, useEffect } from 'react';
import { X, Users, Plus, Mail, Shield, Trash2, Edit, Key, RefreshCw } from 'lucide-react';
import { Organization } from '../../../types';
import { usersAPI } from '../../../services/api';
import toast from 'react-hot-toast';

interface UserManagementModalProps {
  organization: Organization;
  onClose: () => void;
}

interface OrgUser {
  id: string;
  name: string;
  email: string;
  role: 'ORG_ADMIN' | 'ORG_USER';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export default function UserManagementModal({ organization, onClose }: UserManagementModalProps) {
  const [users, setUsers] = useState<OrgUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'ORG_USER' as 'ORG_ADMIN' | 'ORG_USER'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔥 FETCH USERS ON MOUNT
  useEffect(() => {
    loadUsers();
  }, [organization.id]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await usersAPI.getByOrganization(organization.id);
      
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error: any) {
      console.error('Load users error:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  // Validation
  const validateNewUser = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!newUser.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!newUser.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      newErrors.email = 'Invalid email format';
    } else if (users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
      newErrors.email = 'This email is already in use';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🔥 REAL API ADD USER
  const handleAddUser = async () => {
    if (!validateNewUser()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await usersAPI.create({
        organizationId: organization.id,
        name: newUser.name.trim(),
        email: newUser.email.trim().toLowerCase(),
        role: newUser.role
      });

      if (response.data.success) {
        toast.success('User added successfully! Invitation email sent.');
        setNewUser({ name: '', email: '', role: 'ORG_USER' });
        setShowAddUser(false);
        loadUsers(); // Refresh list
      }
    } catch (error: any) {
      console.error('Add user error:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
        
        if (error.response.data.errors) {
          setErrors(error.response.data.errors);
        }
      } else {
        toast.error('Failed to add user');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔥 REAL API TOGGLE USER STATUS
  const handleToggleStatus = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const newStatus = !user.isActive;
    const action = newStatus ? 'activate' : 'deactivate';

    if (!window.confirm(`Are you sure you want to ${action} ${user.name}?`)) {
      return;
    }

    try {
      const response = await usersAPI.update(userId, {
        isActive: newStatus
      });

      if (response.data.success) {
        toast.success(`User ${action}d successfully!`);
        loadUsers(); // Refresh list
      }
    } catch (error: any) {
      console.error('Toggle status error:', error);
      toast.error(error.response?.data?.message || `Failed to ${action} user`);
    }
  };

  // 🔥 REAL API DELETE USER
  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    if (!window.confirm(`Are you sure you want to remove ${user.name}?`)) {
      return;
    }

    try {
      const response = await usersAPI.delete(userId);

      if (response.data.success) {
        toast.success('User removed successfully!');
        loadUsers(); // Refresh list
      }
    } catch (error: any) {
      console.error('Delete user error:', error);
      toast.error(error.response?.data?.message || 'Failed to remove user');
    }
  };

  // 🔥 REAL API RESET PASSWORD
  const handleResetPassword = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    if (!window.confirm(`Send password reset link to ${user.email}?`)) {
      return;
    }

    try {
      const response = await usersAPI.resetPassword(userId);

      if (response.data.success) {
        toast.success(`Password reset link sent to ${user.email}`);
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6 text-white sticky top-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">User Management</h2>
                <p className="text-white/80 text-sm">{organization.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadUsers}
                disabled={isLoading}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <RefreshCw className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading users...</p>
            </div>
          )}

          {!isLoading && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-2xl font-bold text-blue-700">{users.length}</p>
                  <p className="text-sm text-blue-600">Total Users</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-2xl font-bold text-green-700">
                    {users.filter(u => u.isActive).length}
                  </p>
                  <p className="text-sm text-green-600">Active</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-2xl font-bold text-purple-700">
                    {users.filter(u => u.role === 'ORG_ADMIN').length}
                  </p>
                  <p className="text-sm text-purple-600">Admins</p>
                </div>
              </div>

              {/* Add User Button */}
              <button
                onClick={() => setShowAddUser(!showAddUser)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add New User</span>
              </button>

              {/* Add User Form */}
              {showAddUser && (
                <div className="p-6 bg-gray-50 rounded-lg border-2 border-purple-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Add New User</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                      <input
                        type="text"
                        value={newUser.name}
                        onChange={(e) => {
                          setNewUser({ ...newUser, name: e.target.value });
                          setErrors({ ...errors, name: '' });
                        }}
                        placeholder="Full name"
                        disabled={isSubmitting}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                          errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        value={newUser.email}
                        onChange={(e) => {
                          setNewUser({ ...newUser, email: e.target.value });
                          setErrors({ ...errors, email: '' });
                        }}
                        placeholder="user@example.com"
                        disabled={isSubmitting}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Role *</label>
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                        disabled={isSubmitting}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="ORG_USER">User (Can submit statistics)</option>
                        <option value="ORG_ADMIN">Admin (Can manage users & submissions)</option>
                      </select>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={handleAddUser}
                        disabled={isSubmitting}
                        className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            <span>Adding...</span>
                          </>
                        ) : (
                          <span>Add User</span>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShowAddUser(false);
                          setNewUser({ name: '', email: '', role: 'ORG_USER' });
                          setErrors({});
                        }}
                        disabled={isSubmitting}
                        className="px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Users List */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900">Organization Users</h3>
                
                {users.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No users yet. Add your first user above.</p>
                  </div>
                ) : (
                  users.map(user => (
                    <div
                      key={user.id}
                      className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-bold text-gray-900">{user.name}</p>
                              <span className={`badge ${
                                user.role === 'ORG_ADMIN' ? 'badge-warning' : 'badge-info'
                              }`}>
                                {user.role === 'ORG_ADMIN' ? 'Admin' : 'User'}
                              </span>
                              <span className={`badge ${
                                user.isActive ? 'badge-success' : 'badge-danger'
                              }`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                              <span className="flex items-center space-x-1">
                                <Mail className="w-4 h-4" />
                                <span>{user.email}</span>
                              </span>
                              {user.lastLogin && (
                                <span>
                                  Last login: {new Date(user.lastLogin).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleResetPassword(user.id)}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                            title="Reset Password"
                          >
                            <Key className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user.id)}
                            className="p-2 hover:bg-yellow-50 text-yellow-600 rounded-lg transition-colors"
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <Shield className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                            title="Remove User"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Users will receive an email invitation to set up their account.
                  Admins can manage submissions and users, while regular users can only submit statistics.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}