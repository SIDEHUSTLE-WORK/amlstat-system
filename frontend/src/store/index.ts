// frontend/src/store/index.ts
import { create } from 'zustand';
import { authAPI, organizationsAPI, submissionsAPI, adminAPI } from '../services/api';
import { useNotificationStore } from './notificationStore';
import type { 
  User, 
  Organization, 
  MonthlySubmission,
  DashboardStats, 
  Notification,
  SubmissionStatus,
} from '../types';

interface AppState {
  // Authentication
  currentUser: User | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setCurrentUser: (user: User | null) => void; // 🔥 ADDED
  
  // Organizations
  organizations: Organization[];
  selectedOrganization: Organization | null;
  isLoadingOrganizations: boolean;
  fetchOrganizations: () => Promise<void>;
  selectOrganization: (org: Organization | null) => void;
  
  // Submissions
  submissions: MonthlySubmission[];
  isLoadingSubmissions: boolean;
  fetchSubmissions: () => Promise<void>;
  fetchSubmissionsByOrg: (orgId: string) => Promise<void>;
  fetchAllSubmissions: () => Promise<void>; // 🔥 ADDED
  addSubmission: (submission: MonthlySubmission) => void;
  getSubmissionsByOrg: (orgId: string) => MonthlySubmission[];
  getAllSubmissions: () => MonthlySubmission[];
  
  // Approval/Rejection functions
  approveSubmission: (submissionId: string, comments?: string) => Promise<void>;
  rejectSubmission: (submissionId: string, reason: string) => Promise<void>;
  updateSubmissionStatus: (submissionId: string, status: SubmissionStatus, data?: any) => void;
  
  // Dashboard Stats
  dashboardStats: DashboardStats | null;
  isLoadingDashboard: boolean;
  fetchDashboardStats: () => Promise<void>;
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  
  // UI State
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setLoading: (loading: boolean) => void; // 🔥 ADDED
}

