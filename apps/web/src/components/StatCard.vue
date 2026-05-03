<script setup lang="ts">
// ============================================================================
// BarrioConecta — StatCard Component
// Displays a single dashboard statistic with label, value, and optional icon.
// ============================================================================
interface Props {
  label: string;
  value: string | number;
  icon?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const props = withDefaults(defineProps<Props>(), {
  icon: '📊',
  variant: 'default',
});

const variantClasses: Record<string, string> = {
  default: 'border-gray-200 bg-white',
  success: 'border-green-200 bg-green-50',
  warning: 'border-yellow-200 bg-yellow-50',
  danger: 'border-red-200 bg-red-50',
};
</script>

<template>
  <div :class="['rounded-xl border p-4 text-center', variantClasses[props.variant]]">
    <div class="text-2xl mb-1">{{ icon }}</div>
    <div class="text-2xl font-bold text-gray-900">{{ value }}</div>
    <div class="text-sm text-gray-500 mt-1">{{ label }}</div>
  </div>
</template>