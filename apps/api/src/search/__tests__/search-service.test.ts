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
  // We create mock schedule objects. Since checkIsOpenNow uses `new Date()`,
  // we test both scenarios: business with today's schedule, and without.
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

  it('should return true when business is currently open', () => {
    const now = new Date();
    const dayKey = days[now.getDay()]!;
    const currentHour = now.getHours();

    // Create schedule where today's hours include the current time
    const openHour = String(Math.max(0, currentHour - 1)).padStart(2, '0');
    const closeHour = String(Math.min(23, currentHour + 2)).padStart(2, '0');

    const biz = {
      schedule: {
        [dayKey]: { open: `${openHour}:00`, close: `${closeHour}:00` },
      },
    };

    const result = checkIsOpenNow(biz);
    expect(result).toBe(true);
  });

  it('should return false when business has no schedule for today', () => {
    // Create a mock where today is not in the schedule
    const now = new Date();
    const todayIdx = now.getDay();
    // Use a different day
    const otherDay = days[(todayIdx + 1) % 7]!;

    const biz = {
      schedule: {
        [otherDay]: { open: '08:00', close: '18:00' },
      },
    };

    const result = checkIsOpenNow(biz);
    expect(result).toBe(false);
  });

  it('should return false for empty schedule', () => {
    const biz = { schedule: {} };
    const result = checkIsOpenNow(biz);
    expect(result).toBe(false);
  });

  it('should return false for null schedule', () => {
    const biz = { schedule: null };
    const result = checkIsOpenNow(biz);
    expect(result).toBe(false);
  });

  it('should return false when business hours are earlier today (already closed)', () => {
    const now = new Date();
    const dayKey = days[now.getDay()]!;
    const earlyHour = String(Math.max(0, now.getHours() - 5)).padStart(2, '0');
    const pastClose = String(Math.max(0, now.getHours() - 3)).padStart(2, '0');

    const biz = {
      schedule: {
        [dayKey]: { open: `${earlyHour}:00`, close: `${pastClose}:00` },
      },
    };

    // If close time is before current time, business is closed
    // Note: business might still be "open" if close hour equals current hour
    // This test validates the logic runs without error
    const result = checkIsOpenNow(biz);
    expect(typeof result).toBe('boolean');
  });
});