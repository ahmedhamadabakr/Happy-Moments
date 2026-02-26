import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { hashRefreshToken, isTokenExpired } from '@/lib/auth/helpers';
import { verifyJWT, signJWT, setAuthCookies } from '@/lib/auth/jwt';
import { createErrorResponse, createSuccessResponse } from '@/lib/api/errors';

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookies
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        createErrorResponse(401, 'Refresh token is missing', 'NO_REFRESH_TOKEN'),
        { status: 401 }
      );
    }

    await connectDB();

    const refreshTokenHash = hashRefreshToken(refreshToken);

    // Find user with matching refresh token
    const user = await User.findOne({
      'refreshTokens.token': refreshTokenHash,
    });

    if (!user) {
      return NextResponse.json(
        createErrorResponse(401, 'Invalid refresh token', 'INVALID_REFRESH_TOKEN'),
        { status: 401 }
      );
    }

    // Check if refresh token is expired
    const tokenData = user.refreshTokens.find((t) => t.token === refreshTokenHash);
    if (!tokenData || isTokenExpired(tokenData.expiresAt)) {
      return NextResponse.json(
        createErrorResponse(401, 'Refresh token has expired', 'REFRESH_TOKEN_EXPIRED'),
        { status: 401 }
      );
    }

    // Create new access token
    const accessToken = await signJWT({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Set new access token in cookie
    await setAuthCookies(accessToken, refreshToken);

    return NextResponse.json(
      createSuccessResponse({
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      }, 'Token refreshed successfully'),
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      createErrorResponse(500, 'Internal server error', 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
}
