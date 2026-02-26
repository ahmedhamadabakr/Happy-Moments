import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/jwt'
import { Event } from '@/lib/models/Event'
import { EventGuest } from '@/lib/models/EventGuest'
import { Invitation } from '@/lib/models/Invitation'
import { WhatsAppMessage } from '@/lib/models/WhatsAppMessage'
import { ActivityLog } from '@/lib/models/ActivityLog'
import { handleApiError } from '@/lib/api/errors'
import { connectDB } from '@/lib/db'
import mongoose from 'mongoose'

// Mock WhatsApp API - in production, integrate with actual WhatsApp Business API
async function sendWhatsAppMessage(
  phoneNumber: string,
  guestName: string,
  eventTitle: string,
  eventDate: string,
  rsvpLink: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Mock implementation - in production:
    // 1. Use WhatsApp Business API
    // 2. Handle errors and retries
    // 3. Store message metadata
    
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Simulate API call with 95% success rate
    const isSuccess = Math.random() < 0.95
    
    if (isSuccess) {
      return { success: true, messageId }
    } else {
      return { success: false, error: 'فشل في إرسال الرسالة' }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'خطأ غير معروف',
    }
  }
}

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

    // Get all pending event guests
    const eventGuests = await EventGuest.find({
      eventId: params.id,
      invitationStatus: 'pending',
    })

    if (eventGuests.length === 0) {
      return NextResponse.json(
        { error: 'لا توجد ضيوف بانتظار الدعوات' },
        { status: 400 }
      )
    }

    let sent = 0
    let failed = 0
    const errors: { phone: string; error: string }[] = []

    for (const guest of eventGuests) {
      try {
        // Generate RSVP link
        const rsvpLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/rsvp/${guest.invitationToken}`

        // Send WhatsApp message
        const result = await sendWhatsAppMessage(
          guest.snapshotPhone,
          guest.snapshotName,
          event.title,
          event.eventDate.toISOString().split('T')[0],
          rsvpLink
        )

        if (result.success) {
          // Create invitation record
          await Invitation.create({
            eventGuestId: guest._id,
            eventId: params.id,
            companyId: user.companyId,
            channel: 'whatsapp',
            recipientPhone: guest.snapshotPhone,
            deliveryStatus: 'sent',
            externalMessageId: result.messageId,
            sentAt: new Date(),
          })

          // Create WhatsApp message record
          await WhatsAppMessage.create({
            invitationId: new mongoose.Types.ObjectId(), // Placeholder
            eventGuestId: guest._id,
            eventId: params.id,
            companyId: user.companyId,
            phoneNumber: guest.snapshotPhone,
            messageText: `مرحباً ${guest.snapshotName}،\nتم دعوتك لحضور: ${event.title}\nالتاريخ: ${event.eventDate.toISOString().split('T')[0]}\nللتأكيد: ${rsvpLink}`,
            externalMessageId: result.messageId,
            status: 'sent',
            sentAt: new Date(),
            statusHistory: [
              { status: 'sent', timestamp: new Date() },
            ],
          })

          // Update guest invitation status
          guest.invitationStatus = 'sent'
          guest.invitationSentAt = new Date()
          await guest.save()

          sent++
        } else {
          // Create failed invitation record
          await Invitation.create({
            eventGuestId: guest._id,
            eventId: params.id,
            companyId: user.companyId,
            channel: 'whatsapp',
            recipientPhone: guest.snapshotPhone,
            deliveryStatus: 'failed',
            failureReason: result.error,
          })

          guest.invitationStatus = 'failed'
          await guest.save()

          failed++
          errors.push({ phone: guest.snapshotPhone, error: result.error || 'خطأ غير معروف' })
        }
      } catch (error) {
        failed++
        errors.push({
          phone: guest.snapshotPhone,
          error: error instanceof Error ? error.message : 'خطأ غير معروف',
        })
      }
    }

    // Log activity
    await ActivityLog.create({
      companyId: user.companyId,
      userId: user._id,
      activityType: 'invitation_send',
      resourceType: 'Event',
      resourceId: event._id,
      details: {
        eventTitle: event.title,
        totalGuests: eventGuests.length,
        sent,
        failed,
      },
    })

    return NextResponse.json({
      success: true,
      message: `تم إرسال ${sent} دعوة بنجاح`,
      sent,
      failed,
      ...(errors.length > 0 && { errors }),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
