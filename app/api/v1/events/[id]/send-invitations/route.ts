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

function normalizePhoneE164Like(phone: string) {
  // Minimal normalization: keep digits and leading +.
  // WhatsApp Cloud API expects an E.164-like number without spaces.
  const trimmed = phone.trim()
  if (trimmed.startsWith('+')) {
    return `+${trimmed.slice(1).replace(/\D/g, '')}`
  }
  return trimmed.replace(/\D/g, '')
}

async function sendWhatsAppTemplateMessage(args: {
  phoneNumber: string
  imageUrl: string
  guestName: string
  eventTitle: string
  eventDate: string
  rsvpLink: string
  locationUrl: string
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME
  const templateLang = process.env.WHATSAPP_TEMPLATE_LANG || 'ar'
  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0'

  if (!accessToken || !phoneNumberId || !templateName) {
    return {
      success: false,
      error:
        'Missing WhatsApp env vars. Required: WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_TEMPLATE_NAME',
    }
  }

  try {
    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`

    const to = normalizePhoneE164Like(args.phoneNumber)

    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: templateLang,
        },
        components: [
          {
            type: 'header',
            parameters: [
              {
                type: 'image',
                image: {
                  link: args.imageUrl,
                },
              },
            ],
          },
          {
            type: 'body',
            parameters: [
              { type: 'text', text: args.guestName },
              { type: 'text', text: args.eventTitle },
              { type: 'text', text: args.eventDate },
              { type: 'text', text: args.rsvpLink },
              { type: 'text', text: args.locationUrl },
            ],
          },
        ],
      },
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const json = await res.json().catch(() => null)

    if (!res.ok) {
      const errorMsg =
        json?.error?.message ||
        json?.message ||
        'WhatsApp API request failed'
      return { success: false, error: errorMsg }
    }

    const messageId = json?.messages?.[0]?.id
    return { success: true, messageId }
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
    const user = await auth()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'معرّف غير صحيح' }, { status: 400 })
    }

    const event = await Event.findOne({ _id: params.id, deletedAt: null })

    if (!event) {
      return NextResponse.json({ error: 'الفعالية غير موجودة' }, { status: 404 })
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

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    for (const guest of eventGuests) {
      try {
        // Generate RSVP link
        const rsvpLink = `${baseUrl}/rsvp/${guest.invitationToken}`

        const invitationImageUrl = guest.finalInvitationUrl

        if (!invitationImageUrl) {
          throw new Error(`Missing finalInvitationUrl for guest ${guest._id}`)
        }

        const eventDate = event.eventDate.toISOString().split('T')[0]

        // Create invitation record first (so we can link WhatsAppMessage.invitationId correctly)
        const invitation = await Invitation.create({
          eventGuestId: guest._id,
          eventId: params.id,
          channel: 'whatsapp',
          recipientPhone: guest.snapshotPhone,
          deliveryStatus: 'pending',
          retryCount: 0,
        })

        const result = await sendWhatsAppTemplateMessage({
          phoneNumber: guest.snapshotPhone,
          imageUrl: invitationImageUrl,
          guestName: guest.snapshotName,
          eventTitle: event.title,
          eventDate,
          rsvpLink,
          locationUrl: event.locationUrl || '',
        })

        if (result.success) {
          invitation.deliveryStatus = 'sent'
          invitation.externalMessageId = result.messageId
          invitation.sentAt = new Date()
          await invitation.save()

          // Create WhatsApp message record
          await WhatsAppMessage.create({
            invitationId: invitation._id,
            eventGuestId: guest._id,
            eventId: params.id,
            phoneNumber: guest.snapshotPhone,
            messageText: `مرحباً ${guest.snapshotName}،\nتم دعوتك لحضور: ${event.title}\nالتاريخ: ${eventDate}\nللتأكيد: ${rsvpLink}`,
            externalMessageId: result.messageId,
            status: 'sent',
            sentAt: new Date(),
            statusHistory: [{ status: 'sent', timestamp: new Date() }],
          })

          // Update guest invitation status
          guest.invitationStatus = 'sent'
          guest.invitationSentAt = new Date()
          await guest.save()

          sent++
        } else {
          invitation.deliveryStatus = 'failed'
          invitation.failureReason = result.error
          await invitation.save()

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

    await ActivityLog.create({
      userId: user.userId,
      activityType: 'invitation_send',
      resourceType: 'Event',
      resourceId: event._id,
      details: { eventTitle: event.title, totalGuests: eventGuests.length, sent, failed },
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
