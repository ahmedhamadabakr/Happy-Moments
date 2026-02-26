import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Company } from '@/lib/models/Company';
import { User } from '@/lib/models/User';
import { registerCompanySchema } from '@/lib/validations/auth';
import { hashPassword, generateRefreshToken, calculateTokenExpiry, hashRefreshToken } from '@/lib/auth/helpers';
import { signJWT, setAuthCookies } from '@/lib/auth/jwt';
import { handleApiError, createErrorResponse, createSuccessResponse } from '@/lib/api/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = registerCompanySchema.parse(body);

    await connectDB();

    // Check if company email exists
    const existingCompany = await Company.findOne({ email: validatedData.companyEmail });
    if (existingCompany) {
      return NextResponse.json(
        createErrorResponse(409, 'Company email already registered', 'COMPANY_EXISTS'),
        { status: 409 }
      );
    }

    // Check if user email exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return NextResponse.json(
        createErrorResponse(409, 'Email already registered', 'USER_EXISTS'),
        { status: 409 }
      );
    }

    // Create company
    const company = new Company({
      name: validatedData.companyName,
      email: validatedData.companyEmail,
    });
    await company.save();

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Generate refresh token
    const refreshTokenString = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshTokenString);
    const refreshTokenExpiry = calculateTokenExpiry(7);

    // Create user as admin (first user of the company)
    const user = new User({
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email,
      password: hashedPassword,
      company: company._id,
      role: 'admin',
      refreshTokens: [
        {
          token: refreshTokenHash,
          expiresAt: refreshTokenExpiry,
        },
      ],
    });
    await user.save();

    // Create access token
    const accessToken = await signJWT({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Set auth cookies
    await setAuthCookies(accessToken, refreshTokenString);

    return NextResponse.json(
      createSuccessResponse({
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
        company: {
          id: company._id,
          name: company.name,
          email: company.email,
        },
      }, 'Company registered successfully'),
      { status: 201 }
    );
  } catch (error: any) {
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
