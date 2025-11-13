// src/components/notifications/NotificationCenter.tsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  CheckCheck, 
  Trash2, 
  Filter,
  Settings,
  BellOff
} from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import NotificationItem from './NotificationItem';
import { NotificationType } from '../../types/notifications';
import { useAppStore } from '../../store';

export default function NotificationCenter() {
  const navigate = useNavigate();
  const { currentUser } = useAppStore();
  
  const {
    notifications,
    unreadCount,
    isNotificationCenterOpen,
    toggleNotificationCenter,
    markAllAsRead,
    clearAll,
  } = useNotificationStore();

  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        const bellButton = document.querySelector('[data-notification-bell]');
        if (bellButton && bellButton.contains(event.target as Node)) {
          return;
        }
        toggleNotificationCenter();
      }
    };

    if (isNotificationCenterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationCenterOpen, toggleNotificationCenter]);

  if (!isNotificationCenterOpen) return null;

  // Filter notifications
  const filteredNotifications = notifications.filter(notif => {
    if (showUnreadOnly && notif.read) return false;
    if (filterType !== 'all' && notif.type !== filterType) return false;
    return true;
  });

  // Handle settings navigation
  const handleSettingsClick = () => {
    toggleNotificationCenter();
    const settingsPath = currentUser?.role === 'fia_admin' 
      ? '/admin/settings' 
      : '/organization/settings';
    navigate(settingsPath);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
      <div className="absolute inset-y-0 right-0 flex max-w-full pointer-events-auto">
        <div
          ref={panelRef}
          className="w-screen max-w-md transform transition-transform duration-300 ease-in-out"
        >
          <div className="h-full flex flex-col bg-white shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-fia-navy to-fia-teal p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <BellOff className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Notifications</h2>
                    <p className="text-sm text-white/80">
                      {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={toggleNotificationCenter}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="flex items-center space-x-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Mark all read</span>
                </button>

                <button
                  onClick={clearAll}
                  disabled={notifications.length === 0}
                  className="flex items-center space-x-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear all</span>
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <Filter className="w-4 h-4 text-gray-600" />
                
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-fia-teal focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="submission">Submissions</option>
                  <option value="approval">Approvals</option>
                  <option value="rejection">Rejections</option>
                </select>

                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showUnreadOnly}
                    onChange={(e) => setShowUnreadOnly(e.target.checked)}
                    className="rounded text-fia-teal focus:ring-fia-teal"
                  />
                  <span className="text-gray-700 font-medium">Unread only</span>
                </label>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <BellOff className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No notifications</h3>
                  <p className="text-gray-600 text-sm">
                    {showUnreadOnly 
                      ? "You're all caught up! No unread notifications."
                      : "You don't have any notifications yet."}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <button
                onClick={handleSettingsClick}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <Settings className="w-4 h-4 text-gray-600 group-hover:rotate-45 transition-transform duration-300" />
                <span className="font-semibold text-gray-700">Notification Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}