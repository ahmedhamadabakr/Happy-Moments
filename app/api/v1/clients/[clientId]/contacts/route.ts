import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/db'
import { requireAuth } from '@/lib/middleware/permissions'
import { Client } from '@/lib/models/Client'
import { Contact } from '@/lib/models/Contact'
import { validateExcelFile } from '@/lib/utils/excelParser'
import * as xlsx from 'xlsx'

export async function GET(
  request: NextRequest,
  context: Promise<{ params: { clientId: string } }>
) {
  try {
    const { params } = await context
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
  context: Promise<{ params: { clientId: string } }>
) {
  try {
    const { params } = await context
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

    const workbook = xlsx.read(contactsBuffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    // header: 1 converts rows to arrays of strings
    const rows = xlsx.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
    }) as (string | number)[][]

    const parsedContacts: { fullName: string; phone: string; email?: string }[] = []
    const parsingErrors: { name: string; phone: string; error: string }[] = []

    // Start from 1 to skip header row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      if (!row || row.every((cell) => String(cell).trim() === '')) {
        continue // Skip empty rows
      }

      const firstName = String(row[0] || '').trim()
      const lastName = String(row[1] || '').trim()
      const suffix = String(row[2] || '').trim()
      let phone = String(row[3] || '').trim().replace(/\s/g, '')

      const fullName = [firstName, lastName, suffix].filter(Boolean).join(' ')

      if (!fullName || !phone) {
        parsingErrors.push({ name: fullName || `Row ${i + 1}`, phone: phone || 'N/A', error: 'الاسم أو الرقم مفقود' })
        continue
      }

      // Normalize phone for Kuwait: add +965 if not present
      if (!phone.startsWith('+')) {
        phone = `+965${phone.replace(/^0+/, '')}`
      }

      parsedContacts.push({ fullName, phone })
    }

    if (parsedContacts.length === 0) {
      return NextResponse.json({ error: 'لا توجد بيانات صحيحة في الملف' }, { status: 400 })
    }

    let created = 0
    let updated = 0
    let skipped = 0
    const dbErrors: { name: string; phone: string; error: string }[] = []

    for (const parsed of parsedContacts) {
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
          dbErrors.push({
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
        dbErrors.push({
          name: parsed.fullName,
          phone: parsed.phone,
          error: e?.message || 'خطأ غير معروف',
        })
      }
    }

    const allErrors = [...parsingErrors, ...dbErrors]

    return NextResponse.json(
      {
        success: true,
        message: 'تم رفع جهات الاتصال بنجاح',
        stats: {
          total: rows.length - 1, // Exclude header
          valid: parsedContacts.length,
          created,
          updated,
          skipped,
          errors: allErrors.length,
        },
        errors: allErrors,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error uploading client contacts:', error)
    return NextResponse.json({ error: 'فشل في رفع جهات الاتصال' }, { status: 500 })
  }
}
