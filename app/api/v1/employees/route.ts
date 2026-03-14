import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { requireManager } from '@/lib/middleware/permissions';
import { hashPassword } from '@/lib/auth/helpers';
import { UserRole, EmployeePermission } from '@/lib/types/roles';
import { ActivityLog } from '@/lib/models/ActivityLog';

/**
 * GET /api/v1/employees
 * الحصول على قائمة الموظفين (للمدير فقط)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireManager(request);
    if (session instanceof NextResponse) return session;

    await connectDB();

    const employees = await User.find({ role: UserRole.EMPLOYEE })
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      employees,
    });
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'فشل في جلب الموظفين' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/employees
 * إنشاء موظف جديد (للمدير فقط)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireManager(request);
    if (session instanceof NextResponse) return session;

    const body = await request.json();
    const { firstName, lastName, email, password, phone, role } = body;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'البريد الإلكتروني غير صحيح' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }, { status: 400 });
    }

    const assignedRole = role === 'manager' ? UserRole.MANAGER : UserRole.EMPLOYEE;
    const permissions = assignedRole === UserRole.MANAGER ? Object.values(EmployeePermission) : [];

    await connectDB();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const employee = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role: assignedRole,
      permissions,
      createdBy: session.user.userId,
      isActive: true,
    });

    // تسجيل النشاط
    await ActivityLog.create({
      userId: session.user.userId,
      activityType: 'event_create',
      resourceType: 'User',
      resourceId: employee._id,
      details: {
        employeeName: `${firstName} ${lastName}`,
        email,
        permissions: permissions.length,
      },
    });

    // إرجاع البيانات بدون كلمة المرور
    const { password: _, refreshTokens, ...employeeData } = employee.toObject();

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الموظف بنجاح',
      employee: employeeData,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating employee:', error);
    return NextResponse.json(
      { error: 'فشل في إنشاء الموظف' },
      { status: 500 }
    );
  }
}
