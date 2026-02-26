import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/jwt'
import { Contact } from '@/lib/models/Contact'
import { Company } from '@/lib/models/Company'
import { ActivityLog } from '@/lib/models/ActivityLog'
import { parseExcelFile } from '@/lib/utils/excelParser'
import { handleApiError } from '@/lib/api/errors'
import { connectDB } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const user = await auth(req)
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      )
    }

    // Connect to database
    await connectDB()

    // Get file from request
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'الملف مطلوب' },
        { status: 400 }
      )
    }

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'نوع الملف يجب أن يكون Excel (.xlsx أو .xls)' },
        { status: 400 }
      )
    }

    // Parse Excel file
    const buffer = await file.arrayBuffer()
    const { contacts: parsedContacts, errors: parseErrors } = parseExcelFile(
      Buffer.from(buffer)
    )

    if (parsedContacts.length === 0) {
      return NextResponse.json(
        { error: 'الملف لا يحتوي على جهات اتصال صحيحة', errors: parseErrors },
        { status: 400 }
      )
    }

    // Verify company exists
    const company = await Company.findById(user.companyId)
    if (!company) {
      return NextResponse.json(
        { error: 'الشركة غير موجودة' },
        { status: 404 }
      )
    }

    // Insert contacts with deduplication
    let inserted = 0
    let duplicates = 0
    let skipped = 0
    const insertionErrors: { phone: string; error: string }[] = []

    for (const contactData of parsedContacts) {
      try {
        // Check if contact with same phone exists in this company
        const existing = await Contact.findOne({
          companyId: user.companyId,
          phone: contactData.phone,
          deletedAt: null,
        })

        if (existing) {
          duplicates++
          continue
        }

        // Create new contact
        const contact = await Contact.create({
          companyId: user.companyId,
          fullName: contactData.fullName,
          phone: contactData.phone,
          email: contactData.email,
        })

        inserted++
      } catch (error) {
        skipped++
        insertionErrors.push({
          phone: contactData.phone,
          error: error instanceof Error ? error.message : 'خطأ غير معروف',
        })
      }
    }

    // Log activity
    await ActivityLog.create({
      companyId: user.companyId,
      userId: user._id,
      activityType: 'contact_upload',
      resourceType: 'Contact',
      resourceId: company._id,
      details: {
        fileName: file.name,
        totalRows: parsedContacts.length,
        inserted,
        duplicates,
        skipped,
        errors: insertionErrors,
      },
    })

    return NextResponse.json({
      success: true,
      totalRows: parsedContacts.length,
      inserted,
      duplicates,
      skipped,
      errors: parseErrors.length > 0 ? parseErrors : undefined,
      insertionErrors: insertionErrors.length > 0 ? insertionErrors : undefined,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
