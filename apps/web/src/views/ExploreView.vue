<script setup lang="ts">
// ============================================================================
// BarrioConecta — Explore View
// Map + list with category/radius filters and geolocation prompt.
// Full MVP implementation per spec GS-01 through GS-03.
// ============================================================================
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSearchStore, useCategoriesStore } from '@/stores';
import BusinessCard from '@/components/BusinessCard.vue';
import type { SearchRadius } from '@barrio-conecta/contracts';

const route = useRoute();
const router = useRouter();
const searchStore = useSearchStore();
const categoriesStore = useCategoriesStore();

const selectedCategoryId = ref<string | null>(null);
const selectedRadius = ref<SearchRadius>(1000);
const searchQuery = ref('');
const locationError = ref<string | null>(null);
const userLat = ref<number | null>(null);
const userLng = ref<number | null>(null);
const isLocating = ref(false);

// Default location (Bogotá center)
const DEFAULT_LAT = 4.60;
const DEFAULT_LNG = -74.08;

// Pre-selected category from landing page
onMounted(() => {
  if (categoriesStore.categories.length === 0) {
    categoriesStore.fetchCategories();
  }

  // Read category from query params (landing page category click)
  const queryCategory = route.query.category as string | undefined;
  if (queryCategory) {
    selectedCategoryId.value = queryCategory;
  }

  // Try to get user location
  requestGeolocation();
});

function requestGeolocation(): void {
  if (!navigator.geolocation) {
    locationError.value = 'Tu navegador no soporta geolocalización. Usando ubicación por defecto (Bogotá).';
    userLat.value = DEFAULT_LAT;
    userLng.value = DEFAULT_LNG;
    return;
  }

  isLocating.value = true;
  locationError.value = null;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLat.value = position.coords.latitude;
      userLng.value = position.coords.longitude;
      isLocating.value = false;
    },
    (err) => {
      isLocating.value = false;
      switch (err.code) {
        case err.PERMISSION_DENIED:
          locationError.value = 'Activa tu ubicación o selecciona un punto en el mapa. Usando ubicación por defecto (Bogotá).';
          break;
        case err.POSITION_UNAVAILABLE:
          locationError.value = 'Ubicación no disponible. Usando ubicación por defecto (Bogotá).';
          break;
        case err.TIMEOUT:
          locationError.value = 'Tiempo de espera agotado. Usando ubicación por defecto (Bogotá).';
          break;
        default:
          locationError.value = 'Error al obtener ubicación. Usando ubicación por defecto (Bogotá).';
      }
      userLat.value = DEFAULT_LAT;
      userLng.value = DEFAULT_LNG;
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
  );
}

const effectiveLat = computed(() => userLat.value ?? DEFAULT_LAT);
const effectiveLng = computed(() => userLng.value ?? DEFAULT_LNG);

function handleSearch(): void {
  if (isLocating.value) return;

  searchStore.search({
    lat: effectiveLat.value,
    lng: effectiveLng.value,
    radius: selectedRadius.value,
    categoryId: selectedCategoryId.value ?? undefined,
    q: searchQuery.value || undefined,
  });
}

function goToBusiness(id: string): void {
  router.push({ name: 'business-detail', params: { id } });
}

const radiusOptions: { value: SearchRadius; label: string }[] = [
  { value: 500, label: '500m' },
  { value: 1000, label: '1km' },
  { value: 2000, label: '2km' },
];

function getCategoryName(categoryId: string | null): string {
  if (!categoryId) return '';
  const cat = categoriesStore.categories.find((c) => c.id === categoryId);
  return cat?.name ?? '';
}
</script>

