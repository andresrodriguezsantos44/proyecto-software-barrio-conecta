<script setup lang="ts">
// ============================================================================
// BarrioConecta — Admin Dashboard View
// Reports list with status badges, deactivate action, global stats,
// and report creation modal. Full MVP implementation per spec AD-01 through AD-04.
// ============================================================================
import { onMounted, ref } from 'vue';
import { useAdminStore } from '@/stores';
import ReportRow from '@/components/ReportRow.vue';
import StatCard from '@/components/StatCard.vue';
import type { ReportStatus, ReportTargetType, ReportReason } from '@barrio-conecta/contracts';

const adminStore = useAdminStore();
const selectedStatus = ref<ReportStatus | ''>('');

// --- Report creation modal ---
const showReportModal = ref(false);
const reportTargetType = ref<ReportTargetType>('business');
const reportTargetId = ref('');
const reportReason = ref<ReportReason>('spam');
const reportDescription = ref('');

const reportReasons: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam' },
  { value: 'false_info', label: 'Información Falsa' },
  { value: 'inappropriate', label: 'Contenido Inapropiado' },
  { value: 'other', label: 'Otro' },
];

onMounted(async () => {
  await adminStore.fetchReports(selectedStatus.value || undefined);
  await adminStore.fetchStats();
});

async function filterByStatus(status: ReportStatus | ''): Promise<void> {
  selectedStatus.value = status;
  await adminStore.fetchReports(status || undefined);
}

async function handleUpdateStatus(reportId: string, status: ReportStatus): Promise<void> {
  await adminStore.updateReportStatus(reportId, { status });
  await adminStore.fetchReports(selectedStatus.value || undefined);
  await adminStore.fetchStats();
}

async function handleDeactivate(targetId: string): Promise<void> {
  if (confirm('¿Estás seguro de que quieres desactivar este negocio? El negocio será ocultado de la búsqueda y los reportes asociados se marcarán como resueltos.')) {
    await adminStore.deactivateBusiness(targetId);
    await adminStore.fetchReports(selectedStatus.value || undefined);
    await adminStore.fetchStats();
  }
}

async function submitReport(): Promise<void> {
  try {
    await adminStore.createReport({
      targetType: reportTargetType.value,
      targetId: reportTargetId.value,
      reason: reportReason.value,
      description: reportDescription.value || undefined,
    });
    showReportModal.value = false;
    reportTargetId.value = '';
    reportReason.value = 'spam';
    reportDescription.value = '';
    await adminStore.fetchReports(selectedStatus.value || undefined);
  } catch {
    // Error is in adminStore.error
  }
}

function refreshData(): Promise<void> {
  return adminStore.fetchReports(selectedStatus.value || undefined)
    .then(() => adminStore.fetchStats())
    .then(() => { /* fulfilled */ });
}
</script>

<template>
  <main class="max-w-6xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Panel de Administración</h1>
      <button class="btn-secondary text-sm" @click="refreshData">
        🔄 Actualizar
      </button>
    </div>

    <!-- Stats Section -->
    <div v-if="adminStore.stats" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      <StatCard label="Usuarios" :value="adminStore.stats.totalUsers" icon="👥" />
      <StatCard label="Negocios Activos" :value="adminStore.stats.totalBusinesses.active" icon="🏪" variant="success" />
      <StatCard label="Negocios Inactivos" :value="adminStore.stats.totalBusinesses.inactive" icon="🚫" variant="danger" />
      <StatCard
        label="Reseñas"
        :value="adminStore.stats.totalReviews"
        icon="⭐"
      />
      <StatCard label="Reportes Pendientes" :value="adminStore.stats.pendingReports" icon="⚠️" variant="warning" />
    </div>

    <!-- Additional stats row -->
    <div v-if="adminStore.stats" class="card mb-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <p class="text-2xl font-bold text-primary-700">{{ adminStore.stats.usersByRole.merchant }}</p>
          <p class="text-sm text-gray-500">Comercios</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-blue-700">{{ adminStore.stats.usersByRole.neighbor }}</p>
          <p class="text-sm text-gray-500">Vecinos</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-purple-700">{{ adminStore.stats.usersByRole.admin }}</p>
          <p class="text-sm text-gray-500">Admins</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-amber-600">{{ adminStore.stats.globalAvgRating.toFixed(1) }}</p>
          <p class="text-sm text-gray-500">Rating Promedio</p>
        </div>
      </div>
    </div>

    <!-- Error display -->
    <div v-if="adminStore.error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
      {{ adminStore.error }}
    </div>

    <!-- Reports Section -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900">Reportes</h2>
        <div class="flex gap-2">
          <button
            v-for="status in (['', 'NEW', 'IN_REVIEW', 'RESOLVED'] as const)"
            :key="status"
            :class="[
              'text-sm px-3 py-1 rounded-full transition-colors',
              selectedStatus === status
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            ]"
            @click="filterByStatus(status)"
          >
            {{ status === '' ? 'Todos' : status === 'NEW' ? 'Nuevos' : status === 'IN_REVIEW' ? 'En Revisión' : 'Resueltos' }}
          </button>
        </div>
      </div>

      <div v-if="adminStore.loading" class="text-center py-8 text-gray-500">
        <span class="text-3xl mb-4 block">⏳</span>
        Cargando reportes...
      </div>

      <div v-else-if="adminStore.reports.length === 0" class="text-center py-8 text-gray-400">
        No hay reportes.
      </div>

      <div v-else class="space-y-3">
        <ReportRow
          v-for="report in adminStore.reports"
          :key="report.id"
          :report="report"
          @update-status="handleUpdateStatus"
          @deactivate="handleDeactivate"
        />
      </div>
    </div>

    <!-- Report Creation Modal -->
    <div
      v-if="showReportModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showReportModal = false"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Crear Reporte</h3>

        <form @submit.prevent="submitReport" class="space-y-4">
          <div>
            <label for="report-target-type" class="block text-sm font-medium text-gray-700 mb-1">
              Tipo de objetivo
            </label>
            <select id="report-target-type" v-model="reportTargetType" class="input-field">
              <option value="business">Negocio</option>
              <option value="review">Reseña</option>
            </select>
          </div>

          <div>
            <label for="report-target-id" class="block text-sm font-medium text-gray-700 mb-1">
              ID del {{ reportTargetType === 'business' ? 'negocio' : 'reseña' }}
            </label>
            <input
              id="report-target-id"
              v-model="reportTargetId"
              type="text"
              class="input-field"
              placeholder="Ingrese el ID"
            />
          </div>

          <div>
            <label for="report-reason" class="block text-sm font-medium text-gray-700 mb-1">Razón</label>
            <select id="report-reason" v-model="reportReason" class="input-field">
              <option v-for="r in reportReasons" :key="r.value" :value="r.value">
                {{ r.label }}
              </option>
            </select>
          </div>

          <div>
            <label for="report-modal-desc" class="block text-sm font-medium text-gray-700 mb-1">
              Descripción (opcional)
            </label>
            <textarea
              id="report-modal-desc"
              v-model="reportDescription"
              class="input-field"
              rows="3"
              maxlength="500"
              placeholder="Describe el problema..."
            />
          </div>

          <div class="flex gap-3">
            <button type="submit" class="btn-danger" :disabled="adminStore.loading">
              {{ adminStore.loading ? 'Enviando...' : 'Enviar Reporte' }}
            </button>
            <button type="button" class="btn-secondary" @click="showReportModal = false">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>