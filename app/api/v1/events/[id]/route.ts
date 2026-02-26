import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/jwt'
import { Event } from '@/lib/models/Event'
import { ActivityLog } from '@/lib/models/ActivityLog'
import { updateEventSchema } from '@/lib/validations/event'
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

    return NextResponse.json({ success: true, data: event })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(
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
    const validated = updateEventSchema.parse(body)

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

    // Update fields
    if (validated.title) event.title = validated.title
    if (validated.description !== undefined) event.description = validated.description
    if (validated.eventDate) event.eventDate = new Date(validated.eventDate)
    if (validated.eventTime !== undefined) event.eventTime = validated.eventTime
    if (validated.location !== undefined) event.location = validated.location
    if (validated.maxGuests) event.maxGuests = validated.maxGuests

    await event.save()

    // Log activity
    await ActivityLog.create({
      companyId: user.companyId,
      userId: user._id,
      activityType: 'event_update',
      resourceType: 'Event',
      resourceId: event._id,
      details: { title: event.title },
    })

    return NextResponse.json({ success: true, data: event })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
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

    // Soft delete
    event.deletedAt = new Date()
    await event.save()

    // Log activity
    await ActivityLog.create({
      companyId: user.companyId,
      userId: user._id,
      activityType: 'event_delete',
      resourceType: 'Event',
      resourceId: event._id,
      details: { title: event.title },
    })

    return NextResponse.json({
      success: true,
      message: 'تم حذف الفعالية بنجاح',
    })
  } catch (error) {
    return handleApiError(error)
  }
}
