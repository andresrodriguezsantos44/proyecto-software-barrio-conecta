// ============================================================================
// BarrioConecta — Admin API Module
// Reports, business deactivation, and dashboard stats.
// ============================================================================

import { api } from './client';
import type {
  Report,
  ReportStatus,
  AdminStats,
  CreateReportRequest,
  UpdateReportRequest,
} from '@barrio-conecta/contracts';

/** POST /admin/reports — create a report (any authenticated user) */
export function createReport(data: CreateReportRequest): Promise<Report> {
  return api.authPost<Report>('/admin/reports', data);
}

/** GET /admin/reports — list all reports (admin only), optional status filter */
export function getReports(status?: ReportStatus): Promise<Report[]> {
  return api.authGet<Report[]>('/admin/reports', { status });
}

/** PATCH /admin/reports/:reportId — update report status (admin only) */
export function updateReportStatus(reportId: string, data: UpdateReportRequest): Promise<Report> {
  return api.authPatch<Report>(`/admin/reports/${reportId}`, data);
}

/** PATCH /admin/business/:id/deactivate — deactivate a business (admin only) */
export function deactivateBusinessByAdmin(businessId: string): Promise<{ id: string; isActive: boolean }> {
  return api.authPatch<{ id: string; isActive: boolean }>(`/admin/business/${businessId}/deactivate`);
}

/** GET /admin/stats — dashboard statistics (admin only) */
export function getStats(): Promise<AdminStats> {
  return api.authGet<AdminStats>('/admin/stats');
}