import { Review, type ReviewDocument } from './model';
import { Business } from '../businesses/model';
import { AppError } from '../shared/error';
import type { CreateReviewInput, ReplyInput } from './schemas';

/**
 * Create a new review for a business.
 * RV-01: Authenticated users submit rating (1-5) and optional comment.
 * Verifies the business exists and is active.
 */
export async function createReview(
  userId: string,
  input: CreateReviewInput,
): Promise<ReviewDocument> {
  // Verify business exists and is active
  const business = await Business.findById(input.businessId);
  if (!business) {
    throw new AppError(404, 'Business not found');
  }
  if (!business.isActive) {
    throw new AppError(400, 'Cannot review a deactivated business');
  }

  const review = await Review.create({
    business: input.businessId,
    user: userId,
    rating: input.rating,
    comment: input.comment ?? '',
  });

  // RV-02: Recalculate business avgRating after each review
  await recalculateAvgRating(input.businessId);

  return review;
}

/**
 * Find all reviews for a business, sorted by creation date (newest first).
 */
export async function findByBusiness(businessId: string): Promise<ReviewDocument[]> {
  const business = await Business.findById(businessId);
  if (!business) {
    throw new AppError(404, 'Business not found');
  }

  return Review.find({ business: businessId }).sort({ createdAt: -1 });
}

/**
 * Merchant reply to a review.
 * RV-03: Merchants MAY reply once per review.
 * Verifies that the requesting user owns the business being reviewed.
 */
export async function replyToReview(
  reviewId: string,
  merchantId: string,
  input: ReplyInput,
): Promise<ReviewDocument> {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new AppError(404, 'Review not found');
  }

  // Check if already replied
  if (review.reply) {
    throw new AppError(400, 'Review already has a reply');
  }

  // Verify the merchant owns the business being reviewed
  const business = await Business.findById(review.business);
  if (!business) {
    throw new AppError(404, 'Business not found');
  }

  if (business.owner.toString() !== merchantId) {
    throw new AppError(403, 'Only the business owner can reply to reviews');
  }

  review.reply = input.replyContent;
  await review.save();

  return review;
}

/**
 * Recalculate the average rating for a business.
 * RV-02: avgRating = sum(ratings) / count, displayed with 1 decimal place.
 */
export async function recalculateAvgRating(businessId: string): Promise<void> {
  const result = await Review.aggregate([
    { $match: { business: new (await import('mongoose')).Types.ObjectId(businessId) } },
    {
      $group: {
        _id: '$business',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  const avgRating = result.length > 0 ? Math.round(result[0].avgRating * 10) / 10 : 0;

  await Business.findByIdAndUpdate(businessId, { avgRating });
}

/**
 * Map a ReviewDocument to a plain object for response.
 */
export function toReviewResponse(doc: ReviewDocument) {
  return {
    id: doc.id,
    businessId: doc.business.toString(),
    userId: doc.user.toString(),
    rating: doc.rating,
    comment: doc.comment,
    reply: doc.reply ?? undefined,
    createdAt: doc.createdAt,
  };
}