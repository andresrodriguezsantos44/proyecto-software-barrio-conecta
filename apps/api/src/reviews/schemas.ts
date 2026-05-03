import Joi from 'joi';
import { AppError } from '../shared/error';

/**
 * Joi schema for POST /reviews (create review)
 * RV-01: rating 1-5 integer, comment ≤300 chars optional
 */
export const createReviewSchema = Joi.object({
  businessId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Business ID must be a valid 24-character hex string',
    'any.required': 'Business ID is required',
  }),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating must be at most 5',
    'any.required': 'Rating is required',
  }),
  comment: Joi.string().max(300).allow('').optional().messages({
    'string.max': 'Comment must be 300 characters or fewer',
  }),
});

/**
 * Joi schema for PUT /reviews/:reviewId/reply
 * RV-03: merchant reply ≤300 chars
 */
export const replySchema = Joi.object({
  replyContent: Joi.string().min(1).max(300).required().messages({
    'string.min': 'Reply content cannot be empty',
    'string.max': 'Reply must be 300 characters or fewer',
    'any.required': 'Reply content is required',
  }),
});

/**
 * Validate a payload against a Joi schema.
 * Returns the validated value or throws an AppError with 400 status.
 */
export function validate<T>(schema: Joi.ObjectSchema, payload: unknown): T {
  const { error, value } = schema.validate(payload, { abortEarly: false, stripUnknown: true });
  if (error) {
    const message = error.details.map((d) => d.message).join('; ');
    throw new AppError(400, message);
  }
  return value as T;
}

export interface CreateReviewInput {
  businessId: string;
  rating: number;
  comment?: string;
}

export interface ReplyInput {
  replyContent: string;
}