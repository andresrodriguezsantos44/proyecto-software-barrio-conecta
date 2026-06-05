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
 * Genera un JWT firmado (HS256) con `userId` y `role` como claims.
 * La vigencia se toma de `config.jwtExpiresIn`.
 *
 * @param userId - Identificador del usuario.
 * @param role - Rol del usuario (`merchant` | `admin` | `neighbor`).
 * @returns El token JWT firmado.
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
 * Registra un nuevo usuario: hashea la contraseña, lo persiste y emite un JWT.
 *
 * @param email - Email del usuario (se normaliza a minúsculas).
 * @param password - Contraseña en texto plano (se hashea con bcrypt).
 * @param name - Nombre visible del usuario.
 * @param role - Rol a asignar. Por defecto `neighbor`.
 * @returns El documento del usuario creado y su token JWT.
 * @throws {AppError} 409 si el email ya está registrado.
 *
 * @example
 * ```ts
 * const { user, token } = await registerUser('ana@barrio.com', 'secret123', 'Ana', 'merchant');
 * ```
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
 * Autentica un usuario por email y contraseña.
 *
 * Por seguridad devuelve siempre el mismo error genérico ante credenciales
 * inválidas: nunca revela si el email existe.
 *
 * @param email - Email del usuario.
 * @param password - Contraseña en texto plano a verificar contra el hash.
 * @returns El documento del usuario y un nuevo token JWT.
 * @throws {AppError} 401 (`Invalid credentials`) si el email no existe o la contraseña no coincide.
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