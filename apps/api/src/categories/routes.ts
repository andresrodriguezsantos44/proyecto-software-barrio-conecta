import { Router, type Router as RouterType } from 'express';
import { getCategories } from './controller';

const router: RouterType = Router();

/**
 * GET /categories — public, no auth required
 */
router.get('/', getCategories);

export const categoryRoutes: RouterType = router;