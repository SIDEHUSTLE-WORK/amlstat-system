// src/pages/admin/components/UserManagementModal.tsx
import { useState } from 'react';
import { X, Users, Plus, Mail, Shield, Trash2, Edit, Key } from 'lucide-react';
import { Organization } from '../../../types';

interface UserManagementModalProps {
  organization: Organization;
  onClose: () => void;
}

interface OrgUser {
  id: string;
  name: string;
  email: string;
  role: 'org_admin' | 'org_user';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

export default function UserManagementModal({ organization, onClose }: UserManagementModalProps) {
  // Mock users data
  const [users, setUsers] = useState<OrgUser[]>([
    {
      id: 'user-1',
      name: `${organization.contactPerson}`,
      email: organization.email,
      role: 'org_admin',
      isActive: true,
      lastLogin: new Date('2024-11-10'),
      createdAt: new Date('2024-01-15')
    }
  ]);

  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'org_user' as 'org_admin' | 'org_user'
  });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      alert('Please fill in all fields');
      return;
    }

    const user: OrgUser = {
      id: `user-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isActive: true,
      createdAt: new Date()
    };

    setUsers([...users, user]);
    setNewUser({ name: '', email: '', role: 'org_user' });
    setShowAddUser(false);
    alert('User added successfully!');
  };

  const handleToggleStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    ));
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to remove this user?')) {
      setUsers(users.filter(user => user.id !== userId));
      alert('User removed successfully!');
    }
  };

  const handleResetPassword = (user: OrgUser) => {
    alert(`Password reset link sent to ${user.email}`);
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
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
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
                {users.filter(u => u.role === 'org_admin').length}
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Full name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="user@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="org_user">User (Can submit statistics)</option>
                    <option value="org_admin">Admin (Can manage users & submissions)</option>
                  </select>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleAddUser}
                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700"
                  >
                    Add User
                  </button>
                  <button
                    onClick={() => {
                      setShowAddUser(false);
                      setNewUser({ name: '', email: '', role: 'org_user' });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
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
            
            {users.map(user => (
              <div
                key={user.id}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {user.name.charAt(0)}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-bold text-gray-900">{user.name}</p>
                        <span className={`badge ${
                          user.role === 'org_admin' ? 'badge-warning' : 'badge-info'
                        }`}>
                          {user.role === 'org_admin' ? 'Admin' : 'User'}
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
                            Last login: {user.lastLogin.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleResetPassword(user)}
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
            ))}
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Users will receive an email invitation to set up their account.
              Admins can manage submissions and users, while regular users can only submit statistics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}