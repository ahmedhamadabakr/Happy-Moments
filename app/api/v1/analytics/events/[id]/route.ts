import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/jwt'
import { Event } from '@/lib/models/Event'
import { EventGuest } from '@/lib/models/EventGuest'
import { CheckIn } from '@/lib/models/CheckIn'
import { handleApiError } from '@/lib/api/errors'
import { connectDB } from '@/lib/db'
import mongoose from 'mongoose'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await auth(req)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'معرّف غير صحيح' }, { status: 400 })
    }

    // Verify event exists
    const event = await Event.findOne({
      _id: params.id,
      companyId: user.companyId,
      deletedAt: null,
    }).lean()

    if (!event) {
      return NextResponse.json(
        { error: 'الفعالية غير موجودة' },
        { status: 404 }
      )
    }

    // Get event guests statistics
    const totalInvited = await EventGuest.countDocuments({
      eventId: params.id,
    })

    const invitationsSent = await EventGuest.countDocuments({
      eventId: params.id,
      invitationStatus: 'sent',
    })

    const confirmed = await EventGuest.countDocuments({
      eventId: params.id,
      rsvpStatus: 'confirmed',
    })

    const declined = await EventGuest.countDocuments({
      eventId: params.id,
      rsvpStatus: 'declined',
    })

    const maybe = await EventGuest.countDocuments({
      eventId: params.id,
      rsvpStatus: 'maybe',
    })

    const attended = await CheckIn.countDocuments({
      eventId: params.id,
    })

    const noShow = confirmed - attended

    // Calculate attendance rate
    const attendanceRate = confirmed > 0 ? Math.round((attended / confirmed) * 100) : 0

    // Get RSVP breakdown by status
    const rsvpBreakdown = await EventGuest.aggregate([
      { $match: { eventId: new mongoose.Types.ObjectId(params.id) } },
      { $group: { _id: '$rsvpStatus', count: { $sum: 1 } } },
    ])

    // Get check-in breakdown by time
    const checkInsByHour = await CheckIn.aggregate([
      { $match: { eventId: new mongoose.Types.ObjectId(params.id) } },
      {
        $group: {
          _id: { $dateToString: { format: '%H:00', date: '$checkedInAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    return NextResponse.json({
      success: true,
      data: {
        eventTitle: event.title,
        eventDate: event.eventDate,
        statistics: {
          إجمالي_المدعوين: totalInvited,
          عدد_المرسلة_لهم_الدعوة: invitationsSent,
          المؤكدين: confirmed,
          المعتذرين: declined,
          ربما: maybe,
          الحضور: attended,
          الغياب: noShow,
          نسبة_الحضور: `${attendanceRate}%`,
        },
        rsvpBreakdown: rsvpBreakdown.reduce((acc, item) => {
          const statusMap: Record<string, string> = {
            confirmed: 'مؤكد',
            declined: 'مرفوض',
            maybe: 'ربما',
            pending: 'قيد_الانتظار',
          }
          acc[statusMap[item._id] || item._id] = item.count
          return acc
        }, {} as Record<string, number>),
        checkInsByHour: checkInsByHour.map(item => ({
          time: item._id,
          count: item.count,
        })),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
