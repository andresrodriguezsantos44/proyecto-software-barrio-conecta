<script setup lang="ts">
// ============================================================================
// BarrioConecta — StarRating Component
// Displays a star rating (1-5) with optional interactive mode for input.
// ============================================================================
interface Props {
  rating: number;
  max?: number;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  max: 5,
  interactive: false,
  size: 'md',
});

const emit = defineEmits<{
  select: [value: number];
}>();

const sizeClasses: Record<string, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

function handleStarClick(star: number): void {
  if (props.interactive) {
    emit('select', star);
  }
}
</script>

<template>
  <div class="inline-flex items-center gap-0.5" role="img" :aria-label="`${rating} de ${max} estrellas`">
    <button
      v-for="star in max"
      :key="star"
      type="button"
      :disabled="!interactive"
      :class="[
        sizeClasses[size],
        interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default',
        'transition-transform',
      ]"
      :aria-label="`${star} estrella${star > 1 ? 's' : ''}`"
      @click="handleStarClick(star)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        :fill="star <= Math.round(rating) ? '#f59e0b' : '#e5e7eb'"
        stroke="none"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </button>
    <span v-if="rating > 0" class="ml-1 text-sm text-gray-600 font-medium">
      {{ rating.toFixed(1) }}
    </span>
  </div>
</template>