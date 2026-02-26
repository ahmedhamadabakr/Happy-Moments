import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { loginSchema } from '@/lib/validations/auth';
import { comparePassword, generateRefreshToken, calculateTokenExpiry, hashRefreshToken } from '@/lib/auth/helpers';
import { signJWT, setAuthCookies } from '@/lib/auth/jwt';
import { handleApiError, createErrorResponse, createSuccessResponse } from '@/lib/api/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Login attempt for:', body.email);

    // Validate input
    const validatedData = loginSchema.parse(body);
    console.log('Validation passed');

    await connectDB();
    console.log('DB connected');

    // Find user by email and select password
    const user = await User.findOne({ email: validatedData.email }).select('+password').populate('company');
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      return NextResponse.json(
        createErrorResponse(401, 'Invalid email or password', 'INVALID_CREDENTIALS'),
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        createErrorResponse(403, 'User account is inactive', 'USER_INACTIVE'),
        { status: 403 }
      );
    }

    console.log('Comparing passwords...');
    // Compare passwords
    const isPasswordValid = await comparePassword(validatedData.password, user.password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return NextResponse.json(
        createErrorResponse(401, 'Invalid email or password', 'INVALID_CREDENTIALS'),
        { status: 401 }
      );
    }

    // Generate new refresh token
    const refreshTokenString = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshTokenString);
    const refreshTokenExpiry = calculateTokenExpiry(7);

    // Add new refresh token and keep only last 5 tokens (for security)
    user.refreshTokens.push({
      token: refreshTokenHash,
      expiresAt: refreshTokenExpiry,
      createdAt: new Date(),
    });

    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }

    console.log('Saving user...');
    await user.save();
    console.log('User saved');

    // Create access token
    const accessToken = await signJWT({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
      companyId: user.company.toString(),
    });
    console.log('Access token created');

    // Set auth cookies
    await setAuthCookies(accessToken, refreshTokenString);
    console.log('Cookies set');

    return NextResponse.json(
      createSuccessResponse({
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          company: user.company,
        },
      }, 'Login successful'),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    console.error('Error stack:', error.stack);
    
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
