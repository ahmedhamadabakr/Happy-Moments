import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { EventGuest } from '@/lib/models/EventGuest';
import { Event } from '@/lib/models/Event';
import { RSVP } from '@/lib/models/RSVP';

/**
 * GET /api/v1/rsvp/[token]
 * الحصول على بيانات الدعوة (صفحة عامة)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    await connectDB();

    const eventGuest = await EventGuest.findOne({
      invitationToken: params.token,
    }).populate('eventId');

    if (!eventGuest) {
      return NextResponse.json(
        { error: 'الدعوة غير موجودة' },
        { status: 404 }
      );
    }

    const event = eventGuest.eventId as any;

    if (event.status === 'closed') {
      return NextResponse.json(
        { error: 'الفعالية مغلقة' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      invitation: {
        guestName: eventGuest.snapshotName,
        eventTitle: event.title,
        eventDescription: event.description,
        eventDate: event.eventDate,
        eventTime: event.eventTime,
        location: event.location,
        locationUrl: event.locationUrl,
        invitationImage: eventGuest.finalInvitationImagePath,
        rsvpStatus: eventGuest.rsvpStatus,
        rsvpMessage: eventGuest.rsvpMessage,
      },
    });
  } catch (error: any) {
    console.error('Error fetching invitation:', error);
    return NextResponse.json(
      { error: 'فشل في جلب بيانات الدعوة' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/rsvp/[token]
 * الرد على الدعوة (قبول/رفض/رسالة)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const body = await request.json();
    const { action, message } = body; // action: 'accept' | 'decline' | 'message'

    if (!action) {
      return NextResponse.json(
        { error: 'نوع الرد مطلوب' },
        { status: 400 }
      );
    }

    await connectDB();

    const eventGuest = await EventGuest.findOne({
      invitationToken: params.token,
    }).populate('eventId');

    if (!eventGuest) {
      return NextResponse.json(
        { error: 'الدعوة غير موجودة' },
        { status: 404 }
      );
    }

    const event = eventGuest.eventId as any;

    if (event.status === 'closed') {
      return NextResponse.json(
        { error: 'الفعالية مغلقة' },
        { status: 400 }
      );
    }

    // معالجة الرد
    if (action === 'accept') {
      eventGuest.rsvpStatus = 'confirmed';
      eventGuest.rsvpConfirmedAt = new Date();
      
      // تحديث أو إنشاء RSVP
      await RSVP.findOneAndUpdate(
        { eventGuestId: eventGuest._id },
        {
          eventGuestId: eventGuest._id,
          eventId: event._id,
          response: 'confirmed',
          respondedAt: new Date(),
        },
        { upsert: true }
      );
    } else if (action === 'decline') {
      eventGuest.rsvpStatus = 'declined';
      eventGuest.rsvpConfirmedAt = new Date();
      
      await RSVP.findOneAndUpdate(
        { eventGuestId: eventGuest._id },
        {
          eventGuestId: eventGuest._id,
          eventId: event._id,
          response: 'declined',
          respondedAt: new Date(),
        },
        { upsert: true }
      );
    } else if (action === 'message' && message) {
      eventGuest.rsvpMessage = message;
    }

    await eventGuest.save();

    // TODO: إرسال تحديث Real-time لصفحة العميل

    return NextResponse.json({
      success: true,
      message: 'تم تسجيل ردك بنجاح',
      rsvpStatus: eventGuest.rsvpStatus,
    });
  } catch (error: any) {
    console.error('Error processing RSVP:', error);
    return NextResponse.json(
      { error: 'فشل في تسجيل الرد' },
      { status: 500 }
    );
  }
}
