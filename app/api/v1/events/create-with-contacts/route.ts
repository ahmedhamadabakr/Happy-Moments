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
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const uploadToCloudinary = (
  buffer: Buffer,
  options: object
): Promise<cloudinary.UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

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
      const accessToken = generateSecureToken();
      const newClient = await Client.create({
        fullName: newClientName,
        email: newClientEmail,
        phone: newClientPhone,
        accessToken,
        createdBy: session.userId,
        isActive: true,
      });
      finalClientId = newClient._id.toString();
    }

    const invitationImageBuffer = Buffer.from(await invitationImageFile.arrayBuffer());
    const invitationUploadResult = await uploadToCloudinary(invitationImageBuffer, {
      folder: `events/templates`,
      public_id: `event_${Date.now()}`
    });

    const event = await Event.create({
      clientId: finalClientId,
      title,
      description,
      eventDate: new Date(eventDate),
      eventTime,
      location,
      locationUrl,
      invitationImage: invitationUploadResult.public_id,
      qrCoordinates: { x: qrX, y: qrY, width: qrWidth, height: qrHeight },
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
        let contact = await Contact.findOne({ phone: parsedContact.phone, deletedAt: null });

        if (!contact) {
          contact = await Contact.create({
            fullName: parsedContact.fullName,
            phone: parsedContact.phone,
            email: parsedContact.email,
          });
        }

        const invitationToken = generateSecureToken();
        const qrToken = generateSecureToken();

        const eventGuest = await EventGuest.create({
          eventId: event._id,
          contactId: contact._id,
          snapshotName: parsedContact.fullName,
          snapshotPhone: parsedContact.phone,
          snapshotEmail: parsedContact.email,
          companion: contact.companion,
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
          event.invitationImage!, // Pass Cloudinary public_id
          event.qrCoordinates!,
          process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        );

        // تحديث بيانات الضيف
        eventGuest.finalInvitationUrl = qrResult.finalInvitationUrl;
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

    await ActivityLog.create({
      userId: session.userId,
      activityType: 'event_create',
      resourceType: 'Event',
      resourceId: event._id,
      details: { eventTitle: title, guestsCount: guestsCreated.length, errorsCount: errors.length },
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
