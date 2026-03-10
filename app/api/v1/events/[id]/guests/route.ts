import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/jwt'
import { Event } from '@/lib/models/Event'
import { Contact } from '@/lib/models/Contact'
import { EventGuest } from '@/lib/models/EventGuest'
import { selectGuestsSchema } from '@/lib/validations/event'
import { handleApiError } from '@/lib/api/errors'
import { connectDB } from '@/lib/db'
import crypto from 'crypto'
import mongoose from 'mongoose'


function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}


export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const user = await auth(req)
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    await connectDB()
    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const skip = (page - 1) * limit

    const guests = await EventGuest.find({ eventId: id, companyId: user.companyId })
      .select('-__v')
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await EventGuest.countDocuments({ eventId: id, companyId: user.companyId })

    return NextResponse.json({ success: true, data: guests, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const user = await auth(req)
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    await connectDB()
    const body = await req.json()

    const event = await Event.findOne({ _id: id, companyId: user.companyId, deletedAt: null })
    if (!event) return NextResponse.json({ error: 'الفعالية غير موجودة' }, { status: 404 })
    if (event.status === 'closed') return NextResponse.json({ error: 'الفعالية مغلقة' }, { status: 400 })


    // إضافة ضيف يدوي
    if (!body.contactIds) {
      const { firstName, lastName, phone, companion } = body
      if (!firstName || !phone) return NextResponse.json({ error: 'الاسم الأول ورقم الهاتف مطلوبان', status: 400 })
      const phoneExists = await EventGuest.findOne({ snapshotPhone: phone, companyId: user.companyId })
      if (phoneExists) return NextResponse.json({ error: 'رقم الجوال موجود بالفعل' }, { status: 409 })
      const fullName = `${firstName} ${lastName || ''}`.trim()
      const newGuest = await EventGuest.create({
        eventId: id,
        companyId: user.companyId,
        firstName,
        lastName,
        phone,
        companion: Number(companion) || 0,
        snapshotName: fullName,
        snapshotPhone: phone,
        invitationToken: generateToken(),
        qrToken: generateToken(),
        rsvpStatus: 'pending',
        checkInStatus: 'pending',
        invitationStatus: 'pending',
        contactId: new mongoose.Types.ObjectId() // <-- لكل ضيف يدوي ID فريدة
      })
      return NextResponse.json({ success: true, data: newGuest })
    }

    // إضافة من جهات الاتصال
    const { contactIds } = selectGuestsSchema.parse(body)
    const contacts = await Contact.find({ _id: { $in: contactIds }, companyId: user.companyId, deletedAt: null })
    if (!contacts.length) return NextResponse.json({ error: 'لم يتم العثور على جهات اتصال', status: 404 })

    let created = 0
    let skipped = 0
    for (const contact of contacts) {
      const exists = await EventGuest.findOne({ eventId: id, contactId: contact._id })
      if (exists) { skipped++; continue }
      const fullName = `${contact.firstName} ${contact.lastName}`.trim()
      await EventGuest.create({
        eventId: id,
        contactId: contact._id,
        companyId: user.companyId,
        snapshotName: fullName,
        snapshotPhone: contact.phone,
        snapshotEmail: contact.email,
        invitationToken: generateToken(),
        qrToken: generateToken(),
        rsvpStatus: 'pending',
        checkInStatus: 'pending',
        invitationStatus: 'pending'
      })
      created++
    }

    return NextResponse.json({ success: true, created, skipped })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params
    const user = await auth(req)
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    await connectDB()
    const urlParts = req.url.split('/')
    const guestId = urlParts[urlParts.length - 1]

    const guest = await EventGuest.findOneAndDelete({ _id: guestId, eventId: id, companyId: user.companyId })
    if (!guest) return NextResponse.json({ error: 'الضيف غير موجود' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch (err) {
    return handleApiError(err)
  }
}

// GET بالباجنينش
