import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/db'
import { requireAuth } from '@/lib/middleware/permissions'
import { Client } from '@/lib/models/Client'
import { Contact } from '@/lib/models/Contact'
import { parseExcelFile, validateExcelFile } from '@/lib/utils/excelParser'

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.clientId)) {
      return NextResponse.json({ error: 'معرّف غير صحيح' }, { status: 400 })
    }

    const client = await Client.findOne({
      _id: params.clientId,
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
    })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      contacts,
    })
  } catch (error: any) {
    console.error('Error fetching client contacts:', error)
    return NextResponse.json({ error: 'فشل في جلب جهات الاتصال' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.clientId)) {
      return NextResponse.json({ error: 'معرّف غير صحيح' }, { status: 400 })
    }

    const client = await Client.findOne({
      _id: params.clientId,
      companyId: session.user.companyId,
      isActive: true,
    })

    if (!client) {
      return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })
    }

    const formData = await request.formData()
    const contactsFile = formData.get('contactsFile') as File

    if (!contactsFile) {
      return NextResponse.json({ error: 'ملف جهات الاتصال مطلوب' }, { status: 400 })
    }

    if (!validateExcelFile(contactsFile.name, contactsFile.type)) {
      return NextResponse.json(
        { error: 'نوع الملف غير صحيح. يجب أن يكون Excel أو CSV' },
        { status: 400 }
      )
    }

    const contactsBuffer = Buffer.from(await contactsFile.arrayBuffer())
    const parseResult = await parseExcelFile(contactsBuffer)

    if (parseResult.validRows === 0) {
      return NextResponse.json({ error: 'لا توجد بيانات صحيحة في الملف' }, { status: 400 })
    }

    let created = 0
    let updated = 0
    let skipped = 0
    const errors: { name: string; phone: string; error: string }[] = []

    for (const parsed of parseResult.contacts) {
      try {
        const existing = await Contact.findOne({
          companyId: session.user.companyId,
          phone: parsed.phone,
          deletedAt: null,
        })

        if (!existing) {
          await Contact.create({
            companyId: session.user.companyId,
            clientId: client._id,
            fullName: parsed.fullName,
            phone: parsed.phone,
            email: parsed.email,
          })
          created++
          continue
        }

        if (existing.clientId && existing.clientId.toString() !== client._id.toString()) {
          skipped++
          errors.push({
            name: parsed.fullName,
            phone: parsed.phone,
            error: 'رقم الهاتف مسجل بالفعل لعميل آخر',
          })
          continue
        }

        existing.clientId = client._id
        existing.fullName = parsed.fullName
        existing.email = parsed.email
        await existing.save()
        updated++
      } catch (e: any) {
        errors.push({
          name: parsed.fullName,
          phone: parsed.phone,
          error: e?.message || 'خطأ غير معروف',
        })
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'تم رفع جهات الاتصال بنجاح',
        stats: {
          total: parseResult.totalRows,
          valid: parseResult.validRows,
          created,
          updated,
          skipped,
          errors: errors.length,
        },
        errors,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error uploading client contacts:', error)
    return NextResponse.json({ error: 'فشل في رفع جهات الاتصال' }, { status: 500 })
  }
}
