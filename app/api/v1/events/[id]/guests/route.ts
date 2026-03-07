import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/jwt'
import { Event } from '@/lib/models/Event'
import { Contact } from '@/lib/models/Contact'
import { EventGuest } from '@/lib/models/EventGuest'
import { ActivityLog } from '@/lib/models/ActivityLog'
import { selectGuestsSchema } from '@/lib/validations/event'
import { handleApiError } from '@/lib/api/errors'
import { connectDB } from '@/lib/db'
import mongoose from 'mongoose'
import crypto from 'crypto'

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const user = await auth(req)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'معرّف غير صحيح' }, { status: 400 })
    }

    const event = await Event.findOne({
      _id: id,
      companyId: user.companyId,
      deletedAt: null,
    })

    if (!event) {
      return NextResponse.json(
        { error: 'الفعالية غير موجودة' },
        { status: 404 }
      )
    }

    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

    const skip = (page - 1) * limit

    const guests = await EventGuest.find({
      eventId: id,
      companyId: user.companyId,
    })
      .select('-__v')
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await EventGuest.countDocuments({
      eventId: id,
      companyId: user.companyId,
    })

    return NextResponse.json({
      success: true,
      data: guests,
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

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const user = await auth(req)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'معرّف غير صحيح' }, { status: 400 })
    }

    const body = await req.json()
    const { contactIds } = selectGuestsSchema.parse(body)

    const event = await Event.findOne({
      _id: id,
      companyId: user.companyId,
      deletedAt: null,
    })

    if (!event) {
      return NextResponse.json(
        { error: 'الفعالية غير موجودة' },
        { status: 404 }
      )
    }

    if (event.status === 'closed') {
      return NextResponse.json(
        { error: 'لا يمكن إضافة ضيوف إلى فعالية مغلقة' },
        { status: 400 }
      )
    }

    const contacts = await Contact.find({
      _id: { $in: contactIds },
      companyId: user.companyId,
      deletedAt: null,
    })

    if (contacts.length === 0) {
      return NextResponse.json(
        { error: 'لم يتم العثور على جهات اتصال' },
        { status: 404 }
      )
    }

    let created = 0
    let skipped = 0

    for (const contact of contacts) {
      const exists = await EventGuest.findOne({
        eventId: id,
        contactId: contact._id,
      })

      if (exists) {
        skipped++
        continue
      }

      const fullName = `${contact.firstName} ${contact.lastName}`.trim()

      await EventGuest.create({
        eventId: id,
        contactId: contact._id,
        companyId: user.companyId,
        snapshotName: fullName,
        snapshotPhone: contact.phone,
        snapshotEmail: contact.email,
        invitationToken: generateToken(),
        rsvpStatus: 'pending',
        checkInStatus: 'pending',
        invitationStatus: 'pending',
      })

      created++
    }

    await ActivityLog.create({
      companyId: user.companyId,
      userId: user._id,
      activityType: 'event_update',
      resourceType: 'Event',
      resourceId: event._id,
      details: {
        action: 'guests_added',
        created,
        skipped,
        title: event.title,
      },
    })

    return NextResponse.json({
      success: true,
      message: `تم إضافة ${created} ضيوف جديدة`,
      created,
      skipped,
    })
  } catch (error) {
    return handleApiError(error)
  }
}