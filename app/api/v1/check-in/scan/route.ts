import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { EventGuest } from '@/lib/models/EventGuest';
import { Event, IEvent } from '@/lib/models/Event';
import { CheckInLog } from '@/lib/models/CheckInLog';
import { requireAnyPermission } from '@/lib/middleware/permissions';
import { EmployeePermission } from '@/lib/types/roles';
import { verifyQRToken } from '@/lib/utils/qrGenerator';

/**
 * POST /api/v1/check-in/scan
 * مسح QR Code للتسجيل
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAnyPermission(request, [
      EmployeePermission.CHECKIN_SCAN,
    ]);
    if (session instanceof NextResponse) return session;

    const body = await request.json();
    const { qrToken, notes } = body;

    if (!qrToken) {
      return NextResponse.json(
        { error: 'رمز QR مطلوب' },
        { status: 400 }
      );
    }

    // التحقق من صحة Token
    if (!verifyQRToken(qrToken)) {
      return NextResponse.json(
        { error: 'رمز QR غير صحيح' },
        { status: 400 }
      );
    }

    await connectDB();

    const eventGuest = await EventGuest.findOne({ qrToken }).populate('eventId');

    if (!eventGuest) {
      return NextResponse.json(
        { error: 'الضيف غير موجود' },
        { status: 404 }
      );
    }

    const event = eventGuest.eventId as IEvent;

    // التحقق من حالة الفعالية
    if (event.status === 'closed') {
      return NextResponse.json(
        { error: 'الفعالية مغلقة' },
        { status: 400 }
      );
    }

    if (event.deletedAt) {
      return NextResponse.json(
        { error: 'الفعالية محذوفة' },
        { status: 400 }
      );
    }

    const now = new Date();
    const isFirstScan = eventGuest.scanCount === 0;

    // تحديث بيانات الضيف
    eventGuest.scanCount += 1;
    eventGuest.checkInStatus = 'checked_in';
    eventGuest.lastCheckInAt = now;

    if (isFirstScan) {
      eventGuest.firstCheckInAt = now;
      eventGuest.checkedInAt = now;
    }

    await eventGuest.save();

    await CheckInLog.create({
      guest: eventGuest._id,
      event: event._id,
      scannedBy: session.user.userId,
      scannedAt: now,
      scanType: isFirstScan ? 'first' : 'repeated',
      scanNumber: eventGuest.scanCount,
      notes,
    });

    // TODO: إرسال تحديث Real-time لصفحة العميل

    return NextResponse.json({
      success: true,
      message: isFirstScan ? 'تم تسجيل الحضور بنجاح' : 'تم تسجيل دخول متكرر',
      guest: {
        name: eventGuest.snapshotName,
        phone: eventGuest.snapshotPhone,
        scanNumber: eventGuest.scanCount,
        firstCheckIn: eventGuest.firstCheckInAt,
        lastCheckIn: eventGuest.lastCheckInAt,
        isRepeated: !isFirstScan,
      },
    });
  } catch (error: any) {
    console.error('Error scanning QR:', error);
    return NextResponse.json(
      { error: 'فشل في مسح رمز QR' },
      { status: 500 }
    );
  }
}
