import Joi from 'joi';
import { AppError } from '../shared/error';

/**
 * Joi schema for POST /businesses (create business)
 * BM-01: name ≥3 chars, category (ObjectId string), location (GeoJSON Point),
 *        schedule (mon–sun with open/close), photos ≤3
 */
const scheduleDaySchema = Joi.object({
  open: Joi.string().pattern(/^\d{2}:\d{2}$/).required().messages({
    'string.pattern.base': 'Schedule times must be in HH:MM format',
    'any.required': 'Schedule open time is required',
  }),
  close: Joi.string().pattern(/^\d{2}:\d{2}$/).required().messages({
    'string.pattern.base': 'Schedule times must be in HH:MM format',
    'any.required': 'Schedule close time is required',
  }),
});

const scheduleWeekSchema = Joi.object({
  mon: scheduleDaySchema.required(),
  tue: scheduleDaySchema.required(),
  wed: scheduleDaySchema.required(),
  thu: scheduleDaySchema.required(),
  fri: scheduleDaySchema.required(),
  sat: scheduleDaySchema.required(),
  sun: scheduleDaySchema.required(),
});

export const createBusinessSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Business name must be at least 3 characters',
    'string.max': 'Business name must be 100 characters or fewer',
    'any.required': 'Business name is required',
  }),
  description: Joi.string().max(500).allow('').optional().messages({
    'string.max': 'Description must be 500 characters or fewer',
  }),
  categoryId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Category ID must be a valid 24-character hex string',
    'any.required': 'Category is required',
  }),
  location: Joi.object({
    type: Joi.string().valid('Point').required(),
    coordinates: Joi.array().items(Joi.number()).length(2).required().messages({
      'array.length': 'Coordinates must contain exactly 2 numbers [lng, lat]',
      'any.required': 'Location coordinates are required',
    }),
  }).required().messages({
    'any.required': 'Location is required',
  }),
  schedule: scheduleWeekSchema.required().messages({
    'any.required': 'Business schedule is required',
  }),
  photos: Joi.array().items(Joi.string().uri()).max(3).optional().messages({
    'array.max': 'Maximum 3 photos allowed',
    'string.uri': 'Photo must be a valid URL',
  }),
});

/**
 * Joi schema for PUT /businesses/:id (update business)
 * All fields optional, but follow same validation rules.
 */
export const updateBusinessSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional().messages({
    'string.min': 'Business name must be at least 3 characters',
    'string.max': 'Business name must be 100 characters or fewer',
  }),
  description: Joi.string().max(500).allow('').optional(),
  categoryId: Joi.string().hex().length(24).optional().messages({
    'string.hex': 'Category ID must be a valid 24-character hex string',
  }),
  location: Joi.object({
    type: Joi.string().valid('Point').required(),
    coordinates: Joi.array().items(Joi.number()).length(2).required(),
  }).optional(),
  schedule: scheduleWeekSchema.optional(),
  photos: Joi.array().items(Joi.string().uri()).max(3).optional().messages({
    'array.max': 'Maximum 3 photos allowed',
    'string.uri': 'Photo must be a valid URL',
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

export interface CreateBusinessInput {
  name: string;
  description?: string;
  categoryId: string;
  location: { type: 'Point'; coordinates: [number, number] };
  schedule: Record<string, { open: string; close: string }>;
  photos?: string[];
}

export interface UpdateBusinessInput {
  name?: string;
  description?: string;
  categoryId?: string;
  location?: { type: 'Point'; coordinates: [number, number] };
  schedule?: Record<string, { open: string; close: string }>;
  photos?: string[];
}