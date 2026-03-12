import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Client } from '@/lib/models/Client';
import { Event } from '@/lib/models/Event';
import { EventGuest } from '@/lib/models/EventGuest';

/**
 * GET /api/v1/client-view/[token]
 * صفحة العرض الخاصة بالعميل (بدون تسجيل دخول)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    await connectDB();

    const { token } = await params;

    // البحث عن العميل بالـ Token
    const client = await Client.findOne({
      accessToken: token,
      isActive: true,
    });

    if (!client) {
      return NextResponse.json(
        { error: 'رابط غير صحيح أو منتهي الصلاحية' },
        { status: 404 }
      );
    }

    // الحصول على الفعاليات الخاصة بالعميل
    const events = await Event.find({
      clientId: client._id,
      deletedAt: null,
    }).sort({ eventDate: -1 });

    // الحصول على إحصائيات كل فعالية
    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        const guests = await EventGuest.find({ eventId: event._id });

        const stats = {
          totalInvited: guests.length,
          confirmed: guests.filter(g => g.rsvpStatus === 'confirmed').length,
          declined: guests.filter(g => g.rsvpStatus === 'declined').length,
          pending: guests.filter(g => g.rsvpStatus === 'pending').length,
          checkedIn: guests.filter(g => g.checkInStatus === 'checked_in').length,
          noShow: guests.filter(g => g.rsvpStatus === 'confirmed' && g.checkInStatus === 'pending').length,
        };

        // قائمة الضيوف مع حالاتهم
        const guestsList = guests.map(g => ({
          name: g.snapshotName,
          phone: g.snapshotPhone,
          rsvpStatus: g.rsvpStatus,
          checkInStatus: g.checkInStatus,
          rsvpMessage: g.rsvpMessage,
          checkedInAt: g.checkedInAt,
        }));

        // الرسائل من الضيوف
        const messages = guests
          .filter(g => g.rsvpMessage)
          .map(g => ({
            guestName: g.snapshotName,
            message: g.rsvpMessage,
            timestamp: g.rsvpConfirmedAt,
          }));

        return {
          id: event._id,
          title: event.title,
          description: event.description,
          eventDate: event.eventDate,
          eventTime: event.eventTime,
          location: event.location,
          status: event.status,
          stats,
          guests: guestsList,
          messages,
        };
      })
    );

    return NextResponse.json({
      success: true,
      client: {
        name: client.fullName,
        email: client.email,
      },
      events: eventsWithStats,
    });
  } catch (error: any) {
    console.error('Error fetching client view:', error);
    return NextResponse.json(
      { error: 'فشل في جلب البيانات' },
      { status: 500 }
    );
  }
}
