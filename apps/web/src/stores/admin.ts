// ============================================================================
// BarrioConecta — Admin Store
// Pinia store for reports, moderation actions, and dashboard stats.
// ============================================================================

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { adminApi } from '@/api';
import type { Report, ReportStatus, AdminStats, CreateReportRequest, UpdateReportRequest } from '@barrio-conecta/contracts';

export const useAdminStore = defineStore('admin', () => {
  // --- State ---
  const reports = ref<Report[]>([]);
  const stats = ref<AdminStats | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // --- Actions ---

  /** Fetch all reports, optionally filtered by status */
  async function fetchReports(status?: ReportStatus): Promise<Report[]> {
    loading.value = true;
    error.value = null;
    try {
      reports.value = await adminApi.getReports(status);
      return reports.value;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load reports';
      error.value = message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /** Create a report (any authenticated user can report) */
  async function createReport(data: CreateReportRequest): Promise<Report> {
    loading.value = true;
    error.value = null;
    try {
      const report = await adminApi.createReport(data);
      reports.value.unshift(report);
      return report;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create report';
      error.value = message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /** Update a report's status (admin only) */
  async function updateReportStatus(reportId: string, data: UpdateReportRequest): Promise<Report> {
    loading.value = true;
    error.value = null;
    try {
      const updated = await adminApi.updateReportStatus(reportId, data);
      // Update in local array
      const idx = reports.value.findIndex((r) => r.id === reportId);
      if (idx !== -1) {
        reports.value[idx] = updated;
      }
      return updated;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update report';
      error.value = message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /** Deactivate a business by admin (marks related reports as RESOLVED) */
  async function deactivateBusiness(businessId: string): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      await adminApi.deactivateBusinessByAdmin(businessId);
      // Mark related reports as resolved in local state
      reports.value = reports.value.map((r) =>
        r.targetId === businessId && r.targetType === 'business' && r.status !== 'RESOLVED'
          ? { ...r, status: 'RESOLVED' as ReportStatus }
          : r,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to deactivate business';
      error.value = message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /** Fetch dashboard statistics (admin only) */
  async function fetchStats(): Promise<AdminStats> {
    loading.value = true;
    error.value = null;
    try {
      stats.value = await adminApi.getStats();
      return stats.value;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load stats';
      error.value = message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function clearReports(): void {
    reports.value = [];
    error.value = null;
  }

  return {
    // State
    reports,
    stats,
    loading,
    error,
    // Actions
    fetchReports,
    createReport,
    updateReportStatus,
    deactivateBusiness,
    fetchStats,
    clearReports,
  };
});