import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { hashRefreshToken } from '@/lib/auth/helpers';
import { clearAuthCookies } from '@/lib/auth/jwt';
import { createErrorResponse, createSuccessResponse } from '@/lib/api/errors';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (refreshToken) {
      await connectDB();

      const refreshTokenHash = hashRefreshToken(refreshToken);

      // Remove the refresh token from user's token list
      await User.updateOne(
        { 'refreshTokens.token': refreshTokenHash },
        { $pull: { refreshTokens: { token: refreshTokenHash } } }
      );
    }

    // Clear auth cookies
    await clearAuthCookies();

    return NextResponse.json(
      createSuccessResponse({}, 'Logout successful'),
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      createErrorResponse(500, 'Internal server error', 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
}
