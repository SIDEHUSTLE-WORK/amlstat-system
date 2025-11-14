import { create } from 'zustand';
import { useNotificationStore } from './notificationStore';
import type { 
  User, 
  Organization, 
  MonthlySubmission,
  DashboardStats, 
  Notification,
} from '../types';

interface AppState {
  // Authentication
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // Organizations
  organizations: Organization[];
  selectedOrganization: Organization | null;
  selectOrganization: (org: Organization | null) => void;
  
  // Submissions
  submissions: MonthlySubmission[];
  addSubmission: (submission: MonthlySubmission) => void;
  getSubmissionsByOrg: (orgId: string) => MonthlySubmission[];
  getAllSubmissions: () => MonthlySubmission[];
  
  // 🔥 NEW: Approval/Rejection functions
  approveSubmission: (submissionId: string, comments?: string) => void;
  rejectSubmission: (submissionId: string, reason: string) => void;
  updateSubmissionStatus: (submissionId: string, status: string, data?: any) => void;
  
  // Dashboard Stats
  dashboardStats: DashboardStats;
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  
  // UI State
  sidebarOpen: boolean;
  toggleSidebar: () => void;
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
    primary: '#4f46e5', // Indigo
    secondary: '#7c3aed', // Violet
    accent: '#3b82f6', // Blue
    light: 'bg-gradient-to-r from-blue-50 to-indigo-50',
    text: 'text-blue-900'
  },
  'CMA': { 
    gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
    gradientHover: 'from-violet-700 via-purple-700 to-fuchsia-700',
    primary: '#9333ea', // Purple
    secondary: '#c026d3', // Fuchsia
    accent: '#a855f7', // Purple
    light: 'bg-gradient-to-r from-violet-50 to-fuchsia-50',
    text: 'text-purple-900'
  },
  'IRA': { 
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    gradientHover: 'from-emerald-600 via-teal-600 to-cyan-700',
    primary: '#14b8a6', // Teal
    secondary: '#06b6d4', // Cyan
    accent: '#10b981', // Emerald
    light: 'bg-gradient-to-r from-emerald-50 to-teal-50',
    text: 'text-teal-900'
  },
  'UMRA': { 
    gradient: 'from-cyan-500 via-blue-500 to-indigo-600',
    gradientHover: 'from-cyan-600 via-blue-600 to-indigo-700',
    primary: '#0891b2', // Cyan
    secondary: '#3b82f6', // Blue
    accent: '#4f46e5', // Indigo
    light: 'bg-gradient-to-r from-cyan-50 to-blue-50',
    text: 'text-cyan-900'
  },
  'URSB': { 
    gradient: 'from-indigo-600 via-blue-600 to-sky-500',
    gradientHover: 'from-indigo-700 via-blue-700 to-sky-600',
    primary: '#4f46e5', // Indigo
    secondary: '#0ea5e9', // Sky
    accent: '#3b82f6', // Blue
    light: 'bg-gradient-to-r from-indigo-50 to-sky-50',
    text: 'text-indigo-900'
  },
  'NLGRB': { 
    gradient: 'from-sky-500 via-cyan-500 to-teal-500',
    gradientHover: 'from-sky-600 via-cyan-600 to-teal-600',
    primary: '#0ea5e9', // Sky
    secondary: '#14b8a6', // Teal
    accent: '#06b6d4', // Cyan
    light: 'bg-gradient-to-r from-sky-50 to-teal-50',
    text: 'text-sky-900'
  },
  'MEMD': { 
    gradient: 'from-green-600 via-emerald-600 to-teal-600',
    gradientHover: 'from-green-700 via-emerald-700 to-teal-700',
    primary: '#16a34a', // Green
    secondary: '#14b8a6', // Teal
    accent: '#10b981', // Emerald
    light: 'bg-gradient-to-r from-green-50 to-emerald-50',
    text: 'text-green-900'
  },
  'ICPAU': { 
    gradient: 'from-orange-600 via-amber-600 to-yellow-500',
    gradientHover: 'from-orange-700 via-amber-700 to-yellow-600',
    primary: '#ea580c', // Orange
    secondary: '#f59e0b', // Amber
    accent: '#eab308', // Yellow
    light: 'bg-gradient-to-r from-orange-50 to-yellow-50',
    text: 'text-orange-900'
  },
  'ULC': { 
    gradient: 'from-purple-600 via-fuchsia-600 to-pink-600',
    gradientHover: 'from-purple-700 via-fuchsia-700 to-pink-700',
    primary: '#9333ea', // Purple
    secondary: '#ec4899', // Pink
    accent: '#c026d3', // Fuchsia
    light: 'bg-gradient-to-r from-purple-50 to-pink-50',
    text: 'text-purple-900'
  },
  'NGO_BUREAU': { 
    gradient: 'from-teal-600 via-emerald-600 to-green-600',
    gradientHover: 'from-teal-700 via-emerald-700 to-green-700',
    primary: '#0d9488', // Teal
    secondary: '#16a34a', // Green
    accent: '#10b981', // Emerald
    light: 'bg-gradient-to-r from-teal-50 to-green-50',
    text: 'text-teal-900'
  },
  'FIA': { 
    gradient: 'from-fia-navy via-fia-teal to-fia-navy',
    gradientHover: 'from-fia-navy-dark via-fia-teal-dark to-fia-navy-dark',
    primary: '#1C3D5A', // FIA Navy
    secondary: '#2C7A7B', // FIA Teal
    accent: '#D4AF37', // FIA Gold
    light: 'bg-gradient-to-r from-fia-navy/5 to-fia-teal/5',
    text: 'text-fia-navy'
  },
  'CID': { 
    gradient: 'from-red-700 via-rose-700 to-pink-700',
    gradientHover: 'from-red-800 via-rose-800 to-pink-800',
    primary: '#be123c', // Rose
    secondary: '#e11d48', // Rose
    accent: '#dc2626', // Red
    light: 'bg-gradient-to-r from-red-50 to-rose-50',
    text: 'text-red-900'
  },
  'IG': { 
    gradient: 'from-rose-600 via-pink-600 to-fuchsia-600',
    gradientHover: 'from-rose-700 via-pink-700 to-fuchsia-700',
    primary: '#e11d48', // Rose
    secondary: '#c026d3', // Fuchsia
    accent: '#ec4899', // Pink
    light: 'bg-gradient-to-r from-rose-50 to-fuchsia-50',
    text: 'text-rose-900'
  },
  'UWA': { 
    gradient: 'from-lime-600 via-green-600 to-emerald-700',
    gradientHover: 'from-lime-700 via-green-700 to-emerald-800',
    primary: '#16a34a', // Green
    secondary: '#10b981', // Emerald
    accent: '#84cc16', // Lime
    light: 'bg-gradient-to-r from-lime-50 to-emerald-50',
    text: 'text-green-900'
  },
  'URA': { 
    gradient: 'from-red-600 via-orange-600 to-amber-600',
    gradientHover: 'from-red-700 via-orange-700 to-amber-700',
    primary: '#dc2626', // Red
    secondary: '#f97316', // Orange
    accent: '#f59e0b', // Amber
    light: 'bg-gradient-to-r from-red-50 to-amber-50',
    text: 'text-red-900'
  },
  'ODPP': { 
    gradient: 'from-amber-600 via-orange-600 to-red-600',
    gradientHover: 'from-amber-700 via-orange-700 to-red-700',
    primary: '#f59e0b', // Amber
    secondary: '#dc2626', // Red
    accent: '#f97316', // Orange
    light: 'bg-gradient-to-r from-amber-50 to-orange-50',
    text: 'text-amber-900'
  },
  'INTERPOL': { 
    gradient: 'from-cyan-700 via-blue-700 to-indigo-800',
    gradientHover: 'from-cyan-800 via-blue-800 to-indigo-900',
    primary: '#0e7490', // Cyan
    secondary: '#1e40af', // Blue
    accent: '#4338ca', // Indigo
    light: 'bg-gradient-to-r from-cyan-50 to-indigo-50',
    text: 'text-cyan-900'
  },
};

