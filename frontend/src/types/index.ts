export interface User {
  id: string;
  email: string;
  name: string;
  role: 'fia_admin' | 'org_admin' | 'org_user';
  organizationId?: string;
  organization?: Organization;
  createdAt: Date;
  isActive: boolean;
}

export interface Organization {
  id: string;
  code: string;
  name: string;
  type: 'regulator' | 'ministry' | 'professional' | 'law_enforcement' | 'prosecution' | 'international' | 'fia';
  email: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  isActive: boolean;
  createdAt: Date;
  totalSubmissions: number;
  completedSubmissions: number;
  pendingSubmissions: number;
  overdueSubmissions: number;
  complianceScore: number;
  lastSubmissionDate?: Date;
}

// Monthly Submission
export interface MonthlySubmission {
  id: string;
  organizationId: string;
  organization?: Organization;
  month: number; // 1-12
  year: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  
  // Submission data
  indicators: IndicatorData[];
  totalIndicators: number;
  filledIndicators: number;
  completionRate: number;
  
  // Metadata
  submittedBy: string;
  submittedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  comments?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// Indicator data structure
export interface IndicatorData {
  section: string; // e.g., "A"
  number: string; // e.g., "1.1"
  description: string;
  value: string | number;
  required: boolean;
}

export interface DashboardStats {
  totalOrganizations: number;
  activeOrganizations: number;
  totalSubmissions: number;
  pendingSubmissions: number;
  completedSubmissions: number;
  overdueSubmissions: number;
  averageComplianceRate: number;
  currentMonth: string;
  currentMonthSubmissions: number;
  currentMonthPending: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

