import { Router, type Router as RouterType } from 'express';
import {
  getReportsHandler,
  createReportHandler,
  updateReportHandler,
  deactivateBusinessHandler,
  getStatsHandler,
} from './controller';
import { authenticateJWT, requireRole } from '../auth/middleware';

const router: RouterType = Router();

/**
 * Admin routes — all require admin role (AD-04).
 * - GET    /admin/reports            — list reports (optional ?status= filter)
 * - POST   /admin/reports            — create a report (any authenticated user)
 * - PATCH  /admin/reports/:reportId  — update report status
 * - PATCH  /admin/business/:id/deactivate — deactivate a business
 * - GET    /admin/stats              — dashboard stats
 */

// Report creation is available to any authenticated user
router.post('/reports', authenticateJWT, createReportHandler);

// All other admin routes require admin role
router.use(authenticateJWT, requireRole('admin'));

router.get('/reports', getReportsHandler);
router.patch('/reports/:reportId', updateReportHandler);
router.patch('/business/:id/deactivate', deactivateBusinessHandler);
router.get('/stats', getStatsHandler);

export const adminRoutes: RouterType = router;