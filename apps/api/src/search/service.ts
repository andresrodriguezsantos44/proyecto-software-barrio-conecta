import { Business } from '../businesses/model';
import type { BusinessDocument } from '../businesses/model';
import type { BusinessSummary } from '@barrio-conecta/contracts';
import type { SearchInput } from './schemas';

/**
 * Search businesses by geospatial radius using MongoDB $near with 2dsphere index.
 * GS-02: Results MUST be sorted by proximity.
 * GS-03: Response time MUST be <1.5s — enforced at controller level.
 *
 * @returns BusinessSummary[] with distanceMeters and isOpenNow computed.
 */
export async function searchByRadius(input: SearchInput): Promise<{ businesses: BusinessSummary[]; message?: string }> {
  const { categoryId, lat, lng, radius, q } = input;

  // Build the geospatial query
  // MongoDB 2dsphere $near returns results sorted by distance automatically
  const filter: Record<string, unknown> = {
    isActive: true,
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat], // MongoDB expects [longitude, latitude]
        },
        $maxDistance: radius,
      },
    },
  };

  // Optional category filter (GS-01: single exclusive category)
  if (categoryId) {
    filter.category = categoryId;
  }

  // Optional text search on business name
  if (q) {
    filter.name = { $regex: q, $options: 'i' };
  }

  const businesses = await Business.find(filter).lean();

  if (businesses.length === 0) {
    return {
      businesses: [],
      message: 'No businesses found',
    };
  }

  // Map to BusinessSummary with distance calculation and isOpenNow
  const summaries: BusinessSummary[] = businesses.map((biz) => {
    const distanceMeters = computeDistance(
      lat,
      lng,
      biz.location.coordinates[1]!, // latitude
      biz.location.coordinates[0]!, // longitude
    );

    return {
      id: (biz._id as { toString(): string }).toString(),
      name: biz.name,
      description: biz.description || undefined,
      categoryId: (biz.category as unknown as { toString(): string }).toString(),
      avgRating: biz.avgRating,
      distanceMeters: Math.round(distanceMeters),
      location: {
        lat: biz.location.coordinates[1]!,
        lng: biz.location.coordinates[0]!,
      },
      isOpenNow: checkIsOpenNow(biz),
      photos: biz.photos,
    };
  });

  return { businesses: summaries };
}

/**
 * Haversine formula to compute great-circle distance in meters between two points.
 * Exported for testing.
 */
export function computeDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth's mean radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Check if a business is currently open based on its schedule.
 * Uses the current day of the week and time.
 *
 * The reference time is injectable via the `now` parameter (defaults to the
 * current instant). Injecting the clock keeps callers unchanged while making
 * the function deterministically testable — a test must never depend on the
 * wall clock.
 *
 * Exported for testing.
 */
export function checkIsOpenNow(
  biz: BusinessDocument | Record<string, unknown>,
  now: Date = new Date(),
): boolean {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
  const dayKey = days[now.getDay()]!;
  const schedule = (biz as Record<string, unknown>).schedule as Record<string, { open: string; close: string }>;
  const daySchedule = schedule?.[dayKey];

  if (!daySchedule) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = daySchedule.open.split(':').map(Number);
  const [closeH, closeM] = daySchedule.close.split(':').map(Number);

  const openMinutes = openH! * 60 + openM!;
  const closeMinutes = closeH! * 60 + closeM!;

  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}