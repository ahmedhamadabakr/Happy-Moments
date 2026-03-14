import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Client } from '@/lib/models/Client';
import { requireAuth } from '@/lib/middleware/permissions';
import { generateSecureToken } from '@/lib/utils/qrGenerator';
import { ActivityLog } from '@/lib/models/ActivityLog';

/**
 * GET /api/v1/clients
 * الحصول على قائمة العملاء
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;

    await connectDB();

    const clients = await Client.find({ isActive: true })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'firstName lastName');

    return NextResponse.json({
      success: true,
      clients,
    });
  } catch (error: any) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'فشل في جلب العملاء' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/clients
 * إنشاء عميل جديد
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;

    const body = await request.json();
    const { fullName, email, phone } = body;

    if (!fullName) {
      return NextResponse.json(
        { error: 'اسم العميل مطلوب' },
        { status: 400 }
      );
    }

    await connectDB();

    // توليد Token فريد للعميل
    const accessToken = generateSecureToken();

    const client = await Client.create({
      fullName,
      email,
      phone,
      accessToken,
      createdBy: session.user.userId,
      isActive: true,
    });

    await ActivityLog.create({
      userId: session.user.userId,
      activityType: 'client_create',
      resourceType: 'Client',
      resourceId: client._id,
      details: { clientName: fullName },
    });

    // إرجاع البيانات بدون Token
    const { accessToken: _accessToken, ...clientData } = client.toObject();

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء العميل بنجاح',
      client: clientData,
      clientViewUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/client-view/${client.accessToken}`,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'فشل في إنشاء العميل' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/clients
 * حذف عميل (soft delete)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('id');

    if (!clientId) {
      return NextResponse.json(
        { success: false, message: 'معرف العميل مطلوب' },
        { status: 400 }
      );
    }

    await connectDB();

    const client = await Client.findOneAndUpdate(
      { _id: clientId },
      { isActive: false },
      { new: true }
    );

    if (!client) {
      return NextResponse.json({ success: false, message: 'العميل غير موجود' }, { status: 404 });
    }

    await ActivityLog.create({
      userId: session.user.userId,
      activityType: 'client_delete',
      resourceType: 'Client',
      resourceId: client._id,
      details: { clientName: client.fullName },
    });

    return NextResponse.json({
      success: true,
      message: 'تم حذف العميل بنجاح',
    });
  } catch (error: any) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { success: false, message: 'فشل في حذف العميل' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/clients
 * تحديث بيانات عميل
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('id');

    if (!clientId) {
      return NextResponse.json(
        { success: false, message: 'معرف العميل مطلوب' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { fullName, email, phone } = body;

    if (!fullName) {
      return NextResponse.json(
        { success: false, message: 'اسم العميل مطلوب' },
        { status: 400 }
      );
    }

    await connectDB();

    const client = await Client.findOneAndUpdate(
      { _id: clientId },
      { fullName, email, phone },
      { new: true }
    );

    if (!client) {
      return NextResponse.json({ success: false, message: 'العميل غير موجود' }, { status: 404 });
    }

    await ActivityLog.create({
      userId: session.user.userId,
      activityType: 'client_update',
      resourceType: 'Client',
      resourceId: client._id,
      details: { clientName: client.fullName },
    });

    return NextResponse.json({
      success: true,
      message: 'تم تحديث بيانات العميل بنجاح',
      client,
    });
  } catch (error: any) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { success: false, message: 'فشل في تحديث بيانات العميل' },
      { status: 500 }
    );
  }
}
