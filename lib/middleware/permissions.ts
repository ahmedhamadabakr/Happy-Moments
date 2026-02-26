import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '../auth/jwt';
import { UserRole, EmployeePermission, hasPermission, hasAnyPermission } from '../types/roles';

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
 * Middleware للتحقق من تسجيل الدخول
 */
export async function requireAuth(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: 'غير مصرح. يرجى تسجيل الدخول.' },
      { status: 401 }
    );
  }

  return session;
}

/**
 * Middleware للتحقق من أن المستخدم مدير
 */
export async function requireManager(request: NextRequest) {
  const session = await requireAuth(request);
  
  if (session instanceof NextResponse) {
    return session;
  }

  if (session.role !== UserRole.MANAGER) {
    return NextResponse.json(
      { error: 'غير مصرح. هذه العملية متاحة للمديرين فقط.' },
      { status: 403 }
    );
  }

  return session;
}

/**
 * Middleware للتحقق من صلاحية واحدة محددة
 */
export async function requirePermission(
  request: NextRequest,
  permission: EmployeePermission
) {
  const session = await requireAuth(request);
  
  if (session instanceof NextResponse) {
    return session;
  }

  // المدير لديه كل الصلاحيات
  if (session.role === UserRole.MANAGER) {
    return session;
  }

  if (!hasPermission(session.permissions, permission)) {
    return NextResponse.json(
      { error: 'غير مصرح. ليس لديك الصلاحية لتنفيذ هذه العملية.' },
      { status: 403 }
    );
  }

  return session;
}

/**
 * Middleware للتحقق من أي صلاحية من مجموعة صلاحيات
 */
export async function requireAnyPermission(
  request: NextRequest,
  permissions: EmployeePermission[]
) {
  const session = await requireAuth(request);
  
  if (session instanceof NextResponse) {
    return session;
  }

  // المدير لديه كل الصلاحيات
  if (session.role === UserRole.MANAGER) {
    return session;
  }

  if (!hasAnyPermission(session.permissions, permissions)) {
    return NextResponse.json(
      { error: 'غير مصرح. ليس لديك الصلاحية لتنفيذ هذه العملية.' },
      { status: 403 }
    );
  }

  return session;
}

/**
 * دالة مساعدة للتحقق من أن المستخدم ينتمي لنفس الشركة
 */
export function verifyCompanyAccess(
  session: { companyId: string },
  resourceCompanyId: string
): boolean {
  return session.companyId === resourceCompanyId;
}
