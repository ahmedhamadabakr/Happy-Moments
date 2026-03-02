import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Company } from '@/lib/models/Company';
import { loginSchema } from '@/lib/validations/auth';
import {
  comparePassword,
  generateRefreshToken,
  calculateTokenExpiry,
  hashRefreshToken,
} from '@/lib/auth/helpers';
import { signJWT, setAuthCookies } from '@/lib/auth/jwt';
import {
  handleApiError,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/api/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Login attempt for:', body.email);

    // Validate input
    const validatedData = loginSchema.parse(body);

    await connectDB();

    // Find user
    const user = await User.findOne({
      email: validatedData.email,
    }).select('+password');

    if (!user) {
      return NextResponse.json(
        createErrorResponse(401, 'Invalid email or password', 'INVALID_CREDENTIALS'),
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        createErrorResponse(403, 'User account is inactive', 'USER_INACTIVE'),
        { status: 403 }
      );
    }

    // Compare password
    const isPasswordValid = await comparePassword(
      validatedData.password,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        createErrorResponse(401, 'Invalid email or password', 'INVALID_CREDENTIALS'),
        { status: 401 }
      );
    }

    // Ensure refreshTokens exists
    if (!Array.isArray(user.refreshTokens)) {
      user.refreshTokens = [];
    }

    // Generate refresh token
    const refreshTokenString = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshTokenString);
    const refreshTokenExpiry = calculateTokenExpiry(7);

    user.refreshTokens.push({
      token: refreshTokenHash,
      expiresAt: refreshTokenExpiry,
      createdAt: new Date(),
    });

    // Keep only last 5 tokens
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }

    await user.save();

    // Get company safely
    let company = null;
    if (user.company) {
      company = await Company.findById(user.company);
    }

    // Create access token safely
    const accessToken = await signJWT({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      permissions: user.permissions ? [...user.permissions] : [],
      companyId: user.company ? user.company.toString() : '',
    });
    
    // Set cookies
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
            company: company
              ? {
                  id: company._id,
                  name: company.name,
                  email: company.email,
                }
              : null,
          },
        },
        'Login successful'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Login error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        createErrorResponse(400, 'Validation failed', 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    const { status, body } = handleApiError(error);
    return NextResponse.json(body, { status });
  }
}