import { NextRequest, NextResponse } from 'next/server';
  import { getSession } from '@/lib/auth/jwt';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { UserRole, EmployeePermission } from '@/lib/types/roles';
import { createErrorResponse } from '@/lib/api/errors';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
    permissions: EmployeePermission[];
    companyId: string;
  };
}

/**
 * Middleware to check if user is authenticated
 */
export async function requireAuth(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      createErrorResponse(401, 'Unauthorized - Please login', 'UNAUTHORIZED'),
      { status: 401 }
    );
  }

  await connectDB();
  const user = await User.findById(session.userId).select('+permissions');

  if (!user || !user.isActive) {
    return NextResponse.json(
      createErrorResponse(401, 'User not found or inactive', 'USER_INACTIVE'),
      { status: 401 }
    );
  }

  return {
    user: {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
      companyId: user.company.toString(),
    },
  };
}

/**
 * Middleware to check if user is a manager
 */
export async function requireManager(request: NextRequest) {
  const authResult = await requireAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  if (authResult.user.role !== UserRole.MANAGER) {
    return NextResponse.json(
      createErrorResponse(403, 'Access denied - Manager role required', 'FORBIDDEN'),
      { status: 403 }
    );
  }

  return authResult;
}

/**
 * Middleware to check if user has specific permission
 */
export async function requirePermission(
  request: NextRequest,
  permission: EmployeePermission
) {
  const authResult = await requireAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  // Managers have all permissions
  if (user.role === UserRole.MANAGER) {
    return authResult;
  }

  // Check if employee has the required permission
  if (!user.permissions.includes(permission)) {
    return NextResponse.json(
      createErrorResponse(
        403,
        `Access denied - ${permission} permission required`,
        'FORBIDDEN'
      ),
      { status: 403 }
    );
  }

  return authResult;
}

/**
 * Middleware to check if user has any of the specified permissions
 */
export async function requireAnyPermission(
  request: NextRequest,
  permissions: EmployeePermission[]
) {
  const authResult = await requireAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  // Managers have all permissions
  if (user.role === UserRole.MANAGER) {
    return authResult;
  }

  // Check if employee has any of the required permissions
  const hasPermission = permissions.some((p) => user.permissions.includes(p));

  if (!hasPermission) {
    return NextResponse.json(
      createErrorResponse(
        403,
        `Access denied - One of these permissions required: ${permissions.join(', ')}`,
        'FORBIDDEN'
      ),
      { status: 403 }
    );
  }

  return authResult;
}

/**
 * Helper to check permissions in components
 */
export function hasPermission(
  userRole: UserRole,
  userPermissions: EmployeePermission[],
  requiredPermission: EmployeePermission
): boolean {
  if (userRole === UserRole.MANAGER) {
    return true;
  }
  return userPermissions.includes(requiredPermission);
}

/**
 * Helper to check if user has any of the permissions
 */
export function hasAnyPermission(
  userRole: UserRole,
  userPermissions: EmployeePermission[],
  requiredPermissions: EmployeePermission[]
): boolean {
  if (userRole === UserRole.MANAGER) {
    return true;
  }
  return requiredPermissions.some((p) => userPermissions.includes(p));
}
