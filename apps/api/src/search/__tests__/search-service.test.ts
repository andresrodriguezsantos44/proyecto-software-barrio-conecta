import { describe, it, expect } from 'bun:test';
import { computeDistance, checkIsOpenNow } from '../service';

// ---------------------------------------------------------------------------
// Unit: computeDistance — Haversine formula
// ---------------------------------------------------------------------------
describe('Search Service — computeDistance', () => {
  it('should return 0 for identical coordinates', () => {
    const dist = computeDistance(4.6097, -74.0817, 4.6097, -74.0817);
    expect(dist).toBeLessThan(1); // Less than 1 meter (floating-point tolerance)
  });

  it('should compute distance between Bogotá center and a nearby point (~800m)', () => {
    // Bogotá center: (4.6097, -74.0817)
    // ~800m northeast: (4.6142, -74.0760)
    const dist = computeDistance(4.6097, -74.0817, 4.6142, -74.0760);
    expect(dist).toBeGreaterThan(500);
    expect(dist).toBeLessThan(1200);
  });

  it('should compute distance between Bogotá and Medellín (~240km)', () => {
    // Bogotá: (4.6097, -74.0817)
    // Medellín: (6.2442, -75.5812)
    const dist = computeDistance(4.6097, -74.0817, 6.2442, -75.5812);
    expect(dist).toBeGreaterThan(230000);
    expect(dist).toBeLessThan(260000);
  });

  it('should handle antipodal points', () => {
    // North pole to south pole
    const dist = computeDistance(90, 0, -90, 0);
    // Half circumference ≈ 20015 km, full ≈ 20015 km
    expect(dist).toBeGreaterThan(19900000);
    expect(dist).toBeLessThan(20100000);
  });

  it('should handle small distances (a few meters)', () => {
    // Very close points: ~11 meters apart
    const dist = computeDistance(4.6097, -74.0817, 4.6098, -74.0817);
    expect(dist).toBeGreaterThan(5);
    expect(dist).toBeLessThan(20);
  });
});

// ---------------------------------------------------------------------------
// Unit: checkIsOpenNow — business schedule checker
// ---------------------------------------------------------------------------
describe('Search Service — checkIsOpenNow', () => {
  // The clock is INJECTED (deterministic). new Date(2026, 5, 4, h, m) builds a
  // local-time Thursday (June 4, 2026 → getDay() === 4 → 'thu'), so construction
  // and reading use the same components regardless of the host timezone.
  const thuAt = (h: number, m = 0) => new Date(2026, 5, 4, h, m);
  const businessOpenThu = (open: string, close: string) => ({
    schedule: { thu: { open, close } },
  });

  it('should return true when current time is within today’s open window', () => {
    const result = checkIsOpenNow(businessOpenThu('17:00', '20:00'), thuAt(18, 30));
    expect(result).toBe(true);
  });

  it('should return true exactly at the opening minute (inclusive lower bound)', () => {
    const result = checkIsOpenNow(businessOpenThu('09:00', '18:00'), thuAt(9, 0));
    expect(result).toBe(true);
  });

  it('should return true exactly at the closing minute (inclusive upper bound)', () => {
    const result = checkIsOpenNow(businessOpenThu('09:00', '18:00'), thuAt(18, 0));
    expect(result).toBe(true);
  });

  it('should return false before the business opens', () => {
    const result = checkIsOpenNow(businessOpenThu('09:00', '18:00'), thuAt(6, 0));
    expect(result).toBe(false);
  });

  it('should return false after the business has already closed', () => {
    const result = checkIsOpenNow(businessOpenThu('08:00', '12:00'), thuAt(18, 30));
    expect(result).toBe(false);
  });

  it('should return false when there is no schedule for the current day', () => {
    const biz = { schedule: { fri: { open: '08:00', close: '18:00' } } };
    const result = checkIsOpenNow(biz, thuAt(12, 0));
    expect(result).toBe(false);
  });

  it('should return false for empty schedule', () => {
    expect(checkIsOpenNow({ schedule: {} }, thuAt(12, 0))).toBe(false);
  });

  it('should return false for null schedule', () => {
    expect(checkIsOpenNow({ schedule: null }, thuAt(12, 0))).toBe(false);
  });
});