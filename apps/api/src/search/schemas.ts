import Joi from 'joi';
import { AppError } from '../shared/error';

/**
 * Joi schema for GET /search query parameters.
 * GS-01: categoryId optional, lat/lng required, radius 500|1000|2000.
 * GS-03: Response time budget <1.5s enforced at service layer.
 */
export const searchQuerySchema = Joi.object({
  categoryId: Joi.string().hex().length(24).optional().messages({
    'string.hex': 'Category ID must be a valid 24-character hex string',
  }),
  lat: Joi.number().min(-90).max(90).required().messages({
    'number.min': 'Latitude must be between -90 and 90',
    'number.max': 'Latitude must be between -90 and 90',
    'any.required': 'Latitude is required',
  }),
  lng: Joi.number().min(-180).max(180).required().messages({
    'number.min': 'Longitude must be between -180 and 180',
    'number.max': 'Longitude must be between -180 and 180',
    'any.required': 'Longitude is required',
  }),
  radius: Joi.number().valid(500, 1000, 2000).default(1000).messages({
    'any.only': 'Radius must be 500, 1000, or 2000 meters',
  }),
  q: Joi.string().trim().max(100).optional().messages({
    'string.max': 'Search query must be 100 characters or fewer',
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

export interface SearchInput {
  categoryId?: string;
  lat: number;
  lng: number;
  radius: 500 | 1000 | 2000;
  q?: string;
}