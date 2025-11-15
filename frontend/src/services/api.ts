// frontend/src/services/api.ts
import axios from 'axios';

// 🔥 REAL BACKEND URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// 🔐 AUTH API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (data: any) =>
    api.post('/auth/register', data),
  
  logout: () =>
    api.post('/auth/logout'),
  
  getCurrentUser: () =>
    api.get('/auth/me'),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
  
  // 🔥 ADDED: Update user profile
  updateProfile: (data: any) =>
    api.put('/auth/profile', data),
};

// 🏢 ORGANIZATIONS API
export const organizationsAPI = {
  getAll: (params?: any) =>
    api.get('/organizations', { params }),
  
  getById: (id: string) =>
    api.get(`/organizations/${id}`),
  
  create: (data: any) =>
    api.post('/organizations', data),
  
  update: (id: string, data: any) =>
    api.put(`/organizations/${id}`, data),
  
  toggleStatus: (id: string, isActive: boolean) =>
    api.patch(`/organizations/${id}/toggle-status`, { isActive }),
  
  delete: (id: string) =>
    api.delete(`/organizations/${id}`),
  
  getStatistics: (id: string, year?: number) =>
    api.get(`/organizations/${id}/statistics`, { params: { year } }),
  
  // 🔥 ADDED: Bulk operations
  bulkUpdate: (ids: string[], data: any) =>
    api.put('/organizations/bulk', { ids, data }),
  
  bulkDelete: (ids: string[]) =>
    api.delete('/organizations/bulk', { data: { ids } }),
};

// 📊 SUBMISSIONS API
export const submissionsAPI = {
  // Get all submissions with filters
  getAll: (params?: any) =>
    api.get('/submissions', { params }),
  
  // Get submissions by organization
  getByOrganization: (orgId: string, params?: any) =>
    api.get(`/submissions/organization/${orgId}`, { params }),
  
  // Get single submission
  getById: (id: string) =>
    api.get(`/submissions/${id}`),
  
  // Create submission
  create: (data: any) =>
    api.post('/submissions', data),
  
  // Update submission
  update: (id: string, data: any) =>
    api.put(`/submissions/${id}`, data),
  
  // Submit for review
  submitForReview: (id: string) =>
    api.post(`/submissions/${id}/submit`),
  
  // 🔥 ADDED: Submit (alias for submitForReview)
  submit: (id: string) =>
    api.post(`/submissions/${id}/submit`),
  
  // Approve submission (Admin only)
  approve: (id: string, comments?: string) =>
    api.post(`/submissions/${id}/approve`, { comments }),
  
  // Reject submission (Admin only)
  reject: (id: string, reason: string) =>
    api.post(`/submissions/${id}/reject`, { reason }),
  
  // Delete submission
  delete: (id: string) =>
    api.delete(`/submissions/${id}`),
  
  // Get submission statistics
  getStatistics: (params?: any) =>
    api.get('/submissions/statistics', { params }),
  
  // 🔥 NEW: Get dashboard stats
  getDashboardStats: () =>
    api.get('/submissions/dashboard-stats'),
  
  // 🔥 ADDED: Bulk upload
  bulkUpload: (data: FormData) =>
    api.post('/submissions/bulk', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// 👨‍💼 ADMIN API
export const adminAPI = {
  // Get admin dashboard stats
  getDashboardStats: () =>
    api.get('/admin/dashboard'),
  
  // Get system overview
  getSystemOverview: (year?: number) =>
    api.get('/admin/overview', { params: { year } }),
  
  // Get compliance report
  getComplianceReport: (year?: number) =>
    api.get('/admin/compliance-report', { params: { year } }),
  
  // Get financial metrics
  getFinancialMetrics: (year?: number) =>
    api.get('/admin/financial-metrics', { params: { year } }),
  
  // Get system statistics
  getSystemStatistics: () =>
    api.get('/admin/statistics'),
  
  // 🔥 FIXED: Export data now accepts params object
  exportData: (params: { format?: string; type?: string; filters?: any }) =>
    api.get('/admin/export', { params, responseType: 'blob' }),
  
  // 🔥 ADDED: Get audit logs
  getAuditLogs: (params?: any) =>
    api.get('/admin/audit-logs', { params }),
  
  // 🔥 ADDED: Get system stats
  getSystemStats: () =>
    api.get('/admin/system/stats'),
  
  // 🔥 ADDED: Create backup
  createBackup: () =>
    api.post('/admin/backup'),
  
  // 🔥 ADDED: Schedule report
  scheduleReport: (data: any) =>
    api.post('/admin/reports/schedule', data),
};

// 💬 CHAT API
export const chatAPI = {
  // Get all conversations
  getConversations: () =>
    api.get('/chat/conversations'),
  
  // Get messages for a conversation
  getMessages: (conversationId: string) =>
    api.get(`/chat/conversations/${conversationId}/messages`),
  
  // Create conversation
  createConversation: (data: any) =>
    api.post('/chat/conversations', data),
  
  // Send message (text)
  sendMessage: (conversationId: string, data: any) =>
    api.post(`/chat/conversations/${conversationId}/messages`, data),
  
  // Send message with files
  sendMessageWithFiles: (conversationId: string, formData: FormData) =>
    api.post(`/chat/conversations/${conversationId}/messages`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  // Mark messages as read
  markAsRead: (conversationId: string) =>
    api.put(`/chat/conversations/${conversationId}/read`, { 
      userId: 'current-user' // This will be updated when we call it
    }),
  
  // Delete conversation
  deleteConversation: (conversationId: string) =>
    api.delete(`/chat/conversations/${conversationId}`),
  
  // Get unread count
  getUnreadCount: () =>
    api.get('/chat/unread-count'),
};

// 👥 USERS API
export const usersAPI = {
  getAll: (params?: any) =>
    api.get('/users', { params }),
  
  getById: (id: string) =>
    api.get(`/users/${id}`),
  
  create: (data: any) =>
    api.post('/users', data),
  
  update: (id: string, data: any) =>
    api.put(`/users/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/users/${id}`),
  
  // 🔥 ADDED: Get users by organization
  getByOrganization: (orgId: string) =>
    api.get(`/users/organization/${orgId}`),
  
  // 🔥 ADDED: Reset password
  resetPassword: (userId: string) =>
    api.post(`/users/${userId}/reset-password`),
};

// 🔔 NOTIFICATIONS API (if you need it later)
export const notificationsAPI = {
  getAll: (params?: any) =>
    api.get('/notifications', { params }),
  
  markAsRead: (id: string) =>
    api.patch(`/notifications/${id}/read`),
  
  markAllAsRead: () =>
    api.patch('/notifications/mark-all-read'),
  
  delete: (id: string) =>
    api.delete(`/notifications/${id}`),
};

export default api;