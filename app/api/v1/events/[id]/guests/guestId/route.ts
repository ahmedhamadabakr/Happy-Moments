
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/jwt'
import { EventGuest } from '@/lib/models/EventGuest'
import { handleApiError } from '@/lib/api/errors'
import { connectDB } from '@/lib/db'
import mongoose from 'mongoose'

export async function GET(req: NextRequest, context: { params: { id: string, guestId: string } }) {
  try {
    const { id, guestId } = context.params
    const user = await auth(req)
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    await connectDB()

    const guest = await EventGuest.findOne({ _id: guestId, eventId: id }).select('-__v').lean()
    if (!guest) return NextResponse.json({ error: 'الضيف غير موجود' }, { status: 404 })

    return NextResponse.json({ success: true, data: guest })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(req: NextRequest, context: { params: { id: string, guestId: string } }) {
  try {
    const { id, guestId } = context.params
    const user = await auth(req)
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    await connectDB()
    const body = await req.json()

    const { firstName, lastName, phone, companion } = body

    const guest = await EventGuest.findOne({ _id: guestId, eventId: id })
    if (!guest) return NextResponse.json({ error: 'الضيف غير موجود' }, { status: 404 })

    const updateData: { [key: string]: any } = {}
    if (firstName) updateData.firstName = firstName
    if (lastName) updateData.lastName = lastName
    if (phone) {
        const phoneExists = await EventGuest.findOne({ snapshotPhone: phone, eventId: id, _id: { $ne: guestId } })
        if (phoneExists) return NextResponse.json({ error: 'رقم الجوال موجود بالفعل' }, { status: 409 })
        updateData.phone = phone
        updateData.snapshotPhone = phone
    }
    if (companion !== undefined) updateData.companion = Number(companion)

    if (firstName || lastName) {
        updateData.snapshotName = `${firstName || guest.firstName} ${lastName || guest.lastName || ''}`.trim()
    }


    const updatedGuest = await EventGuest.findByIdAndUpdate(guestId, updateData, { new: true })

    return NextResponse.json({ success: true, data: updatedGuest })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest, context: { params: { id: string, guestId: string } }) {
  try {
    const { id, guestId } = context.params
    const user = await auth(req)
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    await connectDB()

    const guest = await EventGuest.findOneAndDelete({ _id: guestId, eventId: id })
    if (!guest) return NextResponse.json({ error: 'الضيف غير موجود' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch (err) {
    return handleApiError(err)
  }
}
