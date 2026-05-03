import type { Request, Response, NextFunction } from 'express';
import { validate, searchQuerySchema, type SearchInput } from './schemas';
import { searchByRadius } from './service';

/**
 * GET /search
 * Geospatial search for businesses by category and radius.
 * GS-03: Validates response time <1.5s.
 */
export async function searchBusinesses(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const startTime = Date.now();
    const input = validate<SearchInput>(searchQuerySchema, req.query);
    const result = await searchByRadius(input);

    const elapsed = Date.now() - startTime;
    if (elapsed > 1500) {
      console.warn(`⚠️ Search exceeded 1.5s budget: ${elapsed}ms`);
    }

    res.json({
      status: 'success',
      data: {
        businesses: result.businesses,
        ...(result.message ? { message: result.message } : {}),
      },
    });
  } catch (err) {
    next(err);
  }
}