export type UserRole = 'admin' | 'project_manager' | 'editor' | 'viewer';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  company?: string;
  phone?: string;
}

export type ProjectStatus = 'active' | 'completed' | 'archived' | 'paused';

export interface Project {
  id: string;
  code: string;
  name: string;
  owner_name: string;
  contractor_name: string;
  consultant_name: string;
  location: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  project_manager: string;
  site_manager: string;
  recorder_name?: string;
  inspector_name?: string;
  status: ProjectStatus;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export interface JobRole {
  id: string;
  project_id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailyManpower {
  id: string;
  project_id: string;
  job_role_id: string;
  work_date: string; // YYYY-MM-DD
  worker_count: number;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DailyReportNarrative {
  project_id: string;
  work_date: string; // YYYY-MM-DD
  rencana_m6: string;
  realisasi_m6: string;
  deviasi_m6: string;
  pekerjaan: string;
  peralatan: string;
  kendala: string;
  cuaca: string;
  material_masuk: string;
  saran: string;
  updated_at: string;
}

export interface MatrixRow {
  roleId: string;
  roleName: string;
  sortOrder: number;
  isActive: boolean;
  countsByDate: Record<string, number>; // date -> count
  notesByDate: Record<string, string>;
  totalManDays: number;
  averagePerDay: number;
}

export interface MatrixSummary {
  dates: string[]; // List of YYYY-MM-DD in range
  rows: MatrixRow[];
  dailyTotals: Record<string, number>; // date -> sum of all roles
  dailyRecordedFlags: Record<string, boolean>; // whether date has at least 1 record
  grandTotalManDays: number;
  grandAveragePerDay: number;
  calendarDaysCount: number;
  peakManpower: number;
  peakDates: string[];
  missingDates: string[]; // dates in period with no records
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'warning' | 'info' | 'success';
  date: string;
  is_read: boolean;
  project_id?: string;
  created_at: string;
}

export interface DriveDocumentationPhoto {
  id: string;
  project_id: string;
  work_date: string;
  file_name: string;
  file_size?: number;
  mime_type: string;
  google_drive_file_id?: string;
  web_view_link?: string;
  thumbnail_link?: string;
  data_url?: string;
  caption?: string;
  uploaded_at: string;
}

export interface AppSettings {
  appName: string;
  appSubtitle: string;
  companyName: string;
  defaultPeriodDays: number;
  dateFormat: string;
  timeZone: string;
  autoSaveDraft: boolean;
}

export interface SupabaseConfig {
  url: string;
  publishableKey: string;
  isConnected: boolean;
}

export interface GoogleIntegrationSettings {
  driveFolderName: string;
  autoCompressPhotos: boolean;
  photoNamingPrefix: string;
  sheetsIncludeProjectHeader: boolean;
  sheetsIncludeSummaryRow: boolean;
  sheetsNumberFormatId: boolean;
  autoOpenSpreadsheetAfterExport: boolean;
  allowedEmail: string;
}
