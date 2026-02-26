import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function calculateTokenExpiry(days: number): Date {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  return expiryDate;
}

export function isTokenExpired(expiryDate: Date): boolean {
  return new Date() > expiryDate;
}
