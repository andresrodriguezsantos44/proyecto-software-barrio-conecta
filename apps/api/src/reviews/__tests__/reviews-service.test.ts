import { describe, it, expect } from 'bun:test';
import { toReviewResponse } from '../service';
import type { ReviewDocument } from '../model';

// ---------------------------------------------------------------------------
// Unit: toReviewResponse — additional edge cases
// ---------------------------------------------------------------------------
describe('Review Service — toReviewResponse (comprehensive)', () => {
  it('should include updatedAt when present', () => {
    const mockDoc = {
      id: 'review999',
      business: { toString: () => 'biz1' },
      user: { toString: () => 'u1' },
      rating: 5,
      comment: 'Perfect!',
      reply: null,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-02'),
    } as unknown as ReviewDocument;

    const result = toReviewResponse(mockDoc);

    expect(result.id).toBe('review999');
    expect(result.rating).toBe(5);
    expect(result.comment).toBe('Perfect!');
    expect(result.reply).toBeUndefined();
  });

  it('should handle review with empty comment', () => {
    const mockDoc = {
      id: 'review100',
      business: { toString: () => 'biz2' },
      user: { toString: () => 'u2' },
      rating: 1,
      comment: '',
      reply: null,
      createdAt: new Date('2026-03-01'),
    } as unknown as ReviewDocument;

    const result = toReviewResponse(mockDoc);

    expect(result.rating).toBe(1);
    expect(result.comment).toBe('');
    expect(result.reply).toBeUndefined();
  });

  it('should handle review with reply', () => {
    const mockDoc = {
      id: 'review200',
      business: { toString: () => 'biz3' },
      user: { toString: () => 'u3' },
      rating: 3,
      comment: 'Decent',
      reply: 'Thanks for your feedback!',
      createdAt: new Date('2026-04-01'),
    } as unknown as ReviewDocument;

    const result = toReviewResponse(mockDoc);

    expect(result.reply).toBe('Thanks for your feedback!');
    expect(result.rating).toBe(3);
  });

  it('should handle review with minimum rating', () => {
    const mockDoc = {
      id: 'review300',
      business: { toString: () => 'biz4' },
      user: { toString: () => 'u4' },
      rating: 1,
      comment: 'Terrible',
      reply: null,
      createdAt: new Date('2026-05-01'),
    } as unknown as ReviewDocument;

    const result = toReviewResponse(mockDoc);

    expect(result.rating).toBe(1);
    expect(result.businessId).toBe('biz4');
    expect(result.userId).toBe('u4');
  });
});

// ---------------------------------------------------------------------------
// Unit: Review error types (comprehensive)
// ---------------------------------------------------------------------------
describe('Review Service — error types (comprehensive)', () => {
  it('should cover 404 for review not found', () => {
    const { AppError } = require('../../shared/error');
    const err = new AppError(404, 'Review not found');
    expect(err.statusCode).toBe(404);
    expect(err.status).toBe('fail');
  });

  it('should cover 400 for deactivated business review attempt', () => {
    const { AppError } = require('../../shared/error');
    const err = new AppError(400, 'Cannot review a deactivated business');
    expect(err.statusCode).toBe(400);
  });

  it('should cover 400 for duplicate reply', () => {
    const { AppError } = require('../../shared/error');
    const err = new AppError(400, 'Review already has a reply');
    expect(err.statusCode).toBe(400);
    expect(err.isOperational).toBe(true);
  });

  it('should cover 403 for non-owner reply attempt', () => {
    const { AppError } = require('../../shared/error');
    const err = new AppError(403, 'Only the business owner can reply to reviews');
    expect(err.statusCode).toBe(403);
  });
});