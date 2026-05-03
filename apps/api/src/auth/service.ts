import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { User, type UserDocument } from './model';
import { AppError } from '../shared/error';
import { config } from '../shared/config';
import type { UserRole, AuthResponse } from '@barrio-conecta/contracts';

const BCRYPT_COST = 10;

/**
 * Hash a plaintext password using bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

/**
 * Verify a plaintext password against a bcrypt hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT containing userId and role.
 * Uses HS256 with expiry from config.
 */
export function generateToken(userId: string, role: UserRole): string {
  const options: SignOptions = { expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'] };
  return jwt.sign({ userId, role }, config.jwtSecret, options);
}

/**
 * Verify and decode a JWT. Returns null if invalid or expired.
 */
export function verifyToken(token: string): { userId: string; role: UserRole } | null {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;
    if (typeof decoded === 'object' && 'userId' in decoded && 'role' in decoded) {
      return { userId: decoded.userId as string, role: decoded.role as UserRole };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Find a user by email. Returns null if not found.
 */
export async function findByEmail(email: string): Promise<UserDocument | null> {
  return User.findOne({ email: email.toLowerCase() });
}

/**
 * Register a new user. Throws AppError(409) if email is already taken.
 */
export async function registerUser(
  email: string,
  password: string,
  name: string,
  role: UserRole = 'neighbor',
): Promise<{ user: UserDocument; token: string }> {
  const existing = await findByEmail(email);
  if (existing) {
    throw new AppError(409, 'Email already registered');
  }

  const hashedPassword = await hashPassword(password);
  const user = await User.create({ email: email.toLowerCase(), password: hashedPassword, name, role });
  const token = generateToken(user.id, user.role);

  return { user, token };
}

/**
 * Authenticate a user by email and password.
 * Throws AppError(401) with generic "Invalid credentials" on failure
 * — never reveals whether the email exists.
 */
export async function loginUser(
  email: string,
  password: string,
): Promise<{ user: UserDocument; token: string }> {
  const user = await findByEmail(email);
  if (!user) {
    throw new AppError(401, 'Invalid credentials');
  }

  const isMatch = await verifyPassword(password, user.password);
  if (!isMatch) {
    throw new AppError(401, 'Invalid credentials');
  }

  const token = generateToken(user.id, user.role);
  return { user, token };
}

/**
 * Map a UserDocument to the AuthResponse contract shape.
 */
export function toAuthResponse(user: UserDocument, token: string): AuthResponse {
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
  };
}