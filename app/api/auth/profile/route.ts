import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Company } from '@/lib/models/Company';
import { getSession } from '@/lib/auth/jwt';
import { createErrorResponse, createSuccessResponse } from '@/lib/api/errors';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      console.log('Profile API - No session found');
      return NextResponse.json(
        createErrorResponse(401, 'Unauthorized', 'NO_SESSION'),
        { status: 401 }
      );
    }

    console.log('Profile API - Session found for user:', session.userId);

    await connectDB();

    // Get user without populate first
    const user = await User.findById(session.userId);

    if (!user) {
      console.log('Profile API - User not found:', session.userId);
      return NextResponse.json(
        createErrorResponse(404, 'User not found', 'USER_NOT_FOUND'),
        { status: 404 }
      );
    }

    console.log('Profile API - User found:', user.email, 'Role:', user.role);

    // Get company separately if exists
    let companyData = null;
    if (user.company) {
      const company = await Company.findById(user.company);
      if (company) {
        companyData = {
          id: company._id,
          name: company.name,
          email: company.email,
        };
      }
    }

    const responseData = {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        company: companyData,
      },
    };

    console.log('Profile API - Success! Role:', user.role);

    return NextResponse.json(
      createSuccessResponse(responseData),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Profile API Error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      createErrorResponse(500, error.message || 'Internal server error', 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
}
