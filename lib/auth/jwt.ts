import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { UserRole, EmployeePermission } from '../types/roles';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  permissions: EmployeePermission[];
  companyId: string;
  iat?: number;
  exp?: number;
}

export async function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>, expiresIn: string = '24h') {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);

  return token;
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, secret);
    const payload = verified.payload;
    
    // Validate that the payload has the required fields
    if (
      typeof payload.userId === 'string' &&
      typeof payload.email === 'string' &&
      typeof payload.role === 'string' &&
      typeof payload.companyId === 'string' &&
      Array.isArray(payload.permissions)
    ) {
      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role as UserRole,
        permissions: payload.permissions as EmployeePermission[],
        companyId: payload.companyId,
        iat: payload.iat,
        exp: payload.exp,
      };
    }
    
    return null;
  } catch (err) {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) {
    return null;
  }

  return verifyJWT(token);
}

// Alias for getSession to maintain backward compatibility
export const auth = getSession;

export async function setAuthCookies(
  accessToken: string,
  refreshToken: string,
  accessTokenExpiresIn: number = 86400 // 24 hours in seconds
) {
  const cookieStore = await cookies();

  const accessTokenExpiry = new Date();
  accessTokenExpiry.setSeconds(accessTokenExpiry.getSeconds() + accessTokenExpiresIn);

  const refreshTokenExpiry = new Date();
  refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days

  cookieStore.set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: accessTokenExpiry,
  });

  cookieStore.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: refreshTokenExpiry,
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
}
