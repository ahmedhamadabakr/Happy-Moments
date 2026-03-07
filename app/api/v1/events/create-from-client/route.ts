import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'

import { connectDB } from '@/lib/db'
import { requireAnyPermission } from '@/lib/middleware/permissions'
import { EmployeePermission } from '@/lib/types/roles'

import { Event } from '@/lib/models/Event'
import { Client } from '@/lib/models/Client'
import { Contact } from '@/lib/models/Contact'
import { EventGuest } from '@/lib/models/EventGuest'
import { ActivityLog } from '@/lib/models/ActivityLog'

import { generateSecureToken, generateGuestInvitationWithQR } from '@/lib/utils/qrGenerator'

/**
 * POST /api/v1/events/create-from-client
 * إنشاء فعالية باستخدام جهات اتصال العميل المخزنة (بدون رفع Excel كل مرة)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAnyPermission(request, [EmployeePermission.EVENT_CREATE])
    if (session instanceof NextResponse) return session

    const formData = await request.formData()

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const eventDate = formData.get('eventDate') as string
    const eventTime = formData.get('eventTime') as string
    const location = formData.get('location') as string
    const locationUrl = formData.get('locationUrl') as string

    const clientId = formData.get('clientId') as string

    const invitationImageFile = formData.get('invitationImage') as File

    const qrX = parseInt(formData.get('qrX') as string) || 50
    const qrY = parseInt(formData.get('qrY') as string) || 50
    const qrWidth = parseInt(formData.get('qrWidth') as string) || 150
    const qrHeight = parseInt(formData.get('qrHeight') as string) || 150

    if (!title || !eventDate || !clientId || !invitationImageFile) {
      return NextResponse.json({ error: 'البيانات المطلوبة ناقصة' }, { status: 400 })
    }

    await connectDB()

    const client = await Client.findOne({
      _id: clientId,
      companyId: session.user.companyId,
      isActive: true,
    })

    if (!client) {
      return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })
    }

    const contacts = await Contact.find({
      companyId: session.user.companyId,
      clientId: client._id,
      deletedAt: null,
    }).lean()

    if (contacts.length === 0) {
      return NextResponse.json(
        { error: 'لا توجد جهات اتصال لهذا العميل. ارفع الشيت أولاً من صفحة العملاء.' },
        { status: 400 }
      )
    }

    // حفظ صورة الدعوة
    const invitationImageBuffer = Buffer.from(await invitationImageFile.arrayBuffer())
    const invitationImageDir = path.join(process.cwd(), 'public', 'event-images')
    
    // إنشاء المجلد إذا لم يكن موجوداً
    if (!existsSync(invitationImageDir)) {
      await mkdir(invitationImageDir, { recursive: true })
    }
    
    const invitationImageFilename = `${Date.now()}-${invitationImageFile.name}`
    const invitationImagePath = path.join(invitationImageDir, invitationImageFilename)
    await writeFile(invitationImagePath, invitationImageBuffer)

    // إنشاء الفعالية
    const event = await Event.create({
      companyId: session.user.companyId,
      clientId: client._id,
      title,
      description,
      eventDate: new Date(eventDate),
      eventTime,
      location,
      locationUrl,
      invitationImage: `/event-images/${invitationImageFilename}`,
      qrCoordinates: {
        x: qrX,
        y: qrY,
        width: qrWidth,
        height: qrHeight,
      },
      status: 'draft',
      createdBy: session.user.userId,
      clientViewToken: generateSecureToken(),
    })

    const guestsCreated: { name: string; phone: string }[] = []
    const errors: { name: string; phone: string; error: string }[] = []

    for (const contact of contacts) {
      try {
        const invitationToken = generateSecureToken()
        const qrToken = generateSecureToken()
        
        const fullName = `${(contact as any).firstName} ${(contact as any).lastName}`.trim()

        const eventGuest = await EventGuest.create({
          eventId: event._id,
          contactId: (contact as any)._id,
          companyId: session.user.companyId,
          snapshotName: fullName,
          snapshotPhone: (contact as any).phone,
          snapshotEmail: (contact as any).email,
          invitationToken,
          qrToken,
          invitationStatus: 'pending',
          rsvpStatus: 'pending',
          checkInStatus: 'pending',
          scanCount: 0,
        })

        const qrResult = await generateGuestInvitationWithQR(
          event._id.toString(),
          eventGuest._id.toString(),
          invitationImagePath,
          event.qrCoordinates!,
          process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        )

        eventGuest.qrImagePath = qrResult.qrImagePath
        eventGuest.finalInvitationImagePath = qrResult.finalInvitationImagePath
        await eventGuest.save()

        guestsCreated.push({
          name: fullName,
          phone: (contact as any).phone,
        })
      } catch (e: any) {
        const fullName = `${(contact as any).firstName} ${(contact as any).lastName}`.trim()
        errors.push({
          name: fullName,
          phone: (contact as any).phone,
          error: e?.message || 'خطأ غير معروف',
        })
      }
    }

    await ActivityLog.create({
      companyId: session.user.companyId,
      userId: session.user.userId,
      activityType: 'event_create',
      resourceType: 'Event',
      resourceId: event._id,
      details: {
        eventTitle: title,
        clientId: client._id,
        contactsCount: contacts.length,
        guestsCreated: guestsCreated.length,
        errorsCount: errors.length,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'تم إنشاء الفعالية من جهات اتصال العميل بنجاح',
        event: {
          id: event._id,
          title: event.title,
          eventDate: event.eventDate,
        },
        stats: {
          totalContacts: contacts.length,
          guestsCreated: guestsCreated.length,
          errors: errors.length,
        },
        guestsCreated,
        errors,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating event from client contacts:', error)
    return NextResponse.json({ error: 'فشل في إنشاء الفعالية: ' + error.message }, { status: 500 })
  }
}
