// src/components/notifications/NotificationBell.tsx
import { Bell } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';

export default function NotificationBell() {
  const { unreadCount, toggleNotificationCenter } = useNotificationStore();

  return (
    <button
      onClick={toggleNotificationCenter}
      className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <Bell className="w-6 h-6 text-gray-600" />
      
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}