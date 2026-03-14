import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { z } from 'zod';
import { hashPassword, generateRefreshToken, calculateTokenExpiry, hashRefreshToken } from '@/lib/auth/helpers';
import { signJWT, setAuthCookies } from '@/lib/auth/jwt';
import { handleApiError, createErrorResponse, createSuccessResponse } from '@/lib/api/errors';
import { EmployeePermission } from '@/lib/types/roles';

const registerSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email().max(255),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = registerSchema.parse(body);

    await connectDB();

    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return NextResponse.json(
        createErrorResponse(409, 'Email already registered', 'USER_EXISTS'),
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(validatedData.password);
    const refreshTokenString = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshTokenString);
    const refreshTokenExpiry = calculateTokenExpiry(7);

    const user = new User({
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email,
      password: hashedPassword,
      role: 'manager',
      permissions: Object.values(EmployeePermission),
      refreshTokens: [{ token: refreshTokenHash, expiresAt: refreshTokenExpiry }],
    });
    await user.save();

    const accessToken = await signJWT({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      permissions: [...user.permissions],
    });

    await setAuthCookies(accessToken, refreshTokenString);

    return NextResponse.json(
      createSuccessResponse(
        {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
          },
        },
        'Registration successful'
      ),
      { status: 201 }
    );
  } catch (error: any) {
    return handleApiError(error);
  }
}
