import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/jwt'
import { Event } from '@/lib/models/Event'
import { ActivityLog } from '@/lib/models/ActivityLog'
import { generateEventPdf } from '@/lib/utils/pdfExport'
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

    // Verify event exists
    const event = await Event.findOne({
      _id: params.eventId,
      companyId: user.companyId,
      deletedAt: null,
    })

    if (!event) {
      return NextResponse.json(
        { error: 'الفعالية غير موجودة' },
        { status: 404 }
      )
    }

    // Generate PDF
    const pdfBuffer = await generateEventPdf(params.eventId)

    // Log activity
    await ActivityLog.create({
      companyId: user.companyId,
      userId: user._id,
      activityType: 'export',
      resourceType: 'Event',
      resourceId: event._id,
      details: {
        format: 'PDF',
        eventTitle: event.title,
      },
    })

    // Generate filename with event title and date
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `${event.title}_${timestamp}.pdf`

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
