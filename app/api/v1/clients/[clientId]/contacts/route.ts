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
  context: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await context.params

    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return NextResponse.json({ error: 'معرّف غير صحيح' }, { status: 400 })
    }

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
    })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      contacts,
    })
  } catch (error) {
    console.error('Error fetching client contacts:', error)
    return NextResponse.json(
      { error: 'فشل في جلب جهات الاتصال' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await context.params

    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return NextResponse.json({ error: 'معرّف غير صحيح' }, { status: 400 })
    }

    const client = await Client.findOne({
      _id: clientId,
      companyId: session.user.companyId,
      isActive: true,
    })

    if (!client) {
      return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })
    }

    const formData = await request.formData()
    const contactsFile = formData.get('contactsFile') as File

    if (!contactsFile) {
      return NextResponse.json(
        { error: 'ملف جهات الاتصال مطلوب' },
        { status: 400 }
      )
    }

    if (!validateExcelFile(contactsFile.name, contactsFile.type)) {
      return NextResponse.json(
        { error: 'نوع الملف غير صحيح. يجب أن يكون Excel أو CSV' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await contactsFile.arrayBuffer())

    const workbook = xlsx.read(buffer, { type: 'buffer' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]

    const rows = xlsx.utils.sheet_to_json(sheet, {
      header: 1,
      defval: '',
    }) as (string | number)[][]

    const parsedContacts: {
      firstName: string
      lastName: string
      suffix?: string
      phone: string
      companion?: number
      email?: string
    }[] = []

    const parsingErrors: any[] = []

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]

      if (!row || row.every((c) => String(c).trim() === '')) continue

      const firstName = String(row[0] || '').trim()
      const lastName = String(row[1] || '').trim()
      const suffix = String(row[2] || '').trim() || undefined

      let phone = String(row[3] || '').replace(/\D/g, '')

      const companionValue = row[4]
      const email = String(row[5] || '').trim() || undefined

      let companion: number | undefined = undefined
      if (companionValue !== '' && companionValue !== undefined) {
        const num = Number(companionValue)
        if (!isNaN(num)) companion = num
      }

      if (!firstName || !lastName || !phone) {
        parsingErrors.push({
          name: `${firstName} ${lastName}` || `Row ${i + 1}`,
          phone: phone || 'N/A',
          error: 'الاسم الأول أو الأخير أو الرقم مفقود',
        })
        continue
      }

      if (phone.startsWith('965')) {
        phone = `+${phone}`
      } else {
        phone = `+965${phone.replace(/^0+/, '')}`
      }

      parsedContacts.push({
        firstName,
        lastName,
        suffix,
        phone,
        companion,
        email,
      })
    }

    if (parsedContacts.length === 0) {
      return NextResponse.json(
        { error: 'لا توجد بيانات صحيحة في الملف' },
        { status: 400 }
      )
    }

    // De-duplicate contacts from the uploaded file, last one wins
    const uniqueParsedContactsMap = new Map()
    for (const contact of parsedContacts) {
      uniqueParsedContactsMap.set(contact.phone, contact)
    }
    const uniqueParsedContacts = Array.from(uniqueParsedContactsMap.values())
    const skipped = parsedContacts.length - uniqueParsedContacts.length

    const phones = uniqueParsedContacts.map((c) => c.phone)

    const existingContacts = await Contact.find({
      companyId: session.user.companyId,
      phone: { $in: phones },
      deletedAt: null,
    })

    const existingMap = new Map(existingContacts.map((c) => [c.phone, c]))

    let created = 0
    let updated = 0

    const dbErrors: any[] = []
    const newContacts: any[] = []
    const updatePromises: Promise<any>[] = []

    for (const parsed of uniqueParsedContacts) {
      try {
        const existing = existingMap.get(parsed.phone)

        if (existing) {
          // Update existing contact and associate it with the current client
          existing.firstName = parsed.firstName
          existing.lastName = parsed.lastName
          existing.suffix = parsed.suffix
          existing.companion = parsed.companion
          existing.email = parsed.email
          existing.clientId = client._id
          updatePromises.push(existing.save())
          updated++
        } else {
          // Create new contact
          newContacts.push({
            companyId: session.user.companyId,
            clientId: client._id,
            firstName: parsed.firstName,
            lastName: parsed.lastName,
            suffix: parsed.suffix,
            phone: parsed.phone,
            companion: parsed.companion,
            email: parsed.email,
          })
          created++
        }
      } catch (e: any) {
        dbErrors.push({
          name: `${parsed.firstName} ${parsed.lastName}`,
          phone: parsed.phone,
          error: e?.message || 'خطأ غير معروف',
        })
      }
    }

    if (newContacts.length > 0) {
      await Contact.insertMany(newContacts)
    }

    if (updatePromises.length > 0) {
      await Promise.all(updatePromises)
    }

    const allErrors = [...parsingErrors, ...dbErrors]

    return NextResponse.json(
      {
        success: true,
        message: 'تم رفع جهات الاتصال بنجاح',
        stats: {
          total: rows.length - 1,
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
  } catch (error) {
    console.error('Error uploading client contacts:', error)
    return NextResponse.json(
      { error: 'فشل في رفع جهات الاتصال' },
      { status: 500 }
    )
  }
}