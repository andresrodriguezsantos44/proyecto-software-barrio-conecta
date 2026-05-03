<script setup lang="ts">
// ============================================================================
// BarrioConecta — MapMarker Component
// Simple map marker / location display for MVP.
// Will be enhanced with Leaflet in a future iteration.
// ============================================================================
interface Props {
  lat: number;
  lng: number;
  label?: string;
}

defineProps<Props>();
</script>

<template>
  <div
    class="relative inline-flex flex-col items-center justify-center"
    :aria-label="label ?? 'Ubicación en mapa'"
  >
    <!-- Map placeholder with location pin -->
    <div class="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
      <div class="text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="#059669"
          class="w-10 h-10 mx-auto mb-2 drop-shadow"
        >
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
        <p class="text-sm font-medium text-gray-700">
          {{ lat.toFixed(4) }}, {{ lng.toFixed(4) }}
        </p>
        <p v-if="label" class="text-xs text-gray-500 mt-1">{{ label }}</p>
        <p class="text-xs text-gray-400 mt-1">Mapa disponible próximamente</p>
      </div>
    </div>
  </div>
</template>