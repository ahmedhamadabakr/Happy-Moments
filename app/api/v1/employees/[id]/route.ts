import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { requireManager } from '@/lib/middleware/permissions';
import { UserRole, EmployeePermission, PERMISSION_GROUPS } from '@/lib/types/roles';
import { ActivityLog } from '@/lib/models/ActivityLog';
import mongoose from 'mongoose';

/**
 * GET /api/v1/employees/[id]
 * الحصول على بيانات موظف محدد
 */
export async function GET(
  request: NextRequest,
  paramsPromise: Promise<{ params: { id: string } }>
) {
  const { params } = await paramsPromise;
  try {
    const session = await requireManager(request);
    if (session instanceof NextResponse) return session;

    await connectDB();

    const employee = await User.findOne({
      _id: params.id,
      company: session.user.companyId,
    }).select('-password -refreshTokens');

    if (!employee) {
      return NextResponse.json(
        { error: 'الموظف غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      employee,
    });
  } catch (error: any) {
    console.error('Error fetching employee:', error);
    return NextResponse.json(
      { error: 'فشل في جلب بيانات الموظف' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/employees/[id]
 * تحديث بيانات موظف
 */
export async function PATCH(
  request: NextRequest,
  paramsPromise: Promise<{ params: { id: string } }>
) {
  const { params } = await paramsPromise;
  try {
    const session = await requireManager(request);
    if (session instanceof NextResponse) return session;

    const body = await request.json();
    const {
      firstName,
      lastName,
      phone,
      roleKey,
      customPermissions,
      isActive,
    } = body;

    await connectDB();

    const employee = await User.findOne({
      _id: params.id,
      company: session.user.companyId,
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'الموظف غير موجود' },
        { status: 404 }
      );
    }

    // تحديث البيانات الأساسية
    if (firstName) employee.firstName = firstName;
    if (lastName) employee.lastName = lastName;
    if (phone !== undefined) employee.phone = phone;
    if (isActive !== undefined) employee.isActive = isActive;

    // تحديث الصلاحيات
    if (customPermissions && Array.isArray(customPermissions)) {
      employee.permissions = customPermissions.filter((p: string) =>
        Object.values(EmployeePermission).includes(p as EmployeePermission)
      );
    } else if (roleKey && PERMISSION_GROUPS[roleKey as keyof typeof PERMISSION_GROUPS]) {
      employee.permissions = PERMISSION_GROUPS[roleKey as keyof typeof PERMISSION_GROUPS];
    }

    await employee.save();

    // تسجيل النشاط
    await ActivityLog.create({
      companyId: session.user.companyId,
      userId: session.user.userId,
      activityType: 'user_update',
      resourceType: 'User',
      resourceId: employee._id,
      details: {
        employeeName: `${employee.firstName} ${employee.lastName}`,
        updatedFields: Object.keys(body),
      },
    });

    const { password, refreshTokens, ...employeeData } = employee.toObject();

    return NextResponse.json({
      success: true,
      message: 'تم تحديث بيانات الموظف بنجاح',
      employee: employeeData,
    });
  } catch (error: any) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { error: 'فشل في تحديث بيانات الموظف' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/employees/[id]
 * حذف موظف
 */
export async function DELETE(
  request: NextRequest,
  paramsPromise: Promise<{ params: { id: string } }>
) {
  const { params } = await paramsPromise;
  try {
    const session = await requireManager(request);
    if (session instanceof NextResponse) return session;

    await connectDB();

    const employee = await User.findOne({
      _id: params.id,
      company: session.user.companyId,
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'الموظف غير موجود' },
        { status: 404 }
      );
    }

    const employeeName = `${employee.firstName} ${employee.lastName}`;
    await employee.deleteOne();

    // تسجيل النشاط
    await ActivityLog.create({
      companyId: session.user.companyId,
      userId: session.user.userId,
      activityType: 'user_delete',
      resourceType: 'User',
      resourceId: employee._id,
      details: {
        employeeName,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم حذف الموظف بنجاح',
    });
  } catch (error: any) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { error: 'فشل في حذف الموظف' },
      { status: 500 }
    );
  }
}
