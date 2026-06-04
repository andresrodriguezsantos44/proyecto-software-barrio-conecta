// ============================================================================
// Tests: businessSearchService
// Valida las funciones de filtrado, ordenamiento y construcción de query
// del servicio de búsqueda frontend (reingeniería — Actividad 6).
// ============================================================================

import { describe, it, expect } from 'vitest';
import {
  buildSearchQuery,
  filterByText,
  sortByDistance,
  DEFAULT_COORDS,
  RADIUS_OPTIONS,
} from '../../services/businessSearchService';
import type { BusinessSummary } from '@barrio-conecta/contracts';

// ---------------------------------------------------------------------------
// buildSearchQuery
// ---------------------------------------------------------------------------
describe('businessSearchService — buildSearchQuery', () => {
  const baseParams = {
    lat: 4.6097,
    lng: -74.0817,
    radius: 1000 as const,
  };

  it('construye una query básica con coordenadas y radio', () => {
    const query = buildSearchQuery(baseParams);
    expect(query.lat).toBe(4.6097);
    expect(query.lng).toBe(-74.0817);
    expect(query.radius).toBe(1000);
    expect(query.categoryId).toBeUndefined();
    expect(query.q).toBeUndefined();
  });

  it('incluye categoryId cuando se provee', () => {
    const query = buildSearchQuery({ ...baseParams, categoryId: 'cat-gastro' });
    expect(query.categoryId).toBe('cat-gastro');
  });

  it('convierte categoryId null a undefined', () => {
    const query = buildSearchQuery({ ...baseParams, categoryId: null });
    expect(query.categoryId).toBeUndefined();
  });

  it('incluye q cuando se provee texto', () => {
    const query = buildSearchQuery({ ...baseParams, q: 'panadería' });
    expect(query.q).toBe('panadería');
  });

  it('convierte string vacío en q a undefined', () => {
    const query = buildSearchQuery({ ...baseParams, q: '' });
    expect(query.q).toBeUndefined();
  });

  it('recorta espacios en blanco de q', () => {
    const query = buildSearchQuery({ ...baseParams, q: '  panadería  ' });
    expect(query.q).toBe('panadería');
  });

  it('convierte q de solo espacios a undefined', () => {
    const query = buildSearchQuery({ ...baseParams, q: '   ' });
    expect(query.q).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// filterByText
// ---------------------------------------------------------------------------
describe('businessSearchService — filterByText', () => {
  const mockBusinesses: BusinessSummary[] = [
    {
      id: '1',
      name: 'Panadería La Esperanza',
      description: 'Pan artesanal del barrio',
      categoryId: 'cat-1',
      avgRating: 4.5,
      distanceMeters: 200,
      location: { lat: 4.61, lng: -74.08 },
      isOpenNow: true,
      photos: [],
    },
    {
      id: '2',
      name: 'Ferretería Central',
      description: 'Herramientas y materiales',
      categoryId: 'cat-2',
      avgRating: 4.0,
      distanceMeters: 500,
      location: { lat: 4.62, lng: -74.07 },
      isOpenNow: false,
      photos: [],
    },
    {
      id: '3',
      name: 'Taller Mecánico Rápido',
      description: undefined,
      categoryId: 'cat-3',
      avgRating: 3.8,
      distanceMeters: 800,
      location: { lat: 4.60, lng: -74.09 },
      isOpenNow: true,
      photos: [],
    },
  ];

  it('devuelve todos cuando el query está vacío', () => {
    const result = filterByText(mockBusinesses, '');
    expect(result).toHaveLength(3);
  });

  it('filtra por nombre (case-insensitive)', () => {
    const result = filterByText(mockBusinesses, 'panadería');
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('1');
  });

  it('filtra por nombre en mayúsculas', () => {
    const result = filterByText(mockBusinesses, 'FERRETERÍA');
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('2');
  });

  it('filtra por descripción', () => {
    const result = filterByText(mockBusinesses, 'artesanal');
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('1');
  });

  it('ignora acentos en la búsqueda', () => {
    const result = filterByText(mockBusinesses, 'panaderia');
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('1');
  });

  it('devuelve array vacío cuando no hay coincidencias', () => {
    const result = filterByText(mockBusinesses, 'restaurante');
    expect(result).toHaveLength(0);
  });

  it('funciona con negocios sin descripción', () => {
    const result = filterByText(mockBusinesses, 'taller');
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('3');
  });
});

// ---------------------------------------------------------------------------
// sortByDistance
// ---------------------------------------------------------------------------
describe('businessSearchService — sortByDistance', () => {
  it('ordena negocios por distancia ascendente', () => {
    const businesses: BusinessSummary[] = [
      { id: '3', name: 'C', categoryId: 'x', avgRating: 4, distanceMeters: 800, location: { lat: 0, lng: 0 }, isOpenNow: true, photos: [] },
      { id: '1', name: 'A', categoryId: 'x', avgRating: 4, distanceMeters: 200, location: { lat: 0, lng: 0 }, isOpenNow: true, photos: [] },
      { id: '2', name: 'B', categoryId: 'x', avgRating: 4, distanceMeters: 500, location: { lat: 0, lng: 0 }, isOpenNow: true, photos: [] },
    ];

    const sorted = sortByDistance(businesses);
    expect(sorted[0]?.id).toBe('1');
    expect(sorted[1]?.id).toBe('2');
    expect(sorted[2]?.id).toBe('3');
  });

  it('coloca negocios sin distanceMeters al final', () => {
    const businesses: BusinessSummary[] = [
      { id: '1', name: 'A', categoryId: 'x', avgRating: 4, distanceMeters: undefined, location: { lat: 0, lng: 0 }, isOpenNow: true, photos: [] },
      { id: '2', name: 'B', categoryId: 'x', avgRating: 4, distanceMeters: 300, location: { lat: 0, lng: 0 }, isOpenNow: true, photos: [] },
    ];

    const sorted = sortByDistance(businesses);
    expect(sorted[0]?.id).toBe('2');
    expect(sorted[1]?.id).toBe('1');
  });

  it('no muta el array original', () => {
    const businesses: BusinessSummary[] = [
      { id: '2', name: 'B', categoryId: 'x', avgRating: 4, distanceMeters: 500, location: { lat: 0, lng: 0 }, isOpenNow: true, photos: [] },
      { id: '1', name: 'A', categoryId: 'x', avgRating: 4, distanceMeters: 100, location: { lat: 0, lng: 0 }, isOpenNow: true, photos: [] },
    ];

    sortByDistance(businesses);
    expect(businesses[0]?.id).toBe('2'); // original no cambia
  });

  it('devuelve array vacío si la entrada es vacía', () => {
    const result = sortByDistance([]);
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Constantes de dominio
// ---------------------------------------------------------------------------
describe('businessSearchService — constantes de dominio', () => {
  it('DEFAULT_COORDS apunta al centro de Bogotá', () => {
    expect(DEFAULT_COORDS.lat).toBeCloseTo(4.60, 1);
    expect(DEFAULT_COORDS.lng).toBeCloseTo(-74.08, 1);
  });

  it('RADIUS_OPTIONS tiene exactamente 3 opciones', () => {
    expect(RADIUS_OPTIONS).toHaveLength(3);
  });

  it('RADIUS_OPTIONS contiene 500m, 1km y 2km', () => {
    const values = RADIUS_OPTIONS.map((o) => o.value);
    expect(values).toContain(500);
    expect(values).toContain(1000);
    expect(values).toContain(2000);
  });
});
