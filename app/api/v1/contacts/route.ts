import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/jwt'
import { Contact } from '@/lib/models/Contact'
import { handleApiError } from '@/lib/api/errors'
import { connectDB } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const user = await auth(req)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()

    // Get pagination parameters
    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build query
    const query: any = {
      companyId: user.companyId,
      deletedAt: null,
    }

    if (search) {
      query.$text = { $search: search }
    }

    // Get contacts
    const contacts = await Contact.find(query)
      .select('-__v')
      .skip(skip)
      .limit(limit)
      .lean()

    // Get total count
    const total = await Contact.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await auth(req)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    await connectDB()

    const body = await req.json()
    const { fullName, phone, email } = body

    if (!fullName || !phone) {
      return NextResponse.json(
        { error: 'الاسم ورقم الهاتف مطلوبان' },
        { status: 400 }
      )
    }

    // Check for duplicates
    const existing = await Contact.findOne({
      companyId: user.companyId,
      phone,
      deletedAt: null,
    })

    if (existing) {
      return NextResponse.json(
        { error: 'جهة اتصال بهذا الرقم موجودة بالفعل' },
        { status: 409 }
      )
    }

    const contact = await Contact.create({
      companyId: user.companyId,
      fullName,
      phone,
      email,
    })

    return NextResponse.json(
      { success: true, data: contact },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
