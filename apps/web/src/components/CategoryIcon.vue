<script setup lang="ts">
// ============================================================================
// BarrioConecta — CategoryIcon Component
// Displays a category with icon and name. Used in landing and explore views.
// ============================================================================
interface Props {
  id?: string;
  name: string;
  icon?: string;
  selected?: boolean;
}

withDefaults(defineProps<Props>(), {
  id: '',
  icon: '📦',
  selected: false,
});

const emit = defineEmits<{
  click: [];
}>();
</script>

<template>
  <button
    type="button"
    :class="[
      'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:shadow-md',
      selected
        ? 'border-primary-500 bg-primary-50 text-primary-700'
        : 'border-gray-200 bg-white text-gray-600 hover:border-primary-300',
    ]"
    @click="emit('click')"
  >
    <span class="text-3xl">{{ icon }}</span>
    <span class="text-sm font-medium">{{ name }}</span>
  </button>
</template>