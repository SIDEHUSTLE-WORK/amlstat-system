// src/components/common/DashboardLayout.tsx
import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield, 
  LayoutDashboard, 
  FileText, 
  Upload,
  BarChart3, 
  Settings, 
  Bell,
  LogOut,
  Menu,
  X,
  Building2,
  MessageSquare // 🔥 ADD THIS FOR MESSAGES
} from 'lucide-react';
import { useAppStore } from '../../store';
import { useNotificationStore } from '../../store/notificationStore';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout, sidebarOpen, toggleSidebar } = useAppStore();
  const { unreadCount, toggleNotificationCenter } = useNotificationStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigation items based on role
  const getNavigationItems = () => {
    if (currentUser?.role === 'fia_admin') {
      return [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Organizations', path: '/admin/organizations', icon: Building2 },
        { name: 'Messages', path: '/admin/messages', icon: MessageSquare }, // 🔥 NEW
        { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
      ];
    } else {
      return [
        { name: 'Dashboard', path: '/organization/dashboard', icon: LayoutDashboard },
        { name: 'Submit Statistics', path: '/organization/submit', icon: FileText },
        { name: 'Bulk Upload', path: '/organization/upload', icon: Upload },
        { name: 'Messages', path: '/organization/messages', icon: MessageSquare }, // 🔥 NEW
        { name: 'Reports', path: '/organization/reports', icon: BarChart3 },
        { name: 'Settings', path: '/organization/settings', icon: Settings },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30">
        <div className="flex items-center justify-between h-full px-6">
          {/* Left Side */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-fia-gold rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-fia-navy" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-fia-navy">FIA Uganda</h1>
                <p className="text-xs text-fia-gold">AML/CFT Statistics Portal</p>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button 
              onClick={toggleNotificationCenter}
              data-notification-bell
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-6 h-6 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Profile */}
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-gray-900">{currentUser?.name}</p>
                <p className="text-xs text-gray-500 capitalize">
                  {currentUser?.role === 'fia_admin' ? 'FIA Administrator' : currentUser?.organization?.code}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fia-navy to-fia-teal text-white flex items-center justify-center font-bold">
                {currentUser?.name.charAt(0)}
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-20 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <nav className="p-4 space-y-2 h-full overflow-y-auto custom-scrollbar">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-fia-navy text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
          
          {/* Organization Badge for Org Users */}
          {currentUser?.organization && (
            <div className="mt-6 p-4 bg-gradient-to-br from-fia-navy to-fia-teal rounded-xl text-white">
              <p className="text-xs font-semibold opacity-80 mb-1">Your Organization</p>
              <p className="font-bold text-sm">{currentUser.organization.name}</p>
              <p className="text-xs opacity-90 mt-1">{currentUser.organization.code}</p>
              <div className="mt-3 flex items-center space-x-2 text-xs">
                <span className="status-dot status-active"></span>
                <span>Active</span>
              </div>
            </div>
          )}

          {/* Quick Stats for Org Users */}
          {currentUser?.organization && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-3">Quick Stats</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-bold text-green-600">{currentUser.organization.completedSubmissions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pending:</span>
                  <span className="font-bold text-yellow-600">{currentUser.organization.pendingSubmissions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Compliance:</span>
                  <span className="font-bold text-fia-navy">{currentUser.organization.complianceScore}%</span>
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Main Content */}
      <div className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
        <div className="p-6">
          {children}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}