<template>
  <main class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Explorar Negocios</h1>

    <!-- Search Controls -->
    <div class="card mb-6">
      <!-- Location Status Bar -->
      <div v-if="isLocating" class="mb-4 flex items-center gap-2 text-sm text-primary-700 bg-primary-50 p-3 rounded-lg">
        <span class="animate-spin">⏳</span>
        Obteniendo tu ubicación...
      </div>
      <div v-else-if="locationError" class="mb-4 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
        ⚠️ {{ locationError }}
        <button class="ml-2 underline text-amber-800" @click="requestGeolocation()">
          Reintentar
        </button>
      </div>
      <div v-else class="mb-4 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
        📍 Ubicación: {{ effectiveLat.toFixed(4) }}, {{ effectiveLng.toFixed(4) }}
      </div>

      <!-- Category Filter -->
      <div v-if="categoriesStore.categories.length > 0" class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
        <div class="flex flex-wrap gap-2">
          <button
            :class="[
              'text-sm px-3 py-1.5 rounded-full border transition-all flex items-center gap-2',
              selectedCategoryId === null
                ? 'bg-primary text-on-primary border-primary shadow-md'
                : 'bg-white text-on-surface-variant border-outline-variant hover:border-primary',
            ]"
            @click="selectedCategoryId = null"
          >
            Todas
          </button>
          <button
            v-for="cat in categoriesStore.categories"
            :key="cat.id"
            :class="[
              'text-sm px-3 py-1.5 rounded-full border transition-all flex items-center gap-2',
              selectedCategoryId === cat.id
                ? 'bg-primary text-on-primary border-primary shadow-md'
                : 'bg-white text-on-surface-variant border-outline-variant hover:border-primary',
            ]"
            @click="selectedCategoryId = cat.id"
          >
            <span class="material-symbols-outlined text-[18px]" :style="{ fontVariationSettings: `'FILL' ${selectedCategoryId === cat.id ? 1 : 0}` }">{{ cat.icon }}</span>
            {{ cat.name }}
          </button>
        </div>
      </div>

      <!-- Search Input + Radius + Button -->
      <div class="flex flex-col sm:flex-row gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por nombre..."
          class="input-field flex-grow"
          @keyup.enter="handleSearch"
        />
        <select v-model="selectedRadius" class="input-field w-full sm:w-32">
          <option v-for="opt in radiusOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <button
          class="btn-primary whitespace-nowrap flex items-center justify-center gap-2"
          :disabled="isLocating"
          @click="handleSearch"
        >
          <span class="material-symbols-outlined">search</span>
          Buscar
        </button>
      </div>
    </div>

    <!-- Results -->
    <div v-if="searchStore.loading" class="text-center py-12 text-gray-500">
      <span class="animate-spin text-3xl mb-4 block">⏳</span>
      Buscando negocios...
    </div>

    <div v-else-if="searchStore.error" class="text-center py-12 text-red-600">
      <p class="text-lg mb-2">Error al buscar</p>
      <p class="text-sm">{{ searchStore.error }}</p>
      <button class="btn-primary mt-4" @click="handleSearch">Reintentar</button>
    </div>

    <div v-else-if="searchStore.results.length > 0">
      <p class="text-sm text-gray-500 mb-4">
        {{ searchStore.results.length }} {{ searchStore.results.length === 1 ? 'negocio encontrado' : 'negocios encontrados' }}
        <span v-if="searchStore.query?.categoryId">
          en "{{ getCategoryName(searchStore.query.categoryId) }}"
        </span>
        <span v-if="searchStore.query?.radius">
          dentro de {{ searchStore.query.radius }}m
        </span>
      </p>
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="biz in searchStore.results"
          :key="biz.id"
          class="cursor-pointer"
          @click="goToBusiness(biz.id)"
        >
          <BusinessCard :business="biz" />
        </div>
      </div>
    </div>

    <div v-else-if="searchStore.message" class="text-center py-12">
      <p class="text-4xl mb-4">🔍</p>
      <p class="text-gray-600 text-lg">{{ searchStore.message }}</p>
      <p class="text-gray-400 text-sm mt-2">Prueba con otra categoría o aumenta el radio de búsqueda.</p>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-4xl mb-4">📍</p>
      <p class="text-gray-500">
        Selecciona una categoría y busca para encontrar negocios cercanos.
      </p>
    </div>
  </main>
</template>