// ============================================================================
// BarrioConecta — Business Search Service (Frontend)
// Reingeniería: centraliza la lógica de dominio de búsqueda que antes
// estaba dispersa en ExploreView.vue.
//
// Responsabilidades:
//   - Construir la query de búsqueda a partir de parámetros crudos del usuario
//   - Filtrado local optimista por texto
//   - Ordenamiento por distancia en el cliente
//   - Constantes de dominio (coordenadas por defecto, opciones de radio)
// ============================================================================

import type { SearchBusinessesQuery, BusinessSummary, SearchRadius } from '@barrio-conecta/contracts';

// ---------------------------------------------------------------------------
// Constantes de dominio
// Antes estaban hardcodeadas directamente en ExploreView.vue
// ---------------------------------------------------------------------------

/** Coordenadas del centro de Bogotá — ubicación por defecto cuando el usuario no comparte su posición */
export const DEFAULT_COORDS = {
  lat: 4.60,
  lng: -74.08,
} as const;

/** Opciones de radio disponibles para la búsqueda por proximidad (RF-06) */
export const RADIUS_OPTIONS: { value: SearchRadius; label: string }[] = [
  { value: 500, label: '500m' },
  { value: 1000, label: '1km' },
  { value: 2000, label: '2km' },
];

// ---------------------------------------------------------------------------
// buildSearchQuery
// Construye el objeto SearchBusinessesQuery validado a partir de los
// parámetros crudos capturados por la interfaz de usuario.
// ---------------------------------------------------------------------------

export interface RawSearchParams {
  lat: number;
  lng: number;
  radius: SearchRadius;
  categoryId?: string | null;
  q?: string;
}

/**
 * Construye y valida la query de búsqueda.
 * Normaliza valores opcionales (null → undefined, string vacío → undefined).
 */
export function buildSearchQuery(params: RawSearchParams): SearchBusinessesQuery {
  return {
    lat: params.lat,
    lng: params.lng,
    radius: params.radius,
    categoryId: params.categoryId ?? undefined,
    q: params.q?.trim() || undefined,
  };
}

// ---------------------------------------------------------------------------
// filterByText
// Filtrado local en el cliente — permite retroalimentación inmediata
// mientras el servidor procesa la petición.
// ---------------------------------------------------------------------------

/**
 * Filtra una lista de negocios por coincidencia de texto en nombre o descripción.
 * La comparación es case-insensitive y elimina acentos para mayor tolerancia.
 *
 * @param businesses - Lista de negocios a filtrar
 * @param query - Texto de búsqueda del usuario
 * @returns Negocios cuyo nombre o descripción contienen el texto
 */
export function filterByText(businesses: BusinessSummary[], query: string): BusinessSummary[] {
  const normalized = normalizeText(query);
  if (!normalized) return businesses;

  return businesses.filter((biz) => {
    const nameMatch = normalizeText(biz.name).includes(normalized);
    const descMatch = biz.description ? normalizeText(biz.description).includes(normalized) : false;
    return nameMatch || descMatch;
  });
}

// ---------------------------------------------------------------------------
// sortByDistance
// Ordena negocios por distancia ascendente.
// El backend ya devuelve resultados ordenados por $near, pero este
// sort permite re-ordenar si el cliente modifica los resultados localmente.
// ---------------------------------------------------------------------------

/**
 * Ordena negocios por distancia ascendente.
 * Negocios sin distanceMeters van al final.
 *
 * @param businesses - Lista de negocios a ordenar
 * @returns Nueva lista ordenada por distancia (no muta el original)
 */
export function sortByDistance(businesses: BusinessSummary[]): BusinessSummary[] {
  return [...businesses].sort((a, b) => {
    const distA = a.distanceMeters ?? Infinity;
    const distB = b.distanceMeters ?? Infinity;
    return distA - distB;
  });
}

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

/** Normaliza texto: minúsculas y sin acentos para comparación tolerante */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
