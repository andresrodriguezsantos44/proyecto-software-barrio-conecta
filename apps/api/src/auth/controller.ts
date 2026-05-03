import type { Request, Response, NextFunction } from 'express';
import { validate, registerSchema, loginSchema, type RegisterInput, type LoginInput } from './schemas';
import { registerUser, loginUser, toAuthResponse } from './service';

/**
 * POST /auth/register
 * Creates a new user and returns a JWT.
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = validate<RegisterInput>(registerSchema, req.body);
    const { user, token } = await registerUser(input.email, input.password, input.name, input.role);
    const response = toAuthResponse(user, token);

    res.status(201).json({
      status: 'success',
      data: response,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /auth/login
 * Authenticates a user and returns a JWT.
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = validate<LoginInput>(loginSchema, req.body);
    const { user, token } = await loginUser(input.email, input.password);
    const response = toAuthResponse(user, token);

    res.json({
      status: 'success',
      data: response,
    });
  } catch (err) {
    next(err);
  }
}