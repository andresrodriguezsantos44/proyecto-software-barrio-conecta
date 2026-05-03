<script setup lang="ts">
// ============================================================================
// BarrioConecta — BusinessCard Component
// Displays a business summary card with rating, distance, and open status.
// Enhanced for MVP with category icon display and improved UX.
// ============================================================================
import type { BusinessSummary } from '@barrio-conecta/contracts';
import StarRating from './StarRating.vue';

interface Props {
  business: BusinessSummary;
}

defineProps<Props>();

const emit = defineEmits<{
  click: [id: string];
}>();
</script>

<template>
  <article
    class="card hover:shadow-md transition-shadow cursor-pointer"
    role="button"
    :aria-label="`Ver ${business.name}`"
    tabindex="0"
    @click="emit('click', business.id)"
    @keydown.enter="emit('click', business.id)"
  >
    <!-- Photo thumbnail -->
    <div
      v-if="business.photos && business.photos.length > 0"
      class="w-full h-32 mb-3 rounded-lg overflow-hidden bg-gray-100"
    >
      <img
        :src="business.photos[0]"
        :alt="`Foto de ${business.name}`"
        class="w-full h-full object-cover"
        @error="($event.target as HTMLImageElement).style.display = 'none'"
      />
    </div>

    <div class="flex items-start justify-between gap-2">
      <h3 class="text-lg font-semibold text-gray-900 truncate">
        {{ business.name }}
      </h3>
      <span
        v-if="business.isOpenNow"
        class="badge bg-green-100 text-green-800 shrink-0"
      >
        Abierto
      </span>
      <span v-else class="badge bg-red-100 text-red-800 shrink-0">
        Cerrado
      </span>
    </div>

    <div v-if="business.description" class="mt-1 text-sm text-gray-500 line-clamp-2">
      {{ business.description }}
    </div>

    <div class="mt-3 flex items-center justify-between">
      <StarRating :rating="business.avgRating" size="sm" />
      <span v-if="business.distanceMeters != null" class="text-sm text-gray-500">
        {{ business.distanceMeters < 1000
          ? `${Math.round(business.distanceMeters)}m`
          : `${(business.distanceMeters / 1000).toFixed(1)}km`
        }}
      </span>
    </div>
  </article>
</template>