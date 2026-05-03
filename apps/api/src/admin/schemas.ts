import Joi from 'joi';
import { AppError } from '../shared/error';
import type { ReportStatus } from '@barrio-conecta/contracts';

/**
 * Joi schema for PATCH /admin/reports/:reportId
 * AD-01: status transitions to IN_REVIEW or RESOLVED
 */
export const updateReportSchema = Joi.object({
  status: Joi.string().valid('IN_REVIEW', 'RESOLVED').required().messages({
    'any.only': 'Status must be one of: IN_REVIEW, RESOLVED',
    'any.required': 'Status is required',
  }),
});

/**
 * Joi schema for POST /reports (neighbor report creation)
 */
export const createReportSchema = Joi.object({
  targetType: Joi.string().valid('business', 'review').required().messages({
    'any.only': 'Target type must be one of: business, review',
    'any.required': 'Target type is required',
  }),
  targetId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Target ID must be a valid 24-character hex string',
    'any.required': 'Target ID is required',
  }),
  reason: Joi.string().valid('spam', 'false_info', 'inappropriate', 'other').required().messages({
    'any.only': 'Reason must be one of: spam, false_info, inappropriate, other',
    'any.required': 'Reason is required',
  }),
  description: Joi.string().max(500).allow('').optional().messages({
    'string.max': 'Description must be 500 characters or fewer',
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

export interface UpdateReportInput {
  status: ReportStatus;
}

export interface CreateReportInput {
  targetType: 'business' | 'review';
  targetId: string;
  reason: 'spam' | 'false_info' | 'inappropriate' | 'other';
  description?: string;
}