import { describe, it, expect } from 'bun:test';
import { validate, searchQuerySchema, type SearchInput } from '../schemas';
import { AppError } from '../../shared/error';

// ---------------------------------------------------------------------------
// Unit: Joi validation — searchQuerySchema
// ---------------------------------------------------------------------------
describe('Search Schemas — searchQuerySchema', () => {
  it('should validate a correct search query with all fields', () => {
    const result = validate<SearchInput>(searchQuerySchema, {
      categoryId: '507f1f77bcf86cd799439011',
      lat: 4.6097,
      lng: -74.0817,
      radius: 1000,
    });

    expect(result.lat).toBe(4.6097);
    expect(result.lng).toBe(-74.0817);
    expect(result.radius).toBe(1000);
    expect(result.categoryId).toBe('507f1f77bcf86cd799439011');
  });

  it('should default radius to 1000 when not provided', () => {
    const result = validate<SearchInput>(searchQuerySchema, {
      lat: 4.6097,
      lng: -74.0817,
    });

    expect(result.radius).toBe(1000);
  });

  it('should validate without optional categoryId', () => {
    const result = validate<SearchInput>(searchQuerySchema, {
      lat: 4.6097,
      lng: -74.0817,
      radius: 500,
    });

    expect(result.categoryId).toBeUndefined();
    expect(result.radius).toBe(500);
  });

  it('should validate without optional q parameter', () => {
    const result = validate<SearchInput>(searchQuerySchema, {
      lat: 4.6097,
      lng: -74.0817,
    });

    expect(result.q).toBeUndefined();
  });

  it('should validate with optional q parameter', () => {
    const result = validate<SearchInput>(searchQuerySchema, {
      lat: 4.6097,
      lng: -74.0817,
      q: '  panadería  ',
    });

    expect(result.q).toBe('panadería'); // trimmed
  });

  it('should reject missing lat', () => {
    expect(() =>
      validate(searchQuerySchema, {
        lng: -74.0817,
        radius: 1000,
      }),
    ).toThrow(/required/i);
  });

  it('should reject missing lng', () => {
    expect(() =>
      validate(searchQuerySchema, {
        lat: 4.6097,
        radius: 1000,
      }),
    ).toThrow(/required/i);
  });

  it('should reject lat outside -90 to 90 range', () => {
    expect(() =>
      validate(searchQuerySchema, {
        lat: 91,
        lng: -74.0817,
      }),
    ).toThrow();
  });

  it('should reject lng outside -180 to 180 range', () => {
    expect(() =>
      validate(searchQuerySchema, {
        lat: 4.6097,
        lng: 181,
      }),
    ).toThrow();
  });

  it('should reject invalid radius values', () => {
    expect(() =>
      validate(searchQuerySchema, {
        lat: 4.6097,
        lng: -74.0817,
        radius: 300, // not 500, 1000, or 2000
      }),
    ).toThrow(/500|1000|2000/i);
  });

  it('should reject invalid categoryId format', () => {
    expect(() =>
      validate(searchQuerySchema, {
        lat: 4.6097,
        lng: -74.0817,
        categoryId: 'not-valid',
      }),
    ).toThrow();
  });

  it('should accept all valid radius values (500, 1000, 2000)', () => {
    for (const radius of [500, 1000, 2000] as const) {
      const result = validate<SearchInput>(searchQuerySchema, {
        lat: 4.6097,
        lng: -74.0817,
        radius,
      });
      expect(result.radius).toBe(radius);
    }
  });

  it('should reject q longer than 100 chars', () => {
    expect(() =>
      validate(searchQuerySchema, {
        lat: 4.6097,
        lng: -74.0817,
        q: 'a'.repeat(101),
      }),
    ).toThrow(/100/);
  });
});

// ---------------------------------------------------------------------------
// Unit: Search service error construction
// ---------------------------------------------------------------------------
describe('Search Service — error scenarios', () => {
  it('should create AppError(400) for invalid search params', () => {
    const err = new AppError(400, 'Latitude is required');
    expect(err.statusCode).toBe(400);
    expect(err.message).toContain('Latitude');
  });
});

// ---------------------------------------------------------------------------
// Note: searchByRadius() requires a MongoDB connection with 2dsphere index.
// Integration tests covering the actual geo queries are in the integration
// test suite. These unit tests cover schema validation and error types.
// ---------------------------------------------------------------------------