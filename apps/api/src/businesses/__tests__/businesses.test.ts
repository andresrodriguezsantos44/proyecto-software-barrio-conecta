import { describe, it, expect } from 'bun:test';
import { validate, createBusinessSchema, updateBusinessSchema, type CreateBusinessInput, type UpdateBusinessInput } from '../schemas';
import { toBusinessResponse } from '../service';
import { AppError } from '../../shared/error';
import type { BusinessDocument } from '../model';

// ---------------------------------------------------------------------------
// Unit: Joi validation schemas — createBusinessSchema
// ---------------------------------------------------------------------------
describe('Business Schemas — createBusinessSchema', () => {
  const validInput: CreateBusinessInput = {
    name: 'Panadería Doña María',
    categoryId: '507f1f77bcf86cd799439011',
    location: {
      type: 'Point',
      coordinates: [-74.0817, 4.6097],
    },
    schedule: {
      mon: { open: '08:00', close: '18:00' },
      tue: { open: '08:00', close: '18:00' },
      wed: { open: '08:00', close: '18:00' },
      thu: { open: '08:00', close: '18:00' },
      fri: { open: '08:00', close: '18:00' },
      sat: { open: '09:00', close: '14:00' },
      sun: { open: '09:00', close: '14:00' },
    },
  };

  it('should validate a correct business creation payload', () => {
    const result = validate<CreateBusinessInput>(createBusinessSchema, validInput);
    expect(result.name).toBe('Panadería Doña María');
    expect(result.categoryId).toBe('507f1f77bcf86cd799439011');
    expect(result.location.type).toBe('Point');
    expect(result.location.coordinates).toEqual([-74.0817, 4.6097]);
  });

  it('should validate with optional photos (up to 3)', () => {
    const input = {
      ...validInput,
      photos: ['https://img.example.com/1.jpg', 'https://img.example.com/2.jpg'],
    };
    const result = validate<CreateBusinessInput>(createBusinessSchema, input);
    expect(result.photos).toHaveLength(2);
  });

  it('should reject name shorter than 3 characters', () => {
    expect(() =>
      validate(createBusinessSchema, { ...validInput, name: 'AB' }),
    ).toThrow(/at least 3 characters/i);
  });

  it('should reject more than 3 photos', () => {
    expect(() =>
      validate(createBusinessSchema, {
        ...validInput,
        photos: ['a', 'b', 'c', 'd'],
      }),
    ).toThrow(/Maximum 3 photos/i);
  });

  it('should reject invalid categoryId format', () => {
    expect(() =>
      validate(createBusinessSchema, { ...validInput, categoryId: 'not-a-hex' }),
    ).toThrow();
  });

  it('should reject missing required fields', () => {
    expect(() => validate(createBusinessSchema, {})).toThrow();
  });

  it('should reject location without proper type', () => {
    expect(() =>
      validate(createBusinessSchema, {
        ...validInput,
        location: { type: 'LineString', coordinates: [0, 0] },
      }),
    ).toThrow();
  });

  it('should reject invalid schedule time format', () => {
    expect(() =>
      validate(createBusinessSchema, {
        ...validInput,
        schedule: {
          mon: { open: '8:00', close: '18:00' }, // wrong format — should be 08:00
          tue: { open: '08:00', close: '18:00' },
          wed: { open: '08:00', close: '18:00' },
          thu: { open: '08:00', close: '18:00' },
          fri: { open: '08:00', close: '18:00' },
          sat: { open: '09:00', close: '14:00' },
          sun: { open: '09:00', close: '14:00' },
        },
      }),
    ).toThrow(/HH:MM/);
  });
});

// ---------------------------------------------------------------------------
// Unit: Joi validation schemas — updateBusinessSchema
// ---------------------------------------------------------------------------
describe('Business Schemas — updateBusinessSchema', () => {
  it('should validate partial update with only name', () => {
    const result = validate<UpdateBusinessInput>(updateBusinessSchema, {
      name: 'New Business Name',
    });
    expect(result.name).toBe('New Business Name');
  });

  it('should validate empty update (all fields optional)', () => {
    const result = validate<UpdateBusinessInput>(updateBusinessSchema, {});
    expect(result.name).toBeUndefined();
    expect(result.categoryId).toBeUndefined();
  });

  it('should reject name shorter than 3 chars even in update', () => {
    expect(() =>
      validate(updateBusinessSchema, { name: 'AB' }),
    ).toThrow(/at least 3 characters/i);
  });

  it('should reject more than 3 photos in update', () => {
    expect(() =>
      validate(updateBusinessSchema, { photos: ['a', 'b', 'c', 'd'] }),
    ).toThrow(/Maximum 3 photos/i);
  });
});

// ---------------------------------------------------------------------------
// Unit: toBusinessResponse mapper
// ---------------------------------------------------------------------------
describe('Business Service — toBusinessResponse', () => {
  it('should map a business document to response format with lat/lng', () => {
    const mockDoc = {
      id: 'biz123',
      name: 'Test Business',
      description: 'A test',
      category: { toString: () => 'cat456' },
      owner: { toString: () => 'user789' },
      location: {
        type: 'Point' as const,
        coordinates: [-74.0817, 4.6097] as [number, number],
      },
      photos: ['https://example.com/photo.jpg'],
      schedule: {
        mon: { open: '08:00', close: '18:00' },
      },
      isActive: true,
      avgRating: 4.5,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-02'),
    } as unknown as BusinessDocument;

    const result = toBusinessResponse(mockDoc);

    expect(result.id).toBe('biz123');
    expect(result.name).toBe('Test Business');
    expect(result.location.lat).toBe(4.6097);
    expect(result.location.lng).toBe(-74.0817);
    expect(result.categoryId).toBe('cat456');
    expect(result.ownerId).toBe('user789');
    expect(result.avgRating).toBe(4.5);
    expect(result.isActive).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Unit: Business service error scenarios (no DB required)
// ---------------------------------------------------------------------------
describe('Business Service — error construction', () => {
  it('should create AppError(409) for duplicate active business', () => {
    const err = new AppError(409, 'You already have an active business. Deactivate it before creating a new one.');
    expect(err.statusCode).toBe(409);
    expect(err.message).toContain('active business');
  });

  it('should create AppError(404) for business not found', () => {
    const err = new AppError(404, 'Business not found');
    expect(err.statusCode).toBe(404);
  });

  it('should create AppError(403) for unauthorized business update', () => {
    const err = new AppError(403, 'You can only update your own business');
    expect(err.statusCode).toBe(403);
  });

  it('should create AppError(400) for category not found', () => {
    const err = new AppError(400, 'Category not found');
    expect(err.statusCode).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// Note: Full service integration tests (createBusiness, updateBusiness, etc.)
// require a running MongoDB instance. Those are covered in the integration
// test suite. The unit tests above validate schema logic, mappers, and error
// types — all without requiring a database connection.
// ---------------------------------------------------------------------------