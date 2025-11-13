// src/components/notifications/ToastNotification.tsx
import { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { Notification } from '../../types/notifications';

export default function ToastNotification() {
  const { notifications } = useNotificationStore();
  const [visibleToasts, setVisibleToasts] = useState<Notification[]>([]);

  useEffect(() => {
    // Show only the 3 most recent unread notifications as toasts
    const recentUnread = notifications
      .filter(n => !n.read)
      .slice(0, 3);

    setVisibleToasts(recentUnread);

    // Auto-hide after 5 seconds
    const timers = recentUnread.map(notif => 
      setTimeout(() => {
        setVisibleToasts(prev => prev.filter(t => t.id !== notif.id));
      }, 5000)
    );

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
      case 'approval':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
      case 'rejection':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'success':
      case 'approval':
        return 'bg-green-50 border-green-200';
      case 'error':
      case 'rejection':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const handleClose = (id: string) => {
    setVisibleToasts(prev => prev.filter(t => t.id !== id));
  };

  if (visibleToasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-50 space-y-3 pointer-events-none">
      {visibleToasts.map((toast, index) => (
        <div
          key={toast.id}
          className={`pointer-events-auto w-96 p-4 rounded-lg border-2 shadow-xl transform transition-all duration-300 ease-out ${getColors(toast.type)}`}
          style={{
            animation: 'slideInRight 0.3s ease-out',
            animationDelay: `${index * 0.1}s`,
          }}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {getIcon(toast.type)}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-900 mb-1">{toast.title}</h4>
              <p className="text-sm text-gray-700">{toast.message}</p>
            </div>

            <button
              onClick={() => handleClose(toast.id)}
              className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-400 transition-all"
              style={{
                animation: 'progress 5s linear',
              }}
            />
          </div>
        </div>
      ))}

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}