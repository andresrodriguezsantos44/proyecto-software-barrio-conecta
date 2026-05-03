import type { Response, NextFunction } from 'express';
import { validate, createReviewSchema, replySchema, type CreateReviewInput, type ReplyInput } from './schemas';
import { createReview, findByBusiness, replyToReview, toReviewResponse } from './service';
import { AuthenticatedRequest } from '../auth/middleware';

/**
 * POST /reviews
 * Create a new review (authenticated users only).
 * RV-01: rating 1-5, comment ≤300 chars.
 */
export async function createReviewHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = validate<CreateReviewInput>(createReviewSchema, req.body);
    const review = await createReview(req.user!.userId, input);
    const response = toReviewResponse(review);

    res.status(201).json({
      status: 'success',
      data: response,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /reviews/:businessId
 * Fetch all reviews for a business, sorted newest first.
 */
export async function getBusinessReviews(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const businessId = req.params.businessId as string;
    const reviews = await findByBusiness(businessId);
    const data = reviews.map(toReviewResponse);

    res.json({
      status: 'success',
      data,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /reviews/:reviewId/reply
 * Merchant reply to a review.
 * RV-03: Only the business owner can reply. One reply per review max.
 */
export async function replyToReviewHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const reviewId = req.params.reviewId as string;
    const input = validate<ReplyInput>(replySchema, req.body);
    const review = await replyToReview(reviewId, req.user!.userId, input);
    const response = toReviewResponse(review);

    res.json({
      status: 'success',
      data: response,
    });
  } catch (err) {
    next(err);
  }
}