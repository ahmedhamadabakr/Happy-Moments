import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/jwt'
import { Event } from '@/lib/models/Event'
import { ActivityLog } from '@/lib/models/ActivityLog'
import { generateGuestsCsv } from '@/lib/utils/csvExport'
import { handleApiError } from '@/lib/api/errors'
import { connectDB } from '@/lib/db'
import mongoose from 'mongoose'

export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const user = await auth(req)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.eventId)) {
      return NextResponse.json({ error: 'معرّف غير صحيح' }, { status: 400 })
    }

    const event = await Event.findOne({ _id: params.eventId, deletedAt: null })

    if (!event) {
      return NextResponse.json({ error: 'الفعالية غير موجودة' }, { status: 404 })
    }

    const csv = await generateGuestsCsv(params.eventId)

    await ActivityLog.create({
      userId: user.userId,
      activityType: 'export',
      resourceType: 'Event',
      resourceId: event._id,
      details: { format: 'CSV', eventTitle: event.title },
    })

    // Generate filename with event title and date
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `${event.title}_${timestamp}.csv`

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
