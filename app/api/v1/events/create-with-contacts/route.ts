import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Event } from '@/lib/models/Event';
import { Client } from '@/lib/models/Client';
import { Contact } from '@/lib/models/Contact';
import { EventGuest } from '@/lib/models/EventGuest';
import { requireAnyPermission } from '@/lib/middleware/permissions';
import { EmployeePermission } from '@/lib/types/roles';
import { parseExcelFile, validateExcelFile } from '@/lib/utils/excelParser';
import { generateSecureToken, generateGuestInvitationWithQR } from '@/lib/utils/qrGenerator';
import { ActivityLog } from '@/lib/models/ActivityLog';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

/**
 * POST /api/v1/events/create-with-contacts
 * إنشاء فعالية مع رفع جهات اتصال من Excel
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAnyPermission(request, [
      EmployeePermission.EVENT_CREATE,
    ]);
    if (session instanceof NextResponse) return session;

    const formData = await request.formData();
    
    // بيانات الفعالية
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const eventDate = formData.get('eventDate') as string;
    const eventTime = formData.get('eventTime') as string;
    const location = formData.get('location') as string;
    const locationUrl = formData.get('locationUrl') as string;
    
    // بيانات العميل
    const clientId = formData.get('clientId') as string;
    const newClientName = formData.get('newClientName') as string;
    const newClientEmail = formData.get('newClientEmail') as string;
    const newClientPhone = formData.get('newClientPhone') as string;
    
    // الملفات
    const invitationImageFile = formData.get('invitationImage') as File;
    const contactsFile = formData.get('contactsFile') as File;
    
    // إحداثيات QR
    const qrX = parseInt(formData.get('qrX') as string) || 50;
    const qrY = parseInt(formData.get('qrY') as string) || 50;
    const qrWidth = parseInt(formData.get('qrWidth') as string) || 150;
    const qrHeight = parseInt(formData.get('qrHeight') as string) || 150;

    // التحقق من البيانات
    if (!title || !eventDate || !invitationImageFile || !contactsFile) {
      return NextResponse.json(
        { error: 'البيانات المطلوبة ناقصة' },
        { status: 400 }
      );
    }

    await connectDB();

    // معالجة العميل
    let finalClientId = clientId;
    
    if (!clientId && newClientName) {
      // إنشاء عميل جديد
      const accessToken = generateSecureToken();
      const newClient = await Client.create({
        companyId: session.companyId,
        fullName: newClientName,
        email: newClientEmail,
        phone: newClientPhone,
        accessToken,
        createdBy: session.userId,
        isActive: true,
      });
      finalClientId = newClient._id.toString();
    }

    // حفظ صورة الدعوة
    const invitationImageBuffer = Buffer.from(await invitationImageFile.arrayBuffer());
    const invitationImageDir = path.join(process.cwd(), 'public', 'event-images');
    
    // إنشاء المجلد إذا لم يكن موجوداً
    if (!existsSync(invitationImageDir)) {
      await mkdir(invitationImageDir, { recursive: true });
    }
    
    const invitationImageFilename = `${Date.now()}-${invitationImageFile.name}`;
    const invitationImagePath = path.join(invitationImageDir, invitationImageFilename);
    
    await writeFile(invitationImagePath, invitationImageBuffer);

    // إنشاء الفعالية
    const event = await Event.create({
      companyId: session.companyId,
      clientId: finalClientId,
      title,
      description,
      eventDate: new Date(eventDate),
      eventTime,
      location,
      locationUrl,
      invitationImage: `/event-images/${invitationImageFilename}`,
      qrCoordinates: {
        x: qrX,
        y: qrY,
        width: qrWidth,
        height: qrHeight,
      },
      status: 'draft',
      createdBy: session.userId,
    });

    // معالجة ملف Excel
    const contactsBuffer = Buffer.from(await contactsFile.arrayBuffer());
    
    if (!validateExcelFile(contactsFile.name, contactsFile.type)) {
      return NextResponse.json(
        { error: 'نوع الملف غير صحيح. يجب أن يكون Excel أو CSV' },
        { status: 400 }
      );
    }

    const parseResult = await parseExcelFile(contactsBuffer);

    if (parseResult.validRows === 0) {
      return NextResponse.json(
        { error: 'لا توجد بيانات صحيحة في الملف' },
        { status: 400 }
      );
    }

    // إضافة جهات الاتصال وإنشاء الضيوف
    const guestsCreated = [];
    const errors = [];

    for (const parsedContact of parseResult.contacts) {
      try {
        // البحث عن جهة الاتصال أو إنشاؤها
        let contact = await Contact.findOne({
          companyId: session.companyId,
          phone: parsedContact.phone,
          deletedAt: null,
        });

        if (!contact) {
          contact = await Contact.create({
            companyId: session.companyId,
            fullName: parsedContact.fullName,
            phone: parsedContact.phone,
            email: parsedContact.email,
          });
        }

        // توليد Tokens
        const invitationToken = generateSecureToken();
        const qrToken = generateSecureToken();

        // إنشاء ضيف الفعالية
        const eventGuest = await EventGuest.create({
          eventId: event._id,
          contactId: contact._id,
          companyId: session.companyId,
          snapshotName: parsedContact.fullName,
          snapshotPhone: parsedContact.phone,
          snapshotEmail: parsedContact.email,
          invitationToken,
          qrToken,
          invitationStatus: 'pending',
          rsvpStatus: 'pending',
          checkInStatus: 'pending',
          scanCount: 0,
        });

        // توليد QR ودمجه مع صورة الدعوة
        const qrResult = await generateGuestInvitationWithQR(
          event._id.toString(),
          eventGuest._id.toString(),
          invitationImagePath,
          event.qrCoordinates!,
          process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        );

        // تحديث بيانات الضيف
        eventGuest.qrImagePath = qrResult.qrImagePath;
        eventGuest.finalInvitationImagePath = qrResult.finalInvitationImagePath;
        await eventGuest.save();

        guestsCreated.push({
          name: parsedContact.fullName,
          phone: parsedContact.phone,
        });
      } catch (error: any) {
        console.error('Error creating guest:', error);
        errors.push({
          name: parsedContact.fullName,
          phone: parsedContact.phone,
          error: error.message,
        });
      }
    }

    // تسجيل النشاط
    await ActivityLog.create({
      companyId: session.companyId,
      userId: session.userId,
      activityType: 'event_create',
      resourceType: 'Event',
      resourceId: event._id,
      details: {
        eventTitle: title,
        guestsCount: guestsCreated.length,
        errorsCount: errors.length,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الفعالية بنجاح',
      event: {
        id: event._id,
        title: event.title,
        eventDate: event.eventDate,
      },
      stats: {
        totalProcessed: parseResult.totalRows,
        guestsCreated: guestsCreated.length,
        errors: errors.length,
      },
      guestsCreated,
      errors,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating event with contacts:', error);
    return NextResponse.json(
      { error: 'فشل في إنشاء الفعالية: ' + error.message },
      { status: 500 }
    );
  }
}
