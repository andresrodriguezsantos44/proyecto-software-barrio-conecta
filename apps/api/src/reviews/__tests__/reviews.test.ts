import { describe, it, expect } from 'bun:test';
import { validate, createReviewSchema, replySchema, type CreateReviewInput, type ReplyInput } from '../schemas';
import { toReviewResponse } from '../service';
import { AppError } from '../../shared/error';
import type { ReviewDocument } from '../model';

// ---------------------------------------------------------------------------
// Unit: Joi validation — createReviewSchema
// ---------------------------------------------------------------------------
describe('Review Schemas — createReviewSchema', () => {
  const validInput: CreateReviewInput = {
    businessId: '507f1f77bcf86cd799439011',
    rating: 5,
    comment: 'Excellent service!',
  };

  it('should validate a correct review creation payload', () => {
    const result = validate<CreateReviewInput>(createReviewSchema, validInput);
    expect(result.businessId).toBe('507f1f77bcf86cd799439011');
    expect(result.rating).toBe(5);
    expect(result.comment).toBe('Excellent service!');
  });

  it('should validate without optional comment', () => {
    const input = { businessId: '507f1f77bcf86cd799439011', rating: 3 };
    const result = validate<CreateReviewInput>(createReviewSchema, input);
    expect(result.rating).toBe(3);
  });

  it('should accept empty string comment', () => {
    const input = { businessId: '507f1f77bcf86cd799439011', rating: 4, comment: '' };
    const result = validate<CreateReviewInput>(createReviewSchema, input);
    expect(result.comment).toBe('');
  });

  it('should reject rating below 1', () => {
    expect(() =>
      validate(createReviewSchema, { ...validInput, rating: 0 }),
    ).toThrow(/at least 1/i);
  });

  it('should reject rating above 5', () => {
    expect(() =>
      validate(createReviewSchema, { ...validInput, rating: 6 }),
    ).toThrow(/at most 5/i);
  });

  it('should reject non-integer rating', () => {
    expect(() =>
      validate(createReviewSchema, { ...validInput, rating: 3.5 }),
    ).toThrow(/integer/i);
  });

  it('should reject comment longer than 300 chars', () => {
    expect(() =>
      validate(createReviewSchema, { ...validInput, comment: 'x'.repeat(301) }),
    ).toThrow(/300 characters/i);
  });

  it('should accept comment at exactly 300 chars', () => {
    const input = { ...validInput, comment: 'x'.repeat(300) };
    const result = validate<CreateReviewInput>(createReviewSchema, input);
    expect(result.comment!.length).toBe(300);
  });

  it('should reject missing businessId', () => {
    expect(() =>
      validate(createReviewSchema, { rating: 4 }),
    ).toThrow(/Business ID/i);
  });

  it('should reject invalid businessId format', () => {
    expect(() =>
      validate(createReviewSchema, { ...validInput, businessId: 'not-a-hex' }),
    ).toThrow();
  });

  it('should reject missing rating', () => {
    expect(() =>
      validate(createReviewSchema, { businessId: '507f1f77bcf86cd799439011' }),
    ).toThrow(/Rating/i);
  });
});

// ---------------------------------------------------------------------------
// Unit: Joi validation — replySchema
// ---------------------------------------------------------------------------
describe('Review Schemas — replySchema', () => {
  const validInput: ReplyInput = {
    replyContent: 'Thank you for your review!',
  };

  it('should validate a correct reply payload', () => {
    const result = validate<ReplyInput>(replySchema, validInput);
    expect(result.replyContent).toBe('Thank you for your review!');
  });

  it('should reject empty reply content', () => {
    expect(() =>
      validate(replySchema, { replyContent: '' }),
    ).toThrow(/empty/i);
  });

  it('should reject reply longer than 300 chars', () => {
    expect(() =>
      validate(replySchema, { replyContent: 'x'.repeat(301) }),
    ).toThrow(/300 characters/i);
  });

  it('should accept reply at exactly 300 chars', () => {
    const input = { replyContent: 'x'.repeat(300) };
    const result = validate<ReplyInput>(replySchema, input);
    expect(result.replyContent.length).toBe(300);
  });

  it('should reject missing replyContent', () => {
    expect(() =>
      validate(replySchema, {}),
    ).toThrow(/required/i);
  });
});

// ---------------------------------------------------------------------------
// Unit: toReviewResponse mapper
// ---------------------------------------------------------------------------
describe('Review Service — toReviewResponse', () => {
  it('should map a review document to response format', () => {
    const mockDoc = {
      id: 'review123',
      business: { toString: () => 'biz456' },
      user: { toString: () => 'user789' },
      rating: 4,
      comment: 'Great food!',
      reply: 'Thank you!',
      createdAt: new Date('2026-01-15'),
    } as unknown as ReviewDocument;

    const result = toReviewResponse(mockDoc);

    expect(result.id).toBe('review123');
    expect(result.businessId).toBe('biz456');
    expect(result.userId).toBe('user789');
    expect(result.rating).toBe(4);
    expect(result.comment).toBe('Great food!');
    expect(result.reply).toBe('Thank you!');
  });

  it('should map review without reply (undefined)', () => {
    const mockDoc = {
      id: 'review456',
      business: { toString: () => 'biz789' },
      user: { toString: () => 'user012' },
      rating: 3,
      comment: 'It was okay',
      reply: null,
      createdAt: new Date('2026-02-01'),
    } as unknown as ReviewDocument;

    const result = toReviewResponse(mockDoc);

    expect(result.reply).toBeUndefined();
    expect(result.rating).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// Unit: Error types for review flows
// ---------------------------------------------------------------------------
describe('Review Service — error construction', () => {
  it('should create AppError(404) for business not found', () => {
    const err = new AppError(404, 'Business not found');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Business not found');
  });

  it('should create AppError(400) for deactivated business review', () => {
    const err = new AppError(400, 'Cannot review a deactivated business');
    expect(err.statusCode).toBe(400);
  });

  it('should create AppError(400) for duplicate reply', () => {
    const err = new AppError(400, 'Review already has a reply');
    expect(err.statusCode).toBe(400);
  });

  it('should create AppError(403) for non-owner reply attempt', () => {
    const err = new AppError(403, 'Only the business owner can reply to reviews');
    expect(err.statusCode).toBe(403);
  });
});