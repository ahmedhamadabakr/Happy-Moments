import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/jwt'
import { Event } from '@/lib/models/Event'
import { ActivityLog } from '@/lib/models/ActivityLog'
import { createEventSchema } from '@/lib/validations/event'
import { handleApiError } from '@/lib/api/errors'
import { connectDB } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const user = await auth(req)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()

    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    const query: any = {
      companyId: user.companyId,
    }

    const now = new Date();
    if (status === 'active') {
      query.eventDate = { $gte: now };
    } else if (status === 'closed') {
      query.eventDate = { $lt: now };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    const events = await Event.find(query)
      .select('-__v')
      .populate('clientId', 'fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Event.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: events,
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

export async function POST(req: NextRequest) {
  try {
    const user = await auth(req)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()

    const body = await req.json()

    // Validate input
    const validated = createEventSchema.parse(body)

    // Create event
    const event = await Event.create({
      companyId: user.companyId,
      createdBy: user._id,
      title: validated.title,
      description: validated.description,
      eventDate: new Date(validated.eventDate),
      eventTime: validated.eventTime,
      location: validated.location,
      maxGuests: validated.maxGuests,
      status: 'draft',
    })

    // Log activity
    await ActivityLog.create({
      companyId: user.companyId,
      userId: user._id,
      activityType: 'event_create',
      resourceType: 'Event',
      resourceId: event._id,
      details: { title: event.title },
    })

    return NextResponse.json(
      { success: true, data: event },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
