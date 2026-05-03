import { Router, type Router as RouterType } from 'express';
import { createReviewHandler, getBusinessReviews, replyToReviewHandler } from './controller';
import { authenticateJWT, requireRole } from '../auth/middleware';

const router: RouterType = Router();

/**
 * Review routes.
 * - GET /reviews/:businessId — public, list reviews for a business
 * - POST /reviews — authenticated, create a review
 * - PUT /reviews/:reviewId/reply — merchant only, reply to a review
 */
router.get('/:businessId', getBusinessReviews);
router.post('/', authenticateJWT, createReviewHandler);
router.put('/:reviewId/reply', authenticateJWT, requireRole('merchant'), replyToReviewHandler);

export const reviewRoutes: RouterType = router;