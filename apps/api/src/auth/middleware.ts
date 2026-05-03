import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from './service';
import { AppError } from '../shared/error';
import type { UserRole } from '@barrio-conecta/contracts';

/**
 * Extend Express Request to carry authenticated user info.
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: UserRole;
  };
}

/**
 * JWT authentication middleware.
 * Extracts Bearer token from Authorization header, verifies it,
 * and attaches decoded payload to req.user.
 * Returns 401 if token is missing or invalid.
 */
export function authenticateJWT(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new AppError(401, 'Missing or invalid authorization header'));
    return;
  }

  const token = authHeader.split(' ')[1] as string;
  const payload = verifyToken(token);

  if (!payload) {
    next(new AppError(401, 'Invalid or expired token'));
    return;
  }

  req.user = payload;
  next();
}

/**
 * Role guard middleware factory.
 * Returns middleware that checks req.user.role against allowed roles.
 * Returns 403 if the authenticated user's role is not allowed.
 * Must be used AFTER authenticateJWT.
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, 'Authentication required'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError(403, 'Insufficient permissions'));
      return;
    }

    next();
  };
}