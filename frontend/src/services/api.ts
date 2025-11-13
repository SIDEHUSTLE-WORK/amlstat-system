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
  
  delete: (id: string) =>
    api.delete(`/organizations/${id}`),
  
  getStatistics: (id: string, year?: number) =>
    api.get(`/organizations/${id}/statistics`, { params: { year } }),
};

// 📊 SUBMISSIONS API
export const submissionsAPI = {
  getAll: (params?: any) =>
    api.get('/submissions', { params }),
  
  getByOrganization: (orgId: string, params?: any) =>
    api.get(`/submissions/organization/${orgId}`, { params }),
  
  getById: (id: string) =>
    api.get(`/submissions/${id}`),
  
  create: (data: any) =>
    api.post('/submissions', data),
  
  update: (id: string, data: any) =>
    api.put(`/submissions/${id}`, data),
  
  submitForReview: (id: string) =>
    api.post(`/submissions/${id}/submit`),
  
  approve: (id: string, comments?: string) =>
    api.post(`/submissions/${id}/approve`, { comments }),
  
  reject: (id: string, reason: string) =>
    api.post(`/submissions/${id}/reject`, { reason }),
  
  delete: (id: string) =>
    api.delete(`/submissions/${id}`),
};

// 💬 CHAT API
export const chatAPI = {
  getConversations: (userId: string) =>
    api.get(`/chat/conversations/${userId}`),
  
  getMessages: (conversationId: string) =>
    api.get(`/chat/conversations/${conversationId}/messages`),
  
  sendMessage: (conversationId: string, formData: FormData) =>
    api.post(`/chat/conversations/${conversationId}/messages`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  markAsRead: (conversationId: string, userId: string) =>
    api.put(`/chat/conversations/${conversationId}/read`, { userId }),
};

export default api;