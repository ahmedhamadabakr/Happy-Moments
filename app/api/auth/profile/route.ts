import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { getSession } from '@/lib/auth/jwt';
import { createErrorResponse, createSuccessResponse } from '@/lib/api/errors';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        createErrorResponse(401, 'Unauthorized', 'NO_SESSION'),
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.userId);

    if (!user) {
      return NextResponse.json(
        createErrorResponse(404, 'User not found', 'USER_NOT_FOUND'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      createSuccessResponse({
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
        },
      }),
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      createErrorResponse(500, error.message || 'Internal server error', 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
}
