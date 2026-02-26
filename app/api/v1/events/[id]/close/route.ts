import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/jwt'
import { Event } from '@/lib/models/Event'
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

    if (event.status === 'closed') {
      return NextResponse.json(
        { error: 'الفعالية مغلقة بالفعل' },
        { status: 400 }
      )
    }

    // Close the event
    event.status = 'closed'
    await event.save()

    // Log activity
    await ActivityLog.create({
      companyId: user.companyId,
      userId: user._id,
      activityType: 'event_update',
      resourceType: 'Event',
      resourceId: event._id,
      details: { action: 'closed', title: event.title },
    })

    return NextResponse.json({
      success: true,
      message: 'تم إغلاق الفعالية بنجاح',
      data: event,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
