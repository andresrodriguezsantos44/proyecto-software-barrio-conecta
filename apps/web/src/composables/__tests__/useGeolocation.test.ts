// ============================================================================
// Tests: useGeolocation
// Valida el comportamiento del composable de geolocalización bajo diferentes
// condiciones del navegador (sin soporte, permiso denegado, timeout).
// ============================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useGeolocation } from '../useGeolocation';
import { DEFAULT_COORDS } from '../../services/businessSearchService';

// ---------------------------------------------------------------------------
// Helpers para simular navigator.geolocation
// ---------------------------------------------------------------------------

function mockGeolocationSuccess(lat: number, lng: number) {
  const mockPosition: GeolocationPosition = {
    coords: {
      latitude: lat,
      longitude: lng,
      accuracy: 10,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
      toJSON: () => ({}),
    },
    timestamp: Date.now(),
    toJSON: () => ({}),
  };

  Object.defineProperty(globalThis.navigator, 'geolocation', {
    value: {
      getCurrentPosition: vi.fn((success: PositionCallback) => {
        success(mockPosition);
      }),
    },
    configurable: true,
    writable: true,
  });
}

function mockGeolocationError(code: number) {
  // El switch en useGeolocation usa err.PERMISSION_DENIED, err.POSITION_UNAVAILABLE, err.TIMEOUT
  // que son propiedades del propio objeto error (no constantes globales).
  // El mock debe exponer esos valores para que el switch resuelva correctamente.
  const mockError = {
    code,
    message: 'mock error',
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
  } as unknown as GeolocationPositionError;

  Object.defineProperty(globalThis.navigator, 'geolocation', {
    value: {
      getCurrentPosition: vi.fn(
        (_success: PositionCallback, error: PositionErrorCallback) => {
          error(mockError);
        },
      ),
    },
    configurable: true,
    writable: true,
  });
}

function mockGeolocationUnavailable() {
  Object.defineProperty(globalThis.navigator, 'geolocation', {
    value: undefined,
    configurable: true,
    writable: true,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('useGeolocation', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('estado inicial', () => {
    it('inicia con isLocating en false', () => {
      const { isLocating } = useGeolocation();
      expect(isLocating.value).toBe(false);
    });

    it('inicia sin error de ubicación', () => {
      const { locationError } = useGeolocation();
      expect(locationError.value).toBeNull();
    });

    it('inicia con coordenadas nulas', () => {
      const { userLat, userLng } = useGeolocation();
      expect(userLat.value).toBeNull();
      expect(userLng.value).toBeNull();
    });

    it('effectiveLat usa coordenadas por defecto (Bogotá) cuando userLat es null', () => {
      const { effectiveLat } = useGeolocation();
      expect(effectiveLat.value).toBe(DEFAULT_COORDS.lat);
    });

    it('effectiveLng usa coordenadas por defecto (Bogotá) cuando userLng es null', () => {
      const { effectiveLng } = useGeolocation();
      expect(effectiveLng.value).toBe(DEFAULT_COORDS.lng);
    });
  });

  describe('requestGeolocation — éxito', () => {
    beforeEach(() => {
      mockGeolocationSuccess(4.7110, -74.0721); // Chía, Cundinamarca
    });

    it('actualiza userLat y userLng con las coordenadas reales', () => {
      const { userLat, userLng, requestGeolocation } = useGeolocation();
      requestGeolocation();
      expect(userLat.value).toBeCloseTo(4.7110, 4);
      expect(userLng.value).toBeCloseTo(-74.0721, 4);
    });

    it('effectiveLat refleja la posición real del usuario', () => {
      const { effectiveLat, requestGeolocation } = useGeolocation();
      requestGeolocation();
      expect(effectiveLat.value).toBeCloseTo(4.7110, 4);
    });

    it('limpia locationError después de una localización exitosa', () => {
      const { locationError, requestGeolocation } = useGeolocation();
      requestGeolocation();
      expect(locationError.value).toBeNull();
    });

    it('isLocating queda en false después del éxito', () => {
      const { isLocating, requestGeolocation } = useGeolocation();
      requestGeolocation();
      expect(isLocating.value).toBe(false);
    });
  });

  describe('requestGeolocation — error PERMISSION_DENIED', () => {
    beforeEach(() => {
      mockGeolocationError(1); // GeolocationPositionError.PERMISSION_DENIED = 1
    });

    it('usa coordenadas por defecto (Bogotá) cuando se deniega el permiso', () => {
      const { effectiveLat, effectiveLng, requestGeolocation } = useGeolocation();
      requestGeolocation();
      expect(effectiveLat.value).toBe(DEFAULT_COORDS.lat);
      expect(effectiveLng.value).toBe(DEFAULT_COORDS.lng);
    });

    it('establece un mensaje de error al usuario', () => {
      const { locationError, requestGeolocation } = useGeolocation();
      requestGeolocation();
      expect(locationError.value).toContain('Activa tu ubicación');
    });

    it('isLocating queda en false', () => {
      const { isLocating, requestGeolocation } = useGeolocation();
      requestGeolocation();
      expect(isLocating.value).toBe(false);
    });
  });

  describe('requestGeolocation — error POSITION_UNAVAILABLE', () => {
    beforeEach(() => {
      mockGeolocationError(2); // POSITION_UNAVAILABLE = 2
    });

    it('usa coordenadas por defecto y muestra mensaje apropiado', () => {
      const { effectiveLat, locationError, requestGeolocation } = useGeolocation();
      requestGeolocation();
      expect(effectiveLat.value).toBe(DEFAULT_COORDS.lat);
      expect(locationError.value).toContain('no disponible');
    });
  });

  describe('requestGeolocation — error TIMEOUT', () => {
    beforeEach(() => {
      mockGeolocationError(3); // TIMEOUT = 3
    });

    it('usa coordenadas por defecto y muestra mensaje de timeout', () => {
      const { effectiveLat, locationError, requestGeolocation } = useGeolocation();
      requestGeolocation();
      expect(effectiveLat.value).toBe(DEFAULT_COORDS.lat);
      expect(locationError.value).toContain('espera agotado');
    });
  });

  describe('requestGeolocation — navegador sin soporte', () => {
    beforeEach(() => {
      mockGeolocationUnavailable();
    });

    it('usa coordenadas por defecto cuando geolocation no está disponible', () => {
      const { effectiveLat, effectiveLng, requestGeolocation } = useGeolocation();
      requestGeolocation();
      expect(effectiveLat.value).toBe(DEFAULT_COORDS.lat);
      expect(effectiveLng.value).toBe(DEFAULT_COORDS.lng);
    });

    it('establece mensaje de error sobre falta de soporte', () => {
      const { locationError, requestGeolocation } = useGeolocation();
      requestGeolocation();
      expect(locationError.value).toContain('no soporta');
    });
  });
});
