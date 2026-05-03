import { describe, it, expect } from 'bun:test';
import { toBusinessResponse } from '../service';
import type { BusinessDocument } from '../model';

// ---------------------------------------------------------------------------
// Unit: toBusinessResponse — comprehensive coverage
// ---------------------------------------------------------------------------
describe('Business Service — toBusinessResponse', () => {
  const baseDoc: BusinessDocument = {
    id: 'biz123',
    name: 'Panadería Doña María',
    description: 'La mejor panadería del barrio',
    category: { toString: () => '507f1f77bcf86cd799439011' } as any,
    owner: { toString: () => 'user789' } as any,
    location: {
      type: 'Point' as const,
      coordinates: [-74.0817, 4.6097] as [number, number],
    },
    photos: ['https://img1.jpg', 'https://img2.jpg'],
    schedule: {
      mon: { open: '08:00', close: '18:00' },
      tue: { open: '08:00', close: '18:00' },
      wed: { open: '08:00', close: '18:00' },
      thu: { open: '08:00', close: '18:00' },
      fri: { open: '08:00', close: '18:00' },
      sat: { open: '09:00', close: '14:00' },
      sun: { open: '09:00', close: '14:00' },
    },
    isActive: true,
    avgRating: 4.5,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-02'),
  } as unknown as BusinessDocument;

  it('should map all business fields correctly', () => {
    const result = toBusinessResponse(baseDoc);

    expect(result.id).toBe('biz123');
    expect(result.name).toBe('Panadería Doña María');
    expect(result.description).toBe('La mejor panadería del barrio');
    expect(result.categoryId).toBe('507f1f77bcf86cd799439011');
    expect(result.ownerId).toBe('user789');
    expect(result.location.lat).toBe(4.6097);
    expect(result.location.lng).toBe(-74.0817);
    expect(result.photos).toHaveLength(2);
    expect(result.isActive).toBe(true);
    expect(result.avgRating).toBe(4.5);
  });

  it('should map business with empty photos', () => {
    const doc = { ...baseDoc, photos: [] } as unknown as BusinessDocument;
    const result = toBusinessResponse(doc);
    expect(result.photos).toHaveLength(0);
  });

  it('should map business with deactivated status', () => {
    const doc = { ...baseDoc, isActive: false } as unknown as BusinessDocument;
    const result = toBusinessResponse(doc);
    expect(result.isActive).toBe(false);
  });

  it('should map business with zero avgRating', () => {
    const doc = { ...baseDoc, avgRating: 0 } as unknown as BusinessDocument;
    const result = toBusinessResponse(doc);
    expect(result.avgRating).toBe(0);
  });

  it('should convert GeoJSON coordinates [lng, lat] to {lat, lng} format', () => {
    const doc = {
      ...baseDoc,
      location: {
        type: 'Point' as const,
        coordinates: [-74.08, 4.61] as [number, number],
      },
    } as unknown as BusinessDocument;
    const result = toBusinessResponse(doc);

    // coordinates[0] is longitude, coordinates[1] is latitude
    expect(result.location.lat).toBe(4.61);
    expect(result.location.lng).toBe(-74.08);
  });
});

// ---------------------------------------------------------------------------
// Unit: Business service error scenarios (comprehensive)
// ---------------------------------------------------------------------------
describe('Business Service — error construction (comprehensive)', () => {
  it('should create AppError(409) with correct message for duplicate business', () => {
    const { AppError } = require('../../shared/error');
    const err = new AppError(409, 'You already have an active business. Deactivate it before creating a new one.');
    expect(err.statusCode).toBe(409);
    expect(err.isOperational).toBe(true);
    expect(err.message).toContain('active business');
  });

  it('should create AppError(404) for business not found', () => {
    const { AppError } = require('../../shared/error');
    const err = new AppError(404, 'Business not found');
    expect(err.statusCode).toBe(404);
    expect(err.status).toBe('fail');
  });

  it('should create AppError(403) for unauthorized business update', () => {
    const { AppError } = require('../../shared/error');
    const err = new AppError(403, 'You can only update your own business');
    expect(err.statusCode).toBe(403);
    expect(err.status).toBe('fail');
  });

  it('should create AppError(400) for category not found', () => {
    const { AppError } = require('../../shared/error');
    const err = new AppError(400, 'Category not found');
    expect(err.statusCode).toBe(400);
  });

  it('should create AppError(400) for deactivated business', () => {
    const { AppError } = require('../../shared/error');
    const err = new AppError(400, 'Business is already deactivated');
    expect(err.statusCode).toBe(400);
    expect(err.message).toContain('deactivated');
  });
});