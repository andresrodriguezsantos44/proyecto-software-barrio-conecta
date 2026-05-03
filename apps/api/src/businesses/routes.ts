import { Router, type Router as RouterType } from 'express';
import {
  createBusinessHandler,
  getMyBusinesses,
  getBusiness,
  updateBusinessHandler,
  deactivateBusinessHandler,
} from './controller';
import { authenticateJWT, requireRole } from '../auth/middleware';

const router: RouterType = Router();

/**
 * Business CRUD routes.
 * All routes require authentication.
 * Creation is restricted to merchants.
 */
router.post('/', authenticateJWT, requireRole('merchant'), createBusinessHandler);
router.get('/my', authenticateJWT, requireRole('merchant'), getMyBusinesses);
router.get('/:id', getBusiness);
router.put('/:id', authenticateJWT, updateBusinessHandler);
router.delete('/:id', authenticateJWT, deactivateBusinessHandler);

export const businessRoutes: RouterType = router;