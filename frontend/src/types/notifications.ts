// src/types/notifications.ts

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'submission' | 'approval' | 'rejection';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  actionText?: string;
  metadata?: {
    organizationId?: string;
    organizationName?: string;
    submissionId?: string;
    userId?: string;
    month?: number;
    year?: number;
  };
}

export interface NotificationPreferences {
  email: boolean;
  inApp: boolean;
  push: boolean;
  submissionApproved: boolean;
  submissionRejected: boolean;
  newSubmission: boolean;
  reminderDueDate: boolean;
  systemUpdates: boolean;
}