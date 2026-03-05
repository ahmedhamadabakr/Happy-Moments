import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { requireManager } from '@/lib/middleware/permissions';
import { hashPassword } from '@/lib/auth/helpers';
import { UserRole, EmployeePermission, PERMISSION_GROUPS } from '@/lib/types/roles';
import { createErrorResponse, createSuccessResponse } from '@/lib/api/errors';
import { z } from 'zod';

const createUserSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  permissionGroup: z.enum(['event_creator', 'contact_manager', 'invitation_sender', 'viewer', 'checkin_staff']).optional(),
  customPermissions: z.array(z.nativeEnum(EmployeePermission)).optional(),
});

// GET - List all users in company
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireManager(request);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();

    const users = await User.find({
      company: authResult.user.companyId,
    })
      .select('-password -refreshTokens')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    return NextResponse.json(
      createSuccessResponse({ users }),
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      createErrorResponse(500, 'Internal server error', 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
}

// POST - Create new user (only managers)
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireManager(request);
    if (authResult instanceof NextResponse) return authResult;

    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    await connectDB();

    // Check if email already exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return NextResponse.json(
        createErrorResponse(409, 'Email already exists', 'EMAIL_EXISTS'),
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Determine permissions - all new users are employees
    let permissions: EmployeePermission[] = [];
    if (validatedData.permissionGroup) {
      permissions = PERMISSION_GROUPS[validatedData.permissionGroup];
    } else if (validatedData.customPermissions) {
      permissions = validatedData.customPermissions;
    }

    // Create user
    const user = new User({
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email,
      password: hashedPassword,
      phone: validatedData.phone,
      role: UserRole.EMPLOYEE,
      permissions,
      company: authResult.user.companyId,
      createdBy: authResult.user.userId,
      isActive: true,
    });

    await user.save();

    return NextResponse.json(
      createSuccessResponse({
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
        },
      }, 'User created successfully'),
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        createErrorResponse(400, 'Validation failed', 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createErrorResponse(500, 'Internal server error', 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
}
