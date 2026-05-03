// ============================================================================
// BarrioConecta — Reviews API Module
// Review creation, listing, and merchant replies.
// ============================================================================

import { api } from './client';
import type { Review, CreateReviewRequest, ReplyToReviewRequest } from '@barrio-conecta/contracts';

/** POST /reviews — create a review (authenticated user) */
export function createReview(data: CreateReviewRequest): Promise<Review> {
  return api.authPost<Review>('/reviews', data);
}

/** GET /reviews/:businessId — list reviews for a business (public) */
export function getBusinessReviews(businessId: string): Promise<Review[]> {
  return api.get<Review[]>(`/reviews/${businessId}`);
}

/** PUT /reviews/:reviewId/reply — merchant reply to a review */
export function replyToReview(reviewId: string, data: ReplyToReviewRequest): Promise<Review> {
  return api.authPut<Review>(`/reviews/${reviewId}/reply`, data);
}