// Helper to get theme
export const getOrgTheme = (orgCode: string) => {
  return orgThemes[orgCode] || orgThemes['FIA'];
};

// ================================
// MOCK DATA - 17 ORGANIZATIONS
// ================================
const mockOrganizations: Organization[] = [
  {
    id: 'org-1',
    code: 'BOU',
    name: 'Bank of Uganda',
    type: 'regulator',
    email: 'statistics@bou.or.ug',
    phone: '+256 414 258 441',
    contactPerson: 'Dr. Michael Atingi-Ego',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    totalSubmissions: 6,
    completedSubmissions: 5,
    pendingSubmissions: 1,
    overdueSubmissions: 0,
    complianceScore: 95,
    lastSubmissionDate: new Date('2024-11-05')
  },
  {
    id: 'org-2',
    code: 'CMA',
    name: 'Capital Markets Authority',
    type: 'regulator',
    email: 'statistics@cmauganda.co.ug',
    phone: '+256 414 233 520',
    contactPerson: 'Keith Kalyegira',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    totalSubmissions: 6,
    completedSubmissions: 5,
    pendingSubmissions: 1,
    overdueSubmissions: 0,
    complianceScore: 92,
    lastSubmissionDate: new Date('2024-11-04')
  },
  {
    id: 'org-3',
    code: 'IRA',
    name: 'Insurance Regulatory Authority',
    type: 'regulator',
    email: 'statistics@ira.go.ug',
    phone: '+256 414 343 801',
    contactPerson: 'Ibrahim Kaddunabbi Lubega',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    totalSubmissions: 6,
    completedSubmissions: 4,
    pendingSubmissions: 1,
    overdueSubmissions: 1,
    complianceScore: 85,
    lastSubmissionDate: new Date('2024-10-28')
  },
  {
    id: 'org-4',
    code: 'UMRA',
    name: 'Uganda Microfinance Regulatory Authority',
    type: 'regulator',
    email: 'statistics@umra.go.ug',
    phone: '+256 414 233 520',
    contactPerson: 'Patrick Mweheire',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    totalSubmissions: 6,
    completedSubmissions: 5,
    pendingSubmissions: 1,
    overdueSubmissions: 0,
    complianceScore: 94,
    lastSubmissionDate: new Date('2024-11-03')
  },
  {
    id: 'org-5',
    code: 'URSB',
    name: 'Uganda Registration Services Bureau',
    type: 'regulator',
    email: 'statistics@ursb.go.ug',
    phone: '+256 417 338 000',
    contactPerson: 'Mercy Kainobwisho',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    totalSubmissions: 6,
    completedSubmissions: 4,
    pendingSubmissions: 2,
    overdueSubmissions: 0,
    complianceScore: 88,
    lastSubmissionDate: new Date('2024-10-30')
  },
  {
    id: 'org-6',
    code: 'NLGRB',
    name: 'National Lotteries and Gaming Regulatory Board',
    type: 'regulator',
    email: 'statistics@nlgrb.go.ug',
    phone: '+256 414 343 950',
    contactPerson: 'James Odongo',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    totalSubmissions: 6,
    completedSubmissions: 5,
    pendingSubmissions: 1,
    overdueSubmissions: 0,
    complianceScore: 91,
    lastSubmissionDate: new Date('2024-11-02')
  },
  {
    id: 'org-7',
    code: 'MEMD',
    name: 'Ministry of Energy and Mineral Development',
    type: 'ministry',
    email: 'statistics@memd.go.ug',
    phone: '+256 414 234 000',
    contactPerson: 'Robert Kasande',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    totalSubmissions: 6,
    completedSubmissions: 5,
    pendingSubmissions: 1,
    overdueSubmissions: 0,
    complianceScore: 90,
    lastSubmissionDate: new Date('2024-11-01')
  },
  {
    id: 'org-8',
    code: 'ICPAU',
    name: 'Institute of Certified Public Accountants of Uganda',
    type: 'professional',
    email: 'statistics@icpau.co.ug',
    phone: '+256 414 250 839',
    contactPerson: 'Dr. Sam Walyemera',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    totalSubmissions: 6,
    completedSubmissions: 4,
    pendingSubmissions: 2,
    overdueSubmissions: 0,
    complianceScore: 87,
    lastSubmissionDate: new Date('2024-10-29')
  },
  {
    id: 'org-9',
    code: 'ULC',
    name: 'Uganda Law Council',
    type: 'professional',
    email: 'statistics@ulc.go.ug',
    phone: '+256 414 348 007',
    contactPerson: 'Simon Peter Kinobe',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    totalSubmissions: 6,
    completedSubmissions: 5,
    pendingSubmissions: 1,
    overdueSubmissions: 0,
    complianceScore: 93,
    lastSubmissionDate: new Date('2024-11-06')
  },
  {
    id: 'org-10',
    code: 'NGO_BUREAU',
    name: 'NGO Bureau',
    type: 'regulator',
    email: 'statistics@ngobureau.go.ug',
    phone: '+256 414 347 854',
    contactPerson: 'Stephen Okello',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    totalSubmissions: 6,
    completedSubmissions: 5,
    pendingSubmissions: 1,
    overdueSubmissions: 0,
    complianceScore: 89,
    lastSubmissionDate: new Date('2024-10-31')
  },
  {
    id: 'org-11',
    code: 'FIA',
    name: 'Financial Intelligence Authority',
    type: 'fia',
    email: 'statistics@fia.go.ug',
    phone: '+256 414 342 222',
    contactPerson: 'Sydney Asubo',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    totalSubmissions: 6,
    completedSubmissions: 6,
    pendingSubmissions: 0,
    overdueSubmissions: 0,
    complianceScore: 100,
    lastSubmissionDate: new Date('2024-11-07')
  },
  {
    id: 'org-12',
    code: 'CID',
    name: 'Criminal Investigations Department',
    type: 'law_enforcement',
    email: 'statistics@cid.go.ug',
    phone: '+256 414 343 222',
    contactPerson: 'Tom Magambo',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    totalSubmissions: 6,
    completedSubmissions: 4,
    pendingSubmissions: 2,
    overdueSubmissions: 0,
    complianceScore: 86,
    lastSubmissionDate: new Date('2024-10-27')
  },
  {
    id: 'org-13',
    code: 'IG',
    name: 'Inspector General of Government',
    type: 'law_enforcement',
    email: 'statistics@igg.go.ug',
    phone: '+256 414 231 724',
    contactPerson: 'Beti Kamya',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    totalSubmissions: 6,
    completedSubmissions: 5,
    pendingSubmissions: 1,
    overdueSubmissions: 0,
    complianceScore: 92,
    lastSubmissionDate: new Date('2024-11-05')
  },
  {
    id: 'org-14',
    code: 'UWA',
    name: 'Uganda Wildlife Authority',
    type: 'law_enforcement',
    email: 'statistics@ugandawildlife.org',
    phone: '+256 414 355 000',
    contactPerson: 'Sam Mwandha',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    totalSubmissions: 6,
    completedSubmissions: 3,
    pendingSubmissions: 1,
    overdueSubmissions: 2,
    complianceScore: 72,
    lastSubmissionDate: new Date('2024-09-30')
  },
  {
    id: 'org-15',
    code: 'URA',
    name: 'Uganda Revenue Authority',
    type: 'law_enforcement',
    email: 'statistics@ura.go.ug',
    phone: '+256 417 117 000',
    contactPerson: 'John Musinguzi Rujoki',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    totalSubmissions: 6,
    completedSubmissions: 5,
    pendingSubmissions: 1,
    overdueSubmissions: 0,
    complianceScore: 94,
    lastSubmissionDate: new Date('2024-11-06')
  },
  {
    id: 'org-16',
    code: 'ODPP',
    name: 'Office of the Director of Public Prosecutions',
    type: 'prosecution',
    email: 'statistics@odpp.go.ug',
    phone: '+256 414 230 538',
    contactPerson: 'Jane Frances Abodo',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    totalSubmissions: 6,
    completedSubmissions: 5,
    pendingSubmissions: 1,
    overdueSubmissions: 0,
    complianceScore: 91,
    lastSubmissionDate: new Date('2024-11-04')
  },
  {
    id: 'org-17',
    code: 'INTERPOL',
    name: 'Interpol Uganda',
    type: 'international',
    email: 'statistics@interpol.go.ug',
    phone: '+256 414 342 555',
    contactPerson: 'Christopher Ddamulira',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    totalSubmissions: 6,
    completedSubmissions: 4,
    pendingSubmissions: 2,
    overdueSubmissions: 0,
    complianceScore: 88,
    lastSubmissionDate: new Date('2024-10-30')
  },
];

