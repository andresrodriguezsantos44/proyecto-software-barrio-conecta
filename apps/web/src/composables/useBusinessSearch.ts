// ============================================================================
// BarrioConecta — useBusinessSearch Composable
// Reingeniería: composable orquestador que unifica geolocalización,
// estado de filtros y ejecución de búsqueda.
//
// Antes de la reingeniería, toda esta lógica vivía mezclada en ExploreView.vue.
// Después, la vista solo renderiza y delega aquí.
//
// Responsabilidades:
//   - Mantener estado de los filtros del usuario (categoría, radio, texto)
//   - Coordinar la geolocalización con la ejecución de la búsqueda
//   - Navegar al detalle de un negocio
//   - Resolver el nombre de una categoría por ID
// ============================================================================

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSearchStore, useCategoriesStore } from '@/stores';
import { useGeolocation } from './useGeolocation';
import { buildSearchQuery } from '@/services/businessSearchService';
import type { SearchRadius } from '@barrio-conecta/contracts';

/**
 * Composable orquestador del módulo de búsqueda y visualización de negocios.
 *
 * Separa completamente la lógica de negocio de la capa de presentación,
 * siguiendo el patrón de separación de responsabilidades definido en la
 * reingeniería (Actividad 6).
 *
 * Uso:
 * ```ts
 * const {
 *   selectedCategoryId, selectedRadius, searchQuery,
 *   isLocating, locationError, effectiveLat, effectiveLng,
 *   requestGeolocation, handleSearch, goToBusiness, getCategoryName
 * } = useBusinessSearch();
 * ```
 */
export function useBusinessSearch() {
  const router = useRouter();
  const searchStore = useSearchStore();
  const categoriesStore = useCategoriesStore();

  // --- Capa de geolocalización (delegada al composable especializado) ---
  const {
    isLocating,
    locationError,
    effectiveLat,
    effectiveLng,
    requestGeolocation,
  } = useGeolocation();

  // --- Estado de filtros de búsqueda (capa de presentación → lógica) ---

  /** Categoría seleccionada por el usuario. null = "Todas" */
  const selectedCategoryId = ref<string | null>(null);

  /** Radio de búsqueda seleccionado en metros */
  const selectedRadius = ref<SearchRadius>(1000);

  /** Texto libre para búsqueda por nombre */
  const searchQuery = ref('');

  // --- Acciones ---

  /**
   * Ejecuta la búsqueda geoespacial.
   * Construye la query a través del servicio y delega al store.
   * No hace nada si la geolocalización está en curso.
   */
  function handleSearch(): void {
    if (isLocating.value) return;

    const query = buildSearchQuery({
      lat: effectiveLat.value,
      lng: effectiveLng.value,
      radius: selectedRadius.value,
      categoryId: selectedCategoryId.value,
      q: searchQuery.value,
    });

    searchStore.search(query);
  }

  /**
   * Navega a la vista de detalle de un negocio.
   * @param id - ID del negocio
   */
  function goToBusiness(id: string): void {
    router.push({ name: 'business-detail', params: { id } });
  }

  /**
   * Resuelve el nombre de una categoría dado su ID.
   * Retorna cadena vacía si no se encuentra.
   */
  function getCategoryName(categoryId: string | null): string {
    if (!categoryId) return '';
    const cat = categoriesStore.categories.find((c) => c.id === categoryId);
    return cat?.name ?? '';
  }

  return {
    // Estado de filtros
    selectedCategoryId,
    selectedRadius,
    searchQuery,
    // Geolocalización (re-expuesto desde useGeolocation)
    isLocating,
    locationError,
    effectiveLat,
    effectiveLng,
    requestGeolocation,
    // Acciones de búsqueda
    handleSearch,
    goToBusiness,
    getCategoryName,
  };
}