// ================================
// BEAUTIFUL GRADIENT THEMES
// ================================
const orgThemes: Record<string, { 
  gradient: string;
  gradientHover: string;
  primary: string;
  secondary: string;
  accent: string;
  light: string;
  text: string;
}> = {
  'BOU': { 
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    gradientHover: 'from-blue-700 via-indigo-700 to-purple-700',
    primary: '#4f46e5',
    secondary: '#7c3aed',
    accent: '#3b82f6',
    light: 'bg-gradient-to-r from-blue-50 to-indigo-50',
    text: 'text-blue-900'
  },
  'CMA': { 
    gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
    gradientHover: 'from-violet-700 via-purple-700 to-fuchsia-700',
    primary: '#9333ea',
    secondary: '#c026d3',
    accent: '#a855f7',
    light: 'bg-gradient-to-r from-violet-50 to-fuchsia-50',
    text: 'text-purple-900'
  },
  'IRA': { 
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    gradientHover: 'from-emerald-600 via-teal-600 to-cyan-700',
    primary: '#14b8a6',
    secondary: '#06b6d4',
    accent: '#10b981',
    light: 'bg-gradient-to-r from-emerald-50 to-teal-50',
    text: 'text-teal-900'
  },
  'UMRA': { 
    gradient: 'from-cyan-500 via-blue-500 to-indigo-600',
    gradientHover: 'from-cyan-600 via-blue-600 to-indigo-700',
    primary: '#0891b2',
    secondary: '#3b82f6',
    accent: '#4f46e5',
    light: 'bg-gradient-to-r from-cyan-50 to-blue-50',
    text: 'text-cyan-900'
  },
  'URSB': { 
    gradient: 'from-indigo-600 via-blue-600 to-sky-500',
    gradientHover: 'from-indigo-700 via-blue-700 to-sky-600',
    primary: '#4f46e5',
    secondary: '#0ea5e9',
    accent: '#3b82f6',
    light: 'bg-gradient-to-r from-indigo-50 to-sky-50',
    text: 'text-indigo-900'
  },
  'NLGRB': { 
    gradient: 'from-sky-500 via-cyan-500 to-teal-500',
    gradientHover: 'from-sky-600 via-cyan-600 to-teal-600',
    primary: '#0ea5e9',
    secondary: '#14b8a6',
    accent: '#06b6d4',
    light: 'bg-gradient-to-r from-sky-50 to-teal-50',
    text: 'text-sky-900'
  },
  'MEMD': { 
    gradient: 'from-green-600 via-emerald-600 to-teal-600',
    gradientHover: 'from-green-700 via-emerald-700 to-teal-700',
    primary: '#16a34a',
    secondary: '#14b8a6',
    accent: '#10b981',
    light: 'bg-gradient-to-r from-green-50 to-emerald-50',
    text: 'text-green-900'
  },
  'ICPAU': { 
    gradient: 'from-orange-600 via-amber-600 to-yellow-500',
    gradientHover: 'from-orange-700 via-amber-700 to-yellow-600',
    primary: '#ea580c',
    secondary: '#f59e0b',
    accent: '#eab308',
    light: 'bg-gradient-to-r from-orange-50 to-yellow-50',
    text: 'text-orange-900'
  },
  'ULC': { 
    gradient: 'from-purple-600 via-fuchsia-600 to-pink-600',
    gradientHover: 'from-purple-700 via-fuchsia-700 to-pink-700',
    primary: '#9333ea',
    secondary: '#ec4899',
    accent: '#c026d3',
    light: 'bg-gradient-to-r from-purple-50 to-pink-50',
    text: 'text-purple-900'
  },
  'NGO_BUREAU': { 
    gradient: 'from-teal-600 via-emerald-600 to-green-600',
    gradientHover: 'from-teal-700 via-emerald-700 to-green-700',
    primary: '#0d9488',
    secondary: '#16a34a',
    accent: '#10b981',
    light: 'bg-gradient-to-r from-teal-50 to-green-50',
    text: 'text-teal-900'
  },
  'FIA': { 
    gradient: 'from-fia-navy via-fia-teal to-fia-navy',
    gradientHover: 'from-fia-navy-dark via-fia-teal-dark to-fia-navy-dark',
    primary: '#1C3D5A',
    secondary: '#2C7A7B',
    accent: '#D4AF37',
    light: 'bg-gradient-to-r from-fia-navy/5 to-fia-teal/5',
    text: 'text-fia-navy'
  },
  'CID': { 
    gradient: 'from-red-700 via-rose-700 to-pink-700',
    gradientHover: 'from-red-800 via-rose-800 to-pink-800',
    primary: '#be123c',
    secondary: '#e11d48',
    accent: '#dc2626',
    light: 'bg-gradient-to-r from-red-50 to-rose-50',
    text: 'text-red-900'
  },
  'IG': { 
    gradient: 'from-rose-600 via-pink-600 to-fuchsia-600',
    gradientHover: 'from-rose-700 via-pink-700 to-fuchsia-700',
    primary: '#e11d48',
    secondary: '#c026d3',
    accent: '#ec4899',
    light: 'bg-gradient-to-r from-rose-50 to-fuchsia-50',
    text: 'text-rose-900'
  },
  'UWA': { 
    gradient: 'from-lime-600 via-green-600 to-emerald-700',
    gradientHover: 'from-lime-700 via-green-700 to-emerald-800',
    primary: '#16a34a',
    secondary: '#10b981',
    accent: '#84cc16',
    light: 'bg-gradient-to-r from-lime-50 to-emerald-50',
    text: 'text-green-900'
  },
  'URA': { 
    gradient: 'from-red-600 via-orange-600 to-amber-600',
    gradientHover: 'from-red-700 via-orange-700 to-amber-700',
    primary: '#dc2626',
    secondary: '#f97316',
    accent: '#f59e0b',
    light: 'bg-gradient-to-r from-red-50 to-amber-50',
    text: 'text-red-900'
  },
  'ODPP': { 
    gradient: 'from-amber-600 via-orange-600 to-red-600',
    gradientHover: 'from-amber-700 via-orange-700 to-red-700',
    primary: '#f59e0b',
    secondary: '#dc2626',
    accent: '#f97316',
    light: 'bg-gradient-to-r from-amber-50 to-orange-50',
    text: 'text-amber-900'
  },
  'INTERPOL': { 
    gradient: 'from-cyan-700 via-blue-700 to-indigo-800',
    gradientHover: 'from-cyan-800 via-blue-800 to-indigo-900',
    primary: '#0e7490',
    secondary: '#1e40af',
    accent: '#4338ca',
    light: 'bg-gradient-to-r from-cyan-50 to-indigo-50',
    text: 'text-cyan-900'
  },
};