// ================================
// ZUSTAND STORE
// ================================
export const useAppStore = create<AppState>((set, get) => ({
  // Authentication
  currentUser: null,
  isAuthenticated: false,
  
  login: async (email: string, password: string) => {
    console.log('Attempting login:', email);
    
    let user: User | null = null;
    
    // FIA Admin
    if (email === 'admin@fia.go.ug' && password === 'admin123') {
      user = {
        id: 'user-admin',
        email,
        name: 'FIA Administrator',
        role: 'fia_admin',
        createdAt: new Date(),
        isActive: true,
      };
      console.log('Admin login successful');
    }
    // BOU Test
    else if (email === 'user@bou.go.ug' && password === 'password123') {
      const org = mockOrganizations[0];
      user = {
        id: 'user-bou',
        email,
        name: 'Bank of Uganda - Officer',
        role: 'org_admin',
        organizationId: org.id,
        organization: org,
        createdAt: new Date(),
        isActive: true,
      };
      console.log('BOU login successful');
    }
    // Any other organization
    else {
      const org = mockOrganizations.find(o => {
        const orgEmail = `user@${o.code.toLowerCase()}.go.ug`;
        return email === orgEmail && password === 'password123';
      });
      
      if (org) {
        user = {
          id: `user-${org.code}`,
          email,
          name: `${org.name} - Officer`,
          role: 'org_admin',
          organizationId: org.id,
          organization: org,
          createdAt: new Date(),
          isActive: true,
        };
        console.log('Org login successful:', org.name);
      }
    }
    
    if (user) {
      set({ currentUser: user, isAuthenticated: true });
      return true;
    }
    
    console.log('Login failed');
    return false;
  },
  
  logout: () => {
    set({ 
      currentUser: null, 
      isAuthenticated: false,
      selectedOrganization: null,
    });
  },
  
  // Organizations
  organizations: mockOrganizations,
  selectedOrganization: null,
  selectOrganization: (org) => set({ selectedOrganization: org }),
  
  // Submissions
  submissions: [],
  
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
  
  // 🔥 NEW: APPROVE SUBMISSION
  approveSubmission: (submissionId: string, comments?: string) => {
    set((state) => {
      const updatedSubmissions = state.submissions.map(sub => 
        sub.id === submissionId 
          ? { 
              ...sub, 
              status: 'approved' as const, 
              comments,
              approvedAt: new Date(),
              approvedBy: state.currentUser?.name || 'Admin'
            }
          : sub
      );
      
      console.log('✅ Submission approved:', submissionId);
      
      // Add notification
      const submission = state.submissions.find(s => s.id === submissionId);
      if (submission) {
        get().addNotification({
          title: 'Submission Approved',
          message: `Your submission for ${new Date(submission.year, submission.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} has been approved.`,
          type: 'success', userId: 'system'
        });
      }
      
      return { submissions: updatedSubmissions };
    });
  },
  
  // 🔥 NEW: REJECT SUBMISSION
  rejectSubmission: (submissionId: string, reason: string) => {
    set((state) => {
      const updatedSubmissions = state.submissions.map(sub => 
        sub.id === submissionId 
          ? { 
              ...sub, 
              status: 'rejected' as const, 
              rejectionReason: reason,
              comments: reason
            }
          : sub
      );
      
      console.log('❌ Submission rejected:', submissionId);
      
      // Add notification
      const submission = state.submissions.find(s => s.id === submissionId);
      if (submission) {
        get().addNotification({
          title: 'Submission Rejected',
          message: `Your submission for ${new Date(submission.year, submission.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} has been rejected. Reason: ${reason}`,
          type: 'error', userId: 'system'
        });
      }
      
      return { submissions: updatedSubmissions };
    });
  },
  
  // 🔥 NEW: UPDATE SUBMISSION STATUS (General)
  updateSubmissionStatus: (submissionId: string, status: string, data?: any) => {
    set((state) => {
      const updatedSubmissions = state.submissions.map(sub => 
        sub.id === submissionId 
          ? { ...sub, status: status as any, ...data }
          : sub
      );
      
      console.log('🔄 Submission status updated:', submissionId, status);
      
      return { submissions: updatedSubmissions };
    });
  },
  
  // Dashboard Stats
  dashboardStats: {
    totalOrganizations: 17,
    activeOrganizations: 17,
    totalSubmissions: 102,
    pendingSubmissions: 21,
    completedSubmissions: 80,
    overdueSubmissions: 1,
    averageComplianceRate: 90.2,
    currentMonth: 'December 2024',
    currentMonthSubmissions: 0,
    currentMonthPending: 17,
  },
  
  // Notifications
  notifications: [],
  unreadCount: 0,
  
  // 🔥 NEW: ADD NOTIFICATION
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
    
    console.log('🔔 Notification added:', newNotification);
  },
  
  // UI State
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));

export { useNotificationStore };