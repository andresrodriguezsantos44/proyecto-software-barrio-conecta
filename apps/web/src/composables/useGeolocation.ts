// ============================================================================
// BarrioConecta — useGeolocation Composable
// Reingeniería: extrae la lógica de geolocalización que antes estaba
// mezclada con la interfaz en ExploreView.vue (líneas 46–83 del original).
//
// Responsabilidades:
//   - Solicitar permiso de geolocalización al navegador
//   - Manejar los tres casos de error (denegado, no disponible, timeout)
//   - Proveer coordenadas efectivas con fallback a Bogotá
//   - Exponer estado reactivo (isLocating, locationError)
// ============================================================================

import { ref, computed } from 'vue';
import { DEFAULT_COORDS } from '@/services/businessSearchService';

export interface GeolocationState {
  isLocating: Readonly<ReturnType<typeof ref<boolean>>>;
  locationError: Readonly<ReturnType<typeof ref<string | null>>>;
  userLat: Readonly<ReturnType<typeof ref<number | null>>>;
  userLng: Readonly<ReturnType<typeof ref<number | null>>>;
  effectiveLat: ReturnType<typeof computed<number>>;
  effectiveLng: ReturnType<typeof computed<number>>;
  requestGeolocation: () => void;
}

/**
 * Composable que encapsula el ciclo de vida de la geolocalización del navegador.
 *
 * Uso:
 * ```ts
 * const { isLocating, locationError, effectiveLat, effectiveLng, requestGeolocation } = useGeolocation();
 * ```
 */
export function useGeolocation() {
  // --- Estado reactivo ---
  const isLocating = ref(false);
  const locationError = ref<string | null>(null);
  const userLat = ref<number | null>(null);
  const userLng = ref<number | null>(null);

  // --- Computed: coordenadas efectivas con fallback ---

  /** Latitud del usuario o del centro de Bogotá si no hay permiso */
  const effectiveLat = computed(() => userLat.value ?? DEFAULT_COORDS.lat);

  /** Longitud del usuario o del centro de Bogotá si no hay permiso */
  const effectiveLng = computed(() => userLng.value ?? DEFAULT_COORDS.lng);

  // --- Acciones ---

  /**
   * Solicita la posición actual al navegador.
   * Maneja todos los casos de error definidos en la Geolocation API.
   */
  function requestGeolocation(): void {
    if (!navigator.geolocation) {
      locationError.value =
        'Tu navegador no soporta geolocalización. Usando ubicación por defecto (Bogotá).';
      userLat.value = DEFAULT_COORDS.lat;
      userLng.value = DEFAULT_COORDS.lng;
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
        locationError.value = resolveGeolocationError(err);
        userLat.value = DEFAULT_COORDS.lat;
        userLng.value = DEFAULT_COORDS.lng;
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  return {
    // Estado
    isLocating,
    locationError,
    userLat,
    userLng,
    // Computed
    effectiveLat,
    effectiveLng,
    // Acciones
    requestGeolocation,
  };
}

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

/**
 * Traduce el código de error de GeolocationPositionError a un mensaje
 * comprensible para el usuario.
 */
function resolveGeolocationError(err: GeolocationPositionError): string {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return 'Activa tu ubicación o selecciona un punto en el mapa. Usando ubicación por defecto (Bogotá).';
    case err.POSITION_UNAVAILABLE:
      return 'Ubicación no disponible. Usando ubicación por defecto (Bogotá).';
    case err.TIMEOUT:
      return 'Tiempo de espera agotado. Usando ubicación por defecto (Bogotá).';
    default:
      return 'Error al obtener ubicación. Usando ubicación por defecto (Bogotá).';
  }
}
