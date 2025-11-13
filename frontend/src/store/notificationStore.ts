// src/store/notificationStore.ts
import { create } from 'zustand';
import { Notification, NotificationPreferences } from '../types/notifications';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  isNotificationCenterOpen: boolean;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  toggleNotificationCenter: () => void;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  
  // Toast notifications
  showToast: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isNotificationCenterOpen: false,
  
  preferences: {
    email: true,
    inApp: true,
    push: true,
    submissionApproved: true,
    submissionRejected: true,
    newSubmission: true,
    reminderDueDate: true,
    systemUpdates: true,
  },

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      read: false,
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));

    console.log('🔔 New notification:', newNotification);
  },

  markAsRead: (id) => {
    set((state) => {
      const notification = state.notifications.find(n => n.id === id);
      if (!notification || notification.read) return state;

      return {
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  deleteNotification: (id) => {
    set((state) => {
      const notification = state.notifications.find(n => n.id === id);
      const wasUnread = notification && !notification.read;

      return {
        notifications: state.notifications.filter(n => n.id !== id),
        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };
    });
  },

  clearAll: () => {
    if (window.confirm('Are you sure you want to delete all notifications?')) {
      set({ notifications: [], unreadCount: 0 });
    }
  },

  toggleNotificationCenter: () => {
    set((state) => ({
      isNotificationCenterOpen: !state.isNotificationCenterOpen,
    }));
  },

  updatePreferences: (newPreferences) => {
    set((state) => ({
      preferences: { ...state.preferences, ...newPreferences },
    }));
  },

  showToast: (notification) => {
    get().addNotification(notification);
    // Toast will be shown via ToastNotification component
  },
}));