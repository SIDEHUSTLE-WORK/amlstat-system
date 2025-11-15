// frontend/src/types/index.ts

// ================================
// ENUMS (matching Prisma schema)
// ================================
export type UserRole = 'FIA_ADMIN' | 'ORG_ADMIN' | 'ORG_USER';

export type OrgType = 
  | 'REGULATOR'           // BOU, CMA, IRA, UMRA, URSB, NLGRB, NGO_BUREAU
  | 'MINISTRY'            // MEMD
  | 'PROFESSIONAL'        // ICPAU, ULC
  | 'FIA'                 // FIA itself
  | 'LAW_ENFORCEMENT'     // CID, IG, UWA, URA
  | 'PROSECUTION'         // ODPP
  | 'INTERNATIONAL';      // INTERPOL

export type SubmissionStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED';

export type ConversationType = 'ADMIN_TO_ORG' | 'ORG_TO_ORG';

export type SenderType = 'ADMIN' | 'ORGANIZATION';

export type MessageType = 'TEXT' | 'FILE' | 'IMAGE' | 'AUDIO';

export type FileType = 'IMAGE' | 'PDF' | 'DOCUMENT' | 'EXCEL' | 'AUDIO' | 'VIDEO';

export type NotificationType = 
  | 'SUBMISSION_DUE'
  | 'SUBMISSION_OVERDUE'
  | 'SUBMISSION_APPROVED'
  | 'SUBMISSION_REJECTED'
  | 'NEW_MESSAGE'
  | 'SYSTEM_ALERT'
  | 'COMPLIANCE_WARNING';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// ================================
// USER
// ================================
export interface User {
  id: string;
  email: string;
  name: string;
  role: string; // Will be lowercase from backend: 'fia_admin' | 'org_admin' | 'org_user'
  organizationId?: string | null;
  organization?: Organization;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  lastLogin?: Date | null;
}

// ================================
// ORGANIZATION
// ================================
export interface Organization {
  id: string;
  code: string;
  name: string;
  type: OrgType;
  sector?: string | null;
  registrationNo?: string | null;
  contactEmail: string;
  contactPhone?: string | null;
  address?: string | null;
  isActive: boolean;
  complianceScore: number;
  completedSubmissions: number;
  pendingSubmissions: number;
  overdueSubmissions: number;
  lastSubmissionDate?: Date | null;
  createdAt: Date;
  updatedAt?: Date;
  
  // Relations
  submissions?: MonthlySubmission[];
  users?: User[];
  
  // Calculated fields
  totalSubmissions?: number;
  
  // Legacy fields (for backward compatibility)
  email?: string; // Same as contactEmail
  phone?: string; // Same as contactPhone
  contactPerson?: string;
}

// ================================
// SUBMISSION
// ================================
export interface MonthlySubmission {
  id: string;
  organizationId: string;
  month: number; // 1-12
  year: number;
  status: SubmissionStatus;
  indicators: any; // JSON field - can be IndicatorData[] or Record<string, any>
  totalIndicators: number;
  filledIndicators: number;
  completionRate: number;
  submittedBy?: string | null;
  submittedAt?: Date | null;
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
  reviewNotes?: string | null; // 🔥 ADDED THIS
  createdAt: Date;
  updatedAt?: Date;
  
  // Relations
  organization?: Organization;
  submitter?: User;
  reviewer?: User;
  
  // Legacy fields (for backward compatibility)
  approvedBy?: string;
  approvedAt?: Date;
  comments?: string;
  rejectionReason?: string;
}

// ================================
// INDICATOR DATA
// ================================
export interface IndicatorData {
  section: string; // e.g., "A"
  number: string; // e.g., "1.1"
  description: string;
  value: string | number;
  required: boolean;
  category?: string;
}

// ================================
// DASHBOARD STATS
// ================================
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
  currentMonthNumber?: number;
  currentYear?: number;
}

// ================================
// NOTIFICATION
// ================================
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType | 'info' | 'warning' | 'error' | 'success'; // Support both
  title: string;
  message: string;
  priority?: Priority;
  metadata?: any;
  read: boolean;
  readAt?: Date | null;
  createdAt: Date;
  actionUrl?: string;
}

// ================================
// CHAT/MESSAGING
// ================================
export interface Conversation {
  id: string;
  type: ConversationType;
  participants: any; // JSON field
  createdAt: Date;
  updatedAt?: Date;
  lastMessageAt: Date;
  messages?: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: SenderType;
  senderOrgCode?: string | null;
  content: string;
  messageType: MessageType;
  readBy: any; // JSON field
  createdAt: Date;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  messageId: string;
  fileName: string;
  fileType: FileType;
  fileUrl: string;
  fileSize: number;
  uploadedAt: Date;
}

// ================================
// AUDIT LOG
// ================================
export interface AuditLog {
  id: string;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
}

// ================================
// API RESPONSE TYPES
// ================================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ================================
// FORM/INPUT TYPES
// ================================
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  organizationId?: string;
}

export interface CreateOrganizationData {
  code: string;
  name: string;
  type: OrgType;
  sector?: string;
  registrationNo?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
}

export interface CreateSubmissionData {
  organizationId: string;
  month: number;
  year: number;
  indicators: any;
}

export interface UpdateSubmissionData {
  indicators?: any;
  status?: SubmissionStatus;
}

// ================================
// FILTER/QUERY TYPES
// ================================
export interface SubmissionFilters {
  organizationId?: string;
  month?: number;
  year?: number;
  status?: SubmissionStatus;
  page?: number;
  limit?: number;
}

export interface OrganizationFilters {
  type?: OrgType;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}