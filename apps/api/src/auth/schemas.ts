import Joi from 'joi';
import type { UserRole } from '@barrio-conecta/contracts';
import { AppError } from '../shared/error';

/**
 * Joi schema for POST /auth/register
 * - email: valid email, normalized
 * - password: ≥8 chars
 * - name: ≥1 char, ≤100 chars
 * - role: one of 'merchant' | 'admin' | 'neighbor' (defaults to 'neighbor')
 */
export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Must be a valid email',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters',
    'any.required': 'Password is required',
  }),
  name: Joi.string().min(1).max(100).required().messages({
    'string.min': 'Name is required',
    'string.max': 'Name must be 100 characters or fewer',
    'any.required': 'Name is required',
  }),
  role: Joi.string().valid('merchant', 'admin', 'neighbor').default('neighbor').messages({
    'any.only': 'Role must be one of: merchant, admin, neighbor',
  }),
});

/**
 * Joi schema for POST /auth/login
 * - email: valid email
 * - password: any non-empty string
 */
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Must be a valid email',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
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

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}