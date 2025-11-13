// src/utils/notificationUtils.ts
import { useNotificationStore } from '../store/notificationStore';
import { NotificationType } from '../types/notifications';

export const notificationHelpers = {
  // Submission notifications
  submissionApproved: (organizationName: string, month: number, year: number, submissionId: string) => {
    useNotificationStore.getState().addNotification({
      type: 'approval',
      title: 'Submission Approved! ✅',
      message: `Your submission for ${new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} has been approved by FIA.`,
      actionUrl: `/organization/submissions/${submissionId}`,
      actionText: 'View Details',
      metadata: {
        organizationName,
        month,
        year,
        submissionId,
      },
    });
  },

  submissionRejected: (organizationName: string, month: number, year: number, reason: string, submissionId: string) => {
    useNotificationStore.getState().addNotification({
      type: 'rejection',
      title: 'Submission Rejected',
      message: `Your submission for ${new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} was rejected. Reason: ${reason}`,
      actionUrl: `/organization/submissions/${submissionId}`,
      actionText: 'Review & Resubmit',
      metadata: {
        organizationName,
        month,
        year,
        submissionId,
      },
    });
  },

  newSubmissionReceived: (organizationName: string, month: number, year: number, submissionId: string) => {
    useNotificationStore.getState().addNotification({
      type: 'submission',
      title: 'New Submission Received',
      message: `${organizationName} has submitted statistics for ${new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.`,
      actionUrl: `/admin/submissions/${submissionId}`,
      actionText: 'Review Submission',
      metadata: {
        organizationName,
        month,
        year,
        submissionId,
      },
    });
  },

  reminderDueDate: (month: number, year: number, daysUntilDue: number) => {
    useNotificationStore.getState().addNotification({
      type: 'warning',
      title: 'Submission Deadline Approaching',
      message: `Your statistics for ${new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} are due in ${daysUntilDue} days.`,
      actionUrl: '/organization/submit',
      actionText: 'Submit Now',
      metadata: {
        month,
        year,
      },
    });
  },

  systemUpdate: (title: string, message: string) => {
    useNotificationStore.getState().addNotification({
      type: 'info',
      title,
      message,
    });
  },

  success: (title: string, message: string) => {
    useNotificationStore.getState().addNotification({
      type: 'success',
      title,
      message,
    });
  },

  error: (title: string, message: string) => {
    useNotificationStore.getState().addNotification({
      type: 'error',
      title,
      message,
    });
  },

  warning: (title: string, message: string) => {
    useNotificationStore.getState().addNotification({
      type: 'warning',
      title,
      message,
    });
  },
};

// Hook for easy access
export const useNotifications = () => notificationHelpers;