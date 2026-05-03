<script setup lang="ts">
// ============================================================================
// BarrioConecta — ReportRow Component
// Displays a single report with status badge, description, and admin actions.
// ============================================================================
import type { Report, ReportStatus } from '@barrio-conecta/contracts';

interface Props {
  report: Report;
}

defineProps<Props>();

const emit = defineEmits<{
  'update-status': [reportId: string, status: ReportStatus];
  'deactivate': [targetId: string];
}>();

const statusLabels: Record<ReportStatus, string> = {
  NEW: 'Nueva',
  IN_REVIEW: 'En Revisión',
  RESOLVED: 'Resuelta',
};

const reasonLabels: Record<string, string> = {
  spam: 'Spam',
  false_info: 'Información Falsa',
  inappropriate: 'Contenido Inapropiado',
  other: 'Otro',
};
</script>

<template>
  <div class="card flex items-start justify-between gap-4">
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-1">
        <span class="font-semibold text-gray-900 text-sm">
          {{ report.targetType === 'business' ? '🏪 Negocio' : '⭐ Reseña' }}
        </span>
        <span
          :class="{
            'badge-new': report.status === 'NEW',
            'badge-in-review': report.status === 'IN_REVIEW',
            'badge-resolved': report.status === 'RESOLVED',
          }"
          class="badge"
        >
          {{ statusLabels[report.status] }}
        </span>
      </div>
      <p class="text-sm text-gray-600">
        Razón: {{ reasonLabels[report.reason] ?? report.reason }}
      </p>
      <p v-if="report.description" class="text-sm text-gray-500 mt-1 italic">
        "{{ report.description }}"
      </p>
      <p class="text-xs text-gray-400 mt-1">
        ID: {{ report.targetId }} · {{ new Date(report.createdAt).toLocaleDateString('es-CO') }}
      </p>
    </div>

    <div v-if="report.status !== 'RESOLVED'" class="flex flex-col gap-2 shrink-0">
      <button
        v-if="report.status === 'NEW'"
        class="btn-secondary text-xs py-1 px-2"
        @click="emit('update-status', report.id, 'IN_REVIEW')"
      >
        Revisar
      </button>
      <button
        class="btn-danger text-xs py-1 px-2"
        @click="emit('deactivate', report.targetId)"
      >
        {{ report.targetType === 'business' ? 'Desactivar' : 'Eliminar' }}
      </button>
      <button
        class="btn-secondary text-xs py-1 px-2"
        @click="emit('update-status', report.id, 'RESOLVED')"
      >
        Resolver
      </button>
    </div>
  </div>
</template>