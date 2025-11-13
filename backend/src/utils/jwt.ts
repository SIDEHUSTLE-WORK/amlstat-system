// backend/src/utils/jwt.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  organizationId?: string;
}

export interface RefreshTokenPayload {
  id: string;
}

export type TokenPayload = JWTPayload | RefreshTokenPayload;

export const generateToken = (payload: TokenPayload, expiresIn?: string | number): string => {
  // @ts-ignore - TypeScript is being overly strict with jwt.sign overloads
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn || JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, JWT_SECRET);
};

export const decodeToken = (token: string): any => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};