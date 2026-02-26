import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/jwt'
import { Event } from '@/lib/models/Event'
import { EventGuest } from '@/lib/models/EventGuest'
import { CheckIn } from '@/lib/models/CheckIn'
import { ActivityLog } from '@/lib/models/ActivityLog'
import { handleApiError } from '@/lib/api/errors'
import { connectDB } from '@/lib/db'
import mongoose from 'mongoose'

export async function POST(
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

    const body = await req.json()
    const { invitationToken } = body

    if (!invitationToken) {
      return NextResponse.json(
        { error: 'رمز الدعوة مطلوب' },
        { status: 400 }
      )
    }

    // Verify event exists and is active
    const event = await Event.findOne({
      _id: params.id,
      companyId: user.companyId,
      deletedAt: null,
    })

    if (!event) {
      return NextResponse.json(
        { error: 'الفعالية غير موجودة' },
        { status: 404 }
      )
    }

    if (event.status !== 'active') {
      return NextResponse.json(
        { error: 'الفعالية غير نشطة' },
        { status: 400 }
      )
    }

    // Find event guest by token
    const eventGuest = await EventGuest.findOne({
      invitationToken,
      eventId: params.id,
    })

    if (!eventGuest) {
      return NextResponse.json(
        { error: 'دعوة غير صحيحة' },
        { status: 404 }
      )
    }

    // Check if already checked in
    if (eventGuest.checkInStatus === 'checked_in') {
      return NextResponse.json(
        { error: 'تم تسجيل الحضور بالفعل' },
        { status: 409 }
      )
    }

    // Get IP address
    const ipAddress = req.headers.get('x-forwarded-for') || 
                      req.headers.get('x-real-ip') || 
                      'unknown'

    // Use transaction for atomicity
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      // Create check-in record
      await CheckIn.create(
        [{
          eventGuestId: eventGuest._id,
          eventId: params.id,
          companyId: user.companyId,
          checkedInBy: user._id,
          checkedInAt: new Date(),
          ipAddress,
        }],
        { session }
      )

      // Update event guest check-in status
      eventGuest.checkInStatus = 'checked_in'
      eventGuest.checkedInAt = new Date()
      await eventGuest.save({ session })

      // Commit transaction
      await session.commitTransaction()

      // Log activity
      await ActivityLog.create({
        companyId: user.companyId,
        userId: user._id,
        activityType: 'check_in',
        resourceType: 'EventGuest',
        resourceId: eventGuest._id,
        details: {
          guestName: eventGuest.snapshotName,
          eventTitle: event.title,
        },
      })

      return NextResponse.json({
        success: true,
        message: `مرحباً ${eventGuest.snapshotName}، تم تسجيل حضورك`,
        data: {
          guestName: eventGuest.snapshotName,
          checkedInAt: new Date(),
        },
      })
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  } catch (error) {
    return handleApiError(error)
  }
}

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

    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

    const skip = (page - 1) * limit

    // Get check-ins for event
    const checkIns = await CheckIn.find({
      eventId: params.id,
      companyId: user.companyId,
    })
      .populate('eventGuestId', 'snapshotName snapshotPhone')
      .sort({ checkedInAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await CheckIn.countDocuments({
      eventId: params.id,
      companyId: user.companyId,
    })

    return NextResponse.json({
      success: true,
      data: checkIns,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
