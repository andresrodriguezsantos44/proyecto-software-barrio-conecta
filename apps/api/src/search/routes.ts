import { Router, type Router as RouterType } from 'express';
import { searchBusinesses } from './controller';

const router: RouterType = Router();

/**
 * GET /search — public geospatial search
 * GS-01: category (optional), lat/lng (required), radius (500|1000|2000)
 */
router.get('/', searchBusinesses);

export const searchRoutes: RouterType = router;