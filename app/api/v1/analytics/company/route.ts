import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/jwt'
import { Event } from '@/lib/models/Event'
import { Contact } from '@/lib/models/Contact'
import { EventGuest } from '@/lib/models/EventGuest'
import { CheckIn } from '@/lib/models/CheckIn'
import { handleApiError } from '@/lib/api/errors'
import { connectDB } from '@/lib/db'
import mongoose from 'mongoose'

export async function GET(req: NextRequest) {
  try {
    const user = await auth(req)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()

    // Get company-level statistics
    const totalEvents = await Event.countDocuments({
      companyId: user.companyId,
      deletedAt: null,
    })

    const activeEvents = await Event.countDocuments({
      companyId: user.companyId,
      status: 'active',
      deletedAt: null,
    })

    const totalContacts = await Contact.countDocuments({
      companyId: user.companyId,
      deletedAt: null,
    })

    // Get total guests across all events
    const totalGuests = await EventGuest.countDocuments({
      companyId: user.companyId,
    })

    // Get attendance statistics
    const allEvents = await Event.find({
      companyId: user.companyId,
      deletedAt: null,
    }).select('_id')

    const eventIds = allEvents.map(e => e._id)

    let totalAttended = 0
    let totalConfirmed = 0

    if (eventIds.length > 0) {
      const attendanceData = await CheckIn.aggregate([
        { $match: { eventId: { $in: eventIds } } },
        { $group: { _id: null, count: { $sum: 1 } } },
      ])

      totalAttended = attendanceData[0]?.count || 0

      const confirmedData = await EventGuest.aggregate([
        {
          $match: {
            eventId: { $in: eventIds },
            rsvpStatus: 'confirmed',
          },
        },
        { $group: { _id: null, count: { $sum: 1 } } },
      ])

      totalConfirmed = confirmedData[0]?.count || 0
    }

    // Calculate average attendance rate
    const averageAttendanceRate = totalConfirmed > 0 
      ? Math.round((totalAttended / totalConfirmed) * 100) 
      : 0

    // Get event statistics over time
    const eventsByMonth = await Event.aggregate([
      {
        $match: {
          companyId: new mongoose.Types.ObjectId(user.companyId),
          deletedAt: null,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 12 },
    ])

    // Get top events by attendance
    const topEvents = await Event.aggregate([
      {
        $match: {
          companyId: new mongoose.Types.ObjectId(user.companyId),
          deletedAt: null,
        },
      },
      {
        $lookup: {
          from: 'checkins',
          localField: '_id',
          foreignField: 'eventId',
          as: 'checkIns',
        },
      },
      {
        $project: {
          title: 1,
          eventDate: 1,
          checkInCount: { $size: '$checkIns' },
        },
      },
      { $sort: { checkInCount: -1 } },
      { $limit: 5 },
    ])

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          إجمالي_الفعاليات: totalEvents,
          الفعاليات_النشطة: activeEvents,
          إجمالي_جهات_الاتصال: totalContacts,
          إجمالي_الضيوف: totalGuests,
          إجمالي_الحضور: totalAttended,
          متوسط_نسبة_الحضور: `${averageAttendanceRate}%`,
        },
        eventsByMonth: eventsByMonth.map(item => ({
          month: item._id,
          count: item.count,
        })),
        topEvents: topEvents.map(event => ({
          title: event.title,
          eventDate: event.eventDate,
          attendanceCount: event.checkInCount,
        })),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
