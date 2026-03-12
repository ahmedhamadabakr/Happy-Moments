import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/jwt'
import { Event } from '@/lib/models/Event'
import { handleApiError } from '@/lib/api/errors'
import { connectDB } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const user = await auth(req)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()

    const now = new Date();

    const activeEvents = await Event.countDocuments({
      companyId: user.companyId,
      deletedAt: null,
      eventDate: { $gte: now },
    })

    const endedEvents = await Event.countDocuments({
        companyId: user.companyId,
        deletedAt: null,
        eventDate: { $lt: now },
      })

    return NextResponse.json({
      success: true,
      data: {
        activeEvents,
        endedEvents,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
