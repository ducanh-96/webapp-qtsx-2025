// User Types
export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  department?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
}

export interface UserProfile extends User {
  phoneNumber?: string;
  jobTitle?: string;
  bio?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationSettings;
  dashboard: DashboardSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  documentUpdates: boolean;
  systemAlerts: boolean;
}

export interface DashboardSettings {
  layout: 'grid' | 'list';
  itemsPerPage: number;
  defaultView: 'documents' | 'analytics' | 'users';
}

// Document Types
export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  mimeType: string;
  size: number;
  url: string;
  googleFileId?: string;
  folderId?: string;
  ownerId: string;
  sharedWith: string[];
  permissions: DocumentPermission[];
  tags: string[];
  description?: string;
  version: number;
  versions: DocumentVersion[];
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
  metadata: DocumentMetadata;
}

export enum DocumentType {
  DOCUMENT = 'document',
  SPREADSHEET = 'spreadsheet',
  PRESENTATION = 'presentation',
  PDF = 'pdf',
  IMAGE = 'image',
  VIDEO = 'video',
  OTHER = 'other',
}

export interface DocumentVersion {
  id: string;
  version: number;
  url: string;
  size: number;
  createdAt: Date;
  createdBy: string;
  changes?: string;
}

export interface DocumentPermission {
  userId: string;
  role: 'viewer' | 'editor' | 'owner';
  grantedAt: Date;
  grantedBy: string;
}

export interface DocumentMetadata {
  [key: string]: string | number | boolean | Date;
}

// Folder Types
export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  path: string;
  ownerId: string;
  sharedWith: string[];
  permissions: DocumentPermission[];
  documentCount: number;
  subfolderCount: number;
  createdAt: Date;
  updatedAt: Date;
  googleFolderId?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Google API Types
export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  modifiedTime: string;
  owners: GoogleDriveUser[];
  parents?: string[];
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
}

export interface GoogleDriveUser {
  kind: string;
  displayName: string;
  photoLink?: string;
  me?: boolean;
  permissionId: string;
  emailAddress: string;
}

export interface GoogleSheetsData {
  range: string;
  majorDimension: string;
  values: string[][];
}

// Authentication Types
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData extends LoginCredentials {
  displayName: string;
  confirmPassword: string;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
  };
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// State Management Types
export interface AppState {
  auth: AuthState;
  documents: DocumentState;
  users: UserState;
  ui: UIState;
}

export interface DocumentState {
  documents: Document[];
  folders: Folder[];
  currentFolder: Folder | null;
  selectedDocuments: string[];
  loading: boolean;
  error: string | null;
}

export interface UserState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  modals: {
    [key: string]: boolean;
  };
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  type: 'primary' | 'secondary';
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps extends BaseComponentProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}