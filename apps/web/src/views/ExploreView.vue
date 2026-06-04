<script setup lang="ts">
// ============================================================================
// BarrioConecta — Explore View (Reingeniería — Actividad 6)
// Vista refactorizada: la lógica de geolocalización, filtros y búsqueda
// fue extraída a composables y servicios especializados.
//
// Antes: ~115 líneas mezclando geolocalización, filtros, búsqueda y navegación.
// Después: ~20 líneas — la vista solo orquesta la presentación.
//
// Composables usados:
//   - useBusinessSearch  → filtros, búsqueda, navegación, categorías
//   - useCategoriesStore → lista de categorías disponibles
//   - useSearchStore     → estado de resultados y loading
// ============================================================================
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useSearchStore, useCategoriesStore } from '@/stores';
import { useBusinessSearch } from '@/composables/useBusinessSearch';
import { RADIUS_OPTIONS } from '@/services/businessSearchService';
import BusinessCard from '@/components/BusinessCard.vue';

const route = useRoute();
const searchStore = useSearchStore();
const categoriesStore = useCategoriesStore();

const {
  selectedCategoryId,
  selectedRadius,
  searchQuery,
  isLocating,
  locationError,
  effectiveLat,
  effectiveLng,
  requestGeolocation,
  handleSearch,
  goToBusiness,
  getCategoryName,
} = useBusinessSearch();

// Inicialización: categorías, query param de landing y geolocalización
onMounted(() => {
  if (categoriesStore.categories.length === 0) {
    categoriesStore.fetchCategories();
  }

  // Categoría pre-seleccionada desde la landing page (click en categoría)
  const queryCategory = route.query.category as string | undefined;
  if (queryCategory) {
    selectedCategoryId.value = queryCategory;
  }

  requestGeolocation();
});

// radiusOptions proviene del servicio — ya no está hardcodeada en la vista
const radiusOptions = RADIUS_OPTIONS;
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

    <div v-else-if="searchStore.results?.length > 0">
      <p class="text-sm text-gray-500 mb-4">
        {{ searchStore.results?.length }} {{ searchStore.results?.length === 1 ? 'negocio encontrado' : 'negocios encontrados' }}
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