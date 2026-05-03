// ============================================================================
// BarrioConecta — Shared Contracts
// DTOs, enums, and request/response types shared between frontend and backend.
// ============================================================================

// --- Enums ---

export type UserRole = 'merchant' | 'admin' | 'neighbor';

export type ReportTargetType = 'business' | 'review';

export type ReportReason = 'spam' | 'false_info' | 'inappropriate' | 'other';

export type ReportStatus = 'NEW' | 'IN_REVIEW' | 'RESOLVED';

export type SearchRadius = 500 | 1000 | 2000;

// --- Domain Types ---

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface BusinessSchedule {
  open: string;
  close: string;
}

export interface BusinessScheduleWeek {
  mon: BusinessSchedule;
  tue: BusinessSchedule;
  wed: BusinessSchedule;
  thu: BusinessSchedule;
  fri: BusinessSchedule;
  sat: BusinessSchedule;
  sun: BusinessSchedule;
}

export interface Business {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  ownerId: string;
  location: { lat: number; lng: number };
  photos: string[];
  schedule: BusinessScheduleWeek;
  isActive: boolean;
  avgRating: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  businessId: string;
  userId: string;
  rating: number;
  comment?: string;
  reply?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  createdAt: string;
}

// --- Request Types ---

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateBusinessRequest {
  name: string;
  description?: string;
  categoryId: string;
  location: GeoPoint;
  schedule: BusinessScheduleWeek;
  photos?: string[];
}

export interface UpdateBusinessRequest {
  name?: string;
  description?: string;
  categoryId?: string;
  location?: GeoPoint;
  schedule?: BusinessScheduleWeek;
  photos?: string[];
}

export interface SearchBusinessesQuery {
  categoryId?: string;
  lat: number;
  lng: number;
  radius: SearchRadius;
  q?: string;
}

export interface CreateReviewRequest {
  businessId: string;
  rating: number;
  comment?: string;
}

export interface ReplyToReviewRequest {
  replyContent: string;
}

export interface CreateReportRequest {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description?: string;
}

export interface UpdateReportRequest {
  status: ReportStatus;
}

// --- Response Types ---

export interface AuthResponse {
  token: string;
  user: Pick<User, 'id' | 'email' | 'role' | 'name'>;
}

export interface BusinessSummary {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  avgRating: number;
  distanceMeters?: number;
  location: { lat: number; lng: number };
  isOpenNow: boolean;
  photos: string[];
}

export interface SearchResult {
  businesses: BusinessSummary[];
  message?: string;
}

export interface AdminStats {
  totalUsers: number;
  usersByRole: Record<UserRole, number>;
  totalBusinesses: { active: number; inactive: number };
  totalReviews: number;
  globalAvgRating: number;
  pendingReports: number;
}