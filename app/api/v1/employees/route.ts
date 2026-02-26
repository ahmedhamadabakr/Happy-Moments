import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { requireManager } from '@/lib/middleware/permissions';
import { hashPassword } from '@/lib/auth/helpers';
import { UserRole, EmployeePermission, PREDEFINED_ROLES } from '@/lib/types/roles';
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

    const employees = await User.find({
      company: session.companyId,
      role: UserRole.EMPLOYEE,
    })
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
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      roleKey, // مفتاح الدور المحدد مسبقاً
      customPermissions, // صلاحيات مخصصة (اختياري)
    } = body;

    // التحقق من البيانات المطلوبة
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني غير صحيح' },
        { status: 400 }
      );
    }

    // التحقق من طول كلمة المرور
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' },
        { status: 400 }
      );
    }

    await connectDB();

    // التحقق من عدم وجود المستخدم مسبقاً
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 400 }
      );
    }

    // تحديد الصلاحيات
    let permissions: EmployeePermission[] = [];
    
    if (customPermissions && Array.isArray(customPermissions)) {
      // استخدام الصلاحيات المخصصة
      permissions = customPermissions.filter((p: string) =>
        Object.values(EmployeePermission).includes(p as EmployeePermission)
      );
    } else if (roleKey && PREDEFINED_ROLES[roleKey as keyof typeof PREDEFINED_ROLES]) {
      // استخدام الدور المحدد مسبقاً
      permissions = PREDEFINED_ROLES[roleKey as keyof typeof PREDEFINED_ROLES].permissions;
    } else {
      return NextResponse.json(
        { error: 'يجب تحديد دور أو صلاحيات للموظف' },
        { status: 400 }
      );
    }

    // تشفير كلمة المرور
    const hashedPassword = await hashPassword(password);

    // إنشاء الموظف
    const employee = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role: UserRole.EMPLOYEE,
      permissions,
      company: session.companyId,
      createdBy: session.userId,
      isActive: true,
    });

    // تسجيل النشاط
    await ActivityLog.create({
      companyId: session.companyId,
      userId: session.userId,
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
    const employeeData = employee.toObject();
    delete employeeData.password;
    delete employeeData.refreshTokens;

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
