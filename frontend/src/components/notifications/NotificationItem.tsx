// src/components/notifications/NotificationItem.tsx
import { 
    CheckCircle, 
    XCircle, 
    AlertTriangle, 
    Info, 
    FileText, 
    ThumbsUp, 
    ThumbsDown,
    X,
    ExternalLink,
    Clock
  } from 'lucide-react';
  import { Notification } from '../../types/notifications';
  import { useNotificationStore } from '../../store/notificationStore';
  import { useNavigate } from 'react-router-dom';
  
  interface NotificationItemProps {
    notification: Notification;
  }
  
  export default function NotificationItem({ notification }: NotificationItemProps) {
    const { markAsRead, deleteNotification } = useNotificationStore();
    const navigate = useNavigate();
  
    const getIcon = () => {
      switch (notification.type) {
        case 'success':
          return <CheckCircle className="w-6 h-6 text-green-500" />;
        case 'error':
          return <XCircle className="w-6 h-6 text-red-500" />;
        case 'warning':
          return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
        case 'approval':
          return <ThumbsUp className="w-6 h-6 text-green-500" />;
        case 'rejection':
          return <ThumbsDown className="w-6 h-6 text-red-500" />;
        case 'submission':
          return <FileText className="w-6 h-6 text-blue-500" />;
        default:
          return <Info className="w-6 h-6 text-blue-500" />;
      }
    };
  
    const getBackgroundColor = () => {
      if (notification.read) return 'bg-white';
      
      switch (notification.type) {
        case 'success':
        case 'approval':
          return 'bg-green-50';
        case 'error':
        case 'rejection':
          return 'bg-red-50';
        case 'warning':
          return 'bg-yellow-50';
        default:
          return 'bg-blue-50';
      }
    };
  
    const getBorderColor = () => {
      switch (notification.type) {
        case 'success':
        case 'approval':
          return 'border-green-200';
        case 'error':
        case 'rejection':
          return 'border-red-200';
        case 'warning':
          return 'border-yellow-200';
        default:
          return 'border-blue-200';
      }
    };
  
    const handleClick = () => {
      if (!notification.read) {
        markAsRead(notification.id);
      }
  
      if (notification.actionUrl) {
        navigate(notification.actionUrl);
      }
    };
  
    const getTimeAgo = (date: Date) => {
      const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
      
      if (seconds < 60) return 'Just now';
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
      if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
      return date.toLocaleDateString();
    };
  
    return (
      <div
        className={`relative p-4 border rounded-lg transition-all cursor-pointer ${getBackgroundColor()} ${getBorderColor()} ${
          notification.read ? 'opacity-75' : ''
        } hover:shadow-md`}
        onClick={handleClick}
      >
        {/* Unread indicator */}
        {!notification.read && (
          <div className="absolute top-4 left-0 w-1 h-full bg-blue-500 rounded-r" />
        )}
  
        <div className="flex items-start space-x-3 ml-2">
          {/* Icon */}
          <div className="flex-shrink-0 mt-1">
            {getIcon()}
          </div>
  
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-1">{notification.title}</h4>
                <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                
                {/* Metadata */}
                {notification.metadata && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {notification.metadata.organizationName && (
                      <span className="badge badge-info text-xs">
                        {notification.metadata.organizationName}
                      </span>
                    )}
                    {notification.metadata.month && notification.metadata.year && (
                      <span className="badge badge-secondary text-xs">
                        {new Date(notification.metadata.year, notification.metadata.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                )}
  
                {/* Action Button */}
                {notification.actionUrl && notification.actionText && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClick();
                    }}
                    className="inline-flex items-center space-x-1 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <span>{notification.actionText}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
  
                {/* Timestamp */}
                <div className="flex items-center space-x-1 text-xs text-gray-500 mt-2">
                  <Clock className="w-3 h-3" />
                  <span>{getTimeAgo(notification.createdAt)}</span>
                </div>
              </div>
  
              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notification.id);
                }}
                className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }