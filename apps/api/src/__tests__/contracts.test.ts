import { describe, it, expect } from 'bun:test';
import type {
  UserRole,
  SearchBusinessesQuery,
  BusinessSummary,
  RegisterRequest,
  AuthResponse,
} from '@barrio-conecta/contracts';

describe('Shared Contracts — type exports', () => {
  it('should allow creating UserRole values', () => {
    const merchant: UserRole = 'merchant';
    const admin: UserRole = 'admin';
    const neighbor: UserRole = 'neighbor';

    expect(merchant).toBe('merchant');
    expect(admin).toBe('admin');
    expect(neighbor).toBe('neighbor');
  });

  it('should allow creating SearchBusinessesQuery values', () => {
    const query: SearchBusinessesQuery = {
      lat: 4.60,
      lng: -74.08,
      radius: 1000,
      categoryId: 'abc123',
      q: 'panadería',
    };

    expect(query.lat).toBe(4.60);
    expect(query.radius).toBe(1000);
  });

  it('should allow creating BusinessSummary values', () => {
    const summary: BusinessSummary = {
      id: 'biz1',
      name: 'Panadería Doña Rosa',
      description: 'La mejor del barrio',
      categoryId: 'cat1',
      avgRating: 4.5,
      distanceMeters: 350,
      location: { lat: 4.60, lng: -74.08 },
      isOpenNow: true,
      photos: ['https://example.com/photo1.jpg'],
    };

    expect(summary.id).toBe('biz1');
    expect(summary.isOpenNow).toBe(true);
  });

  it('should allow creating RegisterRequest values', () => {
    const req: RegisterRequest = {
      email: 'merchant@ejemplo.com',
      password: 'securePassword123',
      name: 'Juan Pérez',
      role: 'merchant',
    };

    expect(req.role).toBe('merchant');
    expect(req.password.length).toBeGreaterThanOrEqual(8);
  });

  it('should allow creating AuthResponse values', () => {
    const res: AuthResponse = {
      token: 'eyJhbGciOiJIUzI1NiJ9.test',
      user: {
        id: 'user1',
        email: 'merchant@ejemplo.com',
        role: 'merchant',
        name: 'Juan Pérez',
      },
    };

    expect(res.token).toBeTruthy();
    expect(res.user.role).toBe('merchant');
  });
});