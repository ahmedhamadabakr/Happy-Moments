import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/jwt'
import { Contact } from '@/lib/models/Contact'
import { ActivityLog } from '@/lib/models/ActivityLog'
import { handleApiError } from '@/lib/api/errors'
import { connectDB } from '@/lib/db'
import mongoose from 'mongoose'

export async function GET(
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

    const contact = await Contact.findOne({
      _id: params.id,
      companyId: user.companyId,
      deletedAt: null,
    }).lean()

    if (!contact) {
      return NextResponse.json(
        { error: 'جهة الاتصال غير موجودة' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: contact })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(
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

    const body = await req.json()
    const { fullName, phone, email } = body

    // Check if contact exists
    const contact = await Contact.findOne({
      _id: params.id,
      companyId: user.companyId,
      deletedAt: null,
    })

    if (!contact) {
      return NextResponse.json(
        { error: 'جهة الاتصال غير موجودة' },
        { status: 404 }
      )
    }

    // Check for phone duplicates if phone is being changed
    if (phone && phone !== contact.phone) {
      const existing = await Contact.findOne({
        companyId: user.companyId,
        phone,
        deletedAt: null,
        _id: { $ne: params.id },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'جهة اتصال بهذا الرقم موجودة بالفعل' },
          { status: 409 }
        )
      }
    }

    // Update contact
    const updated = await Contact.findByIdAndUpdate(
      params.id,
      { fullName, phone, email },
      { new: true, runValidators: true }
    ).lean()

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
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

    const contact = await Contact.findOne({
      _id: params.id,
      companyId: user.companyId,
      deletedAt: null,
    })

    if (!contact) {
      return NextResponse.json(
        { error: 'جهة الاتصال غير موجودة' },
        { status: 404 }
      )
    }

    // Soft delete
    contact.deletedAt = new Date()
    await contact.save()

    // Log activity
    await ActivityLog.create({
      companyId: user.companyId,
      userId: user._id,
      activityType: 'contact_delete',
      resourceType: 'Contact',
      resourceId: contact._id,
      details: { contactName: contact.fullName, contactPhone: contact.phone },
    })

    return NextResponse.json({
      success: true,
      message: 'تم حذف جهة الاتصال بنجاح',
    })
  } catch (error) {
    return handleApiError(error)
  }
}
