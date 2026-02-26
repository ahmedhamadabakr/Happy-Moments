import { NextRequest, NextResponse } from 'next/server'
import { EventGuest } from '@/lib/models/EventGuest'
import { Event } from '@/lib/models/Event'
import { RSVP } from '@/lib/models/RSVP'
import { ActivityLog } from '@/lib/models/ActivityLog'
import { submitRsvpSchema } from '@/lib/validations/rsvp'
import { handleApiError } from '@/lib/api/errors'
import { connectDB } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    await connectDB()

    const eventGuest = await EventGuest.findOne({
      invitationToken: params.token,
    }).lean()

    if (!eventGuest) {
      return NextResponse.json(
        { error: 'دعوة غير صحيحة أو منتهية' },
        { status: 404 }
      )
    }

    // Get event details
    const event = await Event.findById(eventGuest.eventId).lean()

    if (!event) {
      return NextResponse.json(
        { error: 'الفعالية غير موجودة' },
        { status: 404 }
      )
    }

    // Check if event is closed
    if (event.status === 'closed') {
      return NextResponse.json(
        { error: 'انتهت فترة التأكيد للفعالية' },
        { status: 410 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        guestName: eventGuest.snapshotName,
        eventTitle: event.title,
        eventDate: event.eventDate,
        eventTime: event.eventTime,
        eventLocation: event.location,
        rsvpStatus: eventGuest.rsvpStatus,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    await connectDB()

    // Find event guest by token
    const eventGuest = await EventGuest.findOne({
      invitationToken: params.token,
    })

    if (!eventGuest) {
      return NextResponse.json(
        { error: 'دعوة غير صحيحة أو منتهية' },
        { status: 404 }
      )
    }

    // Get event to check status
    const event = await Event.findById(eventGuest.eventId)

    if (!event) {
      return NextResponse.json(
        { error: 'الفعالية غير موجودة' },
        { status: 404 }
      )
    }

    if (event.status === 'closed') {
      return NextResponse.json(
        { error: 'انتهت فترة التأكيد للفعالية' },
        { status: 410 }
      )
    }

    // Check if already responded
    const existingRsvp = await RSVP.findOne({
      eventGuestId: eventGuest._id,
    })

    if (existingRsvp) {
      return NextResponse.json(
        { error: 'تم تسجيل ردك بالفعل' },
        { status: 409 }
      )
    }

    // Validate input
    const body = await req.json()
    const { response, notes } = submitRsvpSchema.parse(body)

    // Get client IP and user agent
    const ipAddress = req.headers.get('x-forwarded-for') || 
                      req.headers.get('x-real-ip') || 
                      'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    // Create RSVP record
    const rsvp = await RSVP.create({
      eventGuestId: eventGuest._id,
      eventId: eventGuest.eventId,
      companyId: eventGuest.companyId,
      response,
      notes: notes || undefined,
      ipAddress,
      userAgent,
      respondedAt: new Date(),
    })

    // Update event guest status
    eventGuest.rsvpStatus = response
    eventGuest.rsvpConfirmedAt = new Date()
    await eventGuest.save()

    // Log activity (public, no user auth)
    await ActivityLog.create({
      companyId: eventGuest.companyId,
      userId: new (require('mongoose').Types.ObjectId)(),
      activityType: 'rsvp_response',
      resourceType: 'EventGuest',
      resourceId: eventGuest._id,
      details: {
        response,
        guestName: eventGuest.snapshotName,
        eventTitle: event.title,
      },
      ipAddress,
      userAgent,
    })

    return NextResponse.json({
      success: true,
      message: 'شكراً لتأكيدك',
      data: {
        response,
        confirmedAt: new Date(),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
