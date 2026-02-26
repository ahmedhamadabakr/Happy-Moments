import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user';
  iat?: number;
  exp?: number;
}

export async function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>, expiresIn: string = '1h') {
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
      (payload.role === 'admin' || payload.role === 'user')
    ) {
      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
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
  accessTokenExpiresIn: number = 3600 // 1 hour in seconds
) {
  const cookieStore = await cookies();

  cookieStore.set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: accessTokenExpiresIn,
  });

  cookieStore.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
}
