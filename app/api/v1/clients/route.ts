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

    const clients = await Client.find({
      companyId: session.user.companyId,
      isActive: true,
    })
      // accessToken is needed in dashboard to build client-view links
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
      companyId: session.user.companyId,
      fullName,
      email,
      phone,
      accessToken,
      createdBy: session.user.userId,
      isActive: true,
    });

    // تسجيل النشاط
    await ActivityLog.create({
      companyId: session.user.companyId,
      userId: session.user.userId,
      activityType: 'event_create',
      resourceType: 'Client',
      resourceId: client._id,
      details: {
        clientName: fullName,
      },
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