export const getOrgTheme = (orgCode: string) => {
  return orgThemes[orgCode] || orgThemes['FIA'];
};

// ================================
// ZUSTAND STORE
// ================================
export const useAppStore = create<AppState>((set, get) => ({
  // Authentication
  currentUser: null,
  isAuthenticated: false,
  isCheckingAuth: true,
  
  // 🔥 REAL API LOGIN
  login: async (email: string, password: string) => {
    console.log('Attempting login:', email);
    
    try {
      const response = await authAPI.login(email, password);
      
      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;
        
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        
        const mappedUser: User = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role.toLowerCase(),
          organizationId: user.organizationId,
          organization: user.organization,
          createdAt: new Date(user.createdAt),
          isActive: user.isActive,
        };
        
        set({ 
          currentUser: mappedUser, 
          isAuthenticated: true,
          isCheckingAuth: false
        });
        
        console.log('✅ Login successful:', mappedUser);
        return true;
      }
      
      console.log('❌ Login failed');
      return false;
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      if (error.response?.data?.message) {
        console.error('Error message:', error.response.data.message);
      }
      return false;
    }
  },
  
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ 
      currentUser: null, 
      isAuthenticated: false,
      selectedOrganization: null,
      organizations: [],
      submissions: [],
      dashboardStats: null,
    });
  },
  
  // 🔥 ADDED: Set current user
  setCurrentUser: (user: User | null) => {
    set({ currentUser: user, isAuthenticated: !!user });
  },
  
  // Organizations
  organizations: [],
  selectedOrganization: null,
  isLoadingOrganizations: false,
  
  // 🔥 FETCH ORGANIZATIONS FROM API
  fetchOrganizations: async () => {
    set({ isLoadingOrganizations: true });
    try {
      const response = await organizationsAPI.getAll();
      if (response.data.success) {
        set({ organizations: response.data.data.organizations });
        console.log('✅ Organizations fetched:', response.data.data.organizations.length);
      }
    } catch (error) {
      console.error('❌ Fetch organizations error:', error);
    } finally {
      set({ isLoadingOrganizations: false });
    }
  },
  
  selectOrganization: (org) => set({ selectedOrganization: org }),
  
  // Submissions
  submissions: [],
  isLoadingSubmissions: false,
  
  // 🔥 FETCH ALL SUBMISSIONS FROM API
  fetchSubmissions: async () => {
    set({ isLoadingSubmissions: true });
    try {
      const response = await submissionsAPI.getAll();
      if (response.data.success) {
        set({ submissions: response.data.data.submissions });
        console.log('✅ Submissions fetched:', response.data.data.submissions.length);
      }
    } catch (error) {
      console.error('❌ Fetch submissions error:', error);
    } finally {
      set({ isLoadingSubmissions: false });
    }
  },
  
  // 🔥 FETCH SUBMISSIONS BY ORGANIZATION FROM API
  fetchSubmissionsByOrg: async (orgId: string) => {
    set({ isLoadingSubmissions: true });
    try {
      const response = await submissionsAPI.getByOrganization(orgId);
      if (response.data.success) {
        set({ submissions: response.data.data.submissions });
        console.log('✅ Org submissions fetched:', response.data.data.submissions.length);
      }
    } catch (error) {
      console.error('❌ Fetch org submissions error:', error);
    } finally {
      set({ isLoadingSubmissions: false });
    }
  },
  
  // 🔥 ADDED: Fetch all submissions (alias for fetchSubmissions)
  fetchAllSubmissions: async () => {
    return get().fetchSubmissions();
  },
  
  addSubmission: (submission: MonthlySubmission) => {
    set((state) => ({
      submissions: [...state.submissions, submission]
    }));
    console.log('✅ Submission added:', submission);
  },
  
  getSubmissionsByOrg: (orgId: string) => {
    return get().submissions.filter(s => s.organizationId === orgId);
  },
  
  getAllSubmissions: () => {
    return get().submissions;
  },
  
  // 🔥 APPROVE SUBMISSION WITH API
  approveSubmission: async (submissionId: string, comments?: string) => {
    try {
      const response = await submissionsAPI.approve(submissionId, comments);
      
      if (response.data.success) {
        // Update local state
        set((state) => ({
          submissions: state.submissions.map(sub => 
            sub.id === submissionId 
              ? { 
                  ...sub, 
                  status: 'APPROVED' as SubmissionStatus, // 🔥 UPPERCASE
                  comments,
                  approvedAt: new Date(),
                  approvedBy: state.currentUser?.name || 'Admin',
                  reviewNotes: comments || null,
                }
              : sub
          )
        }));
        
        console.log('✅ Submission approved:', submissionId);
        
        // Add notification
        get().addNotification({
          title: 'Submission Approved',
          message: 'The submission has been approved successfully.',
          type: 'success',
          userId: 'system'
        });
      }
    } catch (error) {
      console.error('❌ Approve submission error:', error);
      get().addNotification({
        title: 'Error',
        message: 'Failed to approve submission.',
        type: 'error',
        userId: 'system'
      });
    }
  },
  
  // 🔥 REJECT SUBMISSION WITH API
  rejectSubmission: async (submissionId: string, reason: string) => {
    try {
      const response = await submissionsAPI.reject(submissionId, reason);
      
      if (response.data.success) {
        // Update local state
        set((state) => ({
          submissions: state.submissions.map(sub => 
            sub.id === submissionId 
              ? { 
                  ...sub, 
                  status: 'REJECTED' as SubmissionStatus, // 🔥 UPPERCASE
                  rejectionReason: reason,
                  comments: reason,
                  reviewNotes: reason,
                }
              : sub
          )
        }));
        
        console.log('✅ Submission rejected:', submissionId);
        
        // Add notification
        get().addNotification({
          title: 'Submission Rejected',
          message: 'The submission has been rejected.',
          type: 'warning',
          userId: 'system'
        });
      }
    } catch (error) {
      console.error('❌ Reject submission error:', error);
      get().addNotification({
        title: 'Error',
        message: 'Failed to reject submission.',
        type: 'error',
        userId: 'system'
      });
    }
  },
  
  updateSubmissionStatus: (submissionId: string, status: SubmissionStatus, data?: any) => {
    set((state) => ({
      submissions: state.submissions.map(sub => 
        sub.id === submissionId 
          ? { ...sub, status, ...data }
          : sub
      )
    }));
  },
  
  // Dashboard Stats
  dashboardStats: null,
  isLoadingDashboard: false,
  
  // 🔥 FETCH DASHBOARD STATS FROM API
  fetchDashboardStats: async () => {
    set({ isLoadingDashboard: true });
    try {
      const user = get().currentUser;
      
      // Admin gets admin dashboard stats
      if (user?.role === 'fia_admin') {
        const response = await adminAPI.getDashboardStats();
        if (response.data.success) {
          set({ dashboardStats: response.data.data.stats });
          console.log('✅ Admin dashboard stats fetched');
        }
      } else {
        // Organizations get submission dashboard stats
        const response = await submissionsAPI.getDashboardStats();
        if (response.data.success) {
          set({ dashboardStats: response.data.data });
          console.log('✅ Dashboard stats fetched');
        }
      }
    } catch (error) {
      console.error('❌ Fetch dashboard stats error:', error);
    } finally {
      set({ isLoadingDashboard: false });
    }
  },
  
  // Notifications
  notifications: [],
  unreadCount: 0,
  
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      createdAt: new Date(),
      read: false
    };
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));
  },
  
  // UI State
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  // 🔥 ADDED: Set loading state
  setLoading: (loading: boolean) => {
    set({ isLoadingOrganizations: loading });
  },
}));

export { useNotificationStore };

// 🔥 Initialize auth from localStorage on app load
const initializeAuth = async () => {
  const token = localStorage.getItem('accessToken');
  
  if (token) {
    try {
      const response = await authAPI.getCurrentUser();
      
      if (response.data.success) {
        const user = response.data.data.user;
        
        const mappedUser: User = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role.toLowerCase(),
          organizationId: user.organizationId,
          organization: user.organization,
          createdAt: new Date(user.createdAt),
          isActive: user.isActive,
        };
        
        useAppStore.setState({ 
          currentUser: mappedUser, 
          isAuthenticated: true,
          isCheckingAuth: false
        });
        
        console.log('✅ Auth restored from token');
      }
    } catch (error) {
      console.log('❌ Token invalid, clearing auth');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      useAppStore.setState({ 
        isCheckingAuth: false
      });
    }
  } else {
    useAppStore.setState({ 
      isCheckingAuth: false
    });
  }
};

// Run on app load
initializeAuth();