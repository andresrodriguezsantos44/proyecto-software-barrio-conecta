// ============================================================================
// BarrioConecta — Reviews Store
// Pinia store for review listing, creation, and merchant replies.
// ============================================================================

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { reviewsApi } from '@/api';
import type { Review, CreateReviewRequest } from '@barrio-conecta/contracts';

export const useReviewsStore = defineStore('reviews', () => {
  // --- State ---
  const businessReviews = ref<Review[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // --- Actions ---

  /** Fetch reviews for a specific business */
  async function fetchBusinessReviews(businessId: string): Promise<Review[]> {
    loading.value = true;
    error.value = null;
    try {
      businessReviews.value = await reviewsApi.getBusinessReviews(businessId);
      return businessReviews.value;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load reviews';
      error.value = message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /** Create a new review (authenticated user) */
  async function createReview(data: CreateReviewRequest): Promise<Review> {
    loading.value = true;
    error.value = null;
    try {
      const review = await reviewsApi.createReview(data);
      businessReviews.value.unshift(review);
      return review;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create review';
      error.value = message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /** Merchant reply to a review */
  async function replyToReview(reviewId: string, replyContent: string): Promise<Review> {
    loading.value = true;
    error.value = null;
    try {
      const updated = await reviewsApi.replyToReview(reviewId, { replyContent });
      // Update in local array
      const idx = businessReviews.value.findIndex((r) => r.id === reviewId);
      if (idx !== -1) {
        businessReviews.value[idx] = updated;
      }
      return updated;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reply';
      error.value = message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function clearReviews(): void {
    businessReviews.value = [];
    error.value = null;
  }

  return {
    // State
    businessReviews,
    loading,
    error,
    // Actions
    fetchBusinessReviews,
    createReview,
    replyToReview,
    clearReviews,
  };
});