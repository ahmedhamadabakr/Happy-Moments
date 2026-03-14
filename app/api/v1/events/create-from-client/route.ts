import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { requireAnyPermission } from '@/lib/middleware/permissions'
import { EmployeePermission } from '@/lib/types/roles'
import { Event } from '@/lib/models/Event'
import { Client } from '@/lib/models/Client'
import { Contact } from '@/lib/models/Contact'
import { EventGuest } from '@/lib/models/EventGuest'
import { ActivityLog } from '@/lib/models/ActivityLog'
import { generateSecureToken } from '@/lib/utils/qrGenerator'
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import mongoose from 'mongoose';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const uploadToCloudinary = (buffer: Buffer, folder: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (result) resolve(result.secure_url);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

export async function POST(request: NextRequest) {
  await connectDB();
  const sessionDb = await mongoose.startSession();
  
  try {
    // --- 1. التحقق من الصلاحيات ---
    const session = await requireAnyPermission(request, [EmployeePermission.EVENT_CREATE]);
    if (session instanceof NextResponse) return session;

    const formData = await request.formData();
    const clientId = formData.get('clientId') as string;
    const invitationImageFile = formData.get('invitationImage') as File;

    if (!formData.get('title') || !clientId || !invitationImageFile) {
      return NextResponse.json({ error: 'البيانات الأساسية مطلوبة' }, { status: 400 });
    }

    // --- 2. جلب البيانات المطلوبة ---
    const [client, contacts] = await Promise.all([
      Client.findOne({ _id: clientId, companyId: session.user.companyId, isActive: true }),
      Contact.find({ clientId, companyId: session.user.companyId, deletedAt: null }).lean()
    ]);

    if (!client) return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 });
    if (contacts.length === 0) return NextResponse.json({ error: 'لا توجد جهات اتصال' }, { status: 400 });

    // --- 3. رفع القالب الأساسي (مرة واحدة فقط) ---
    const buffer = Buffer.from(await invitationImageFile.arrayBuffer());
    const templateUrl = await uploadToCloudinary(buffer, `events/templates/${session.user.companyId}`);

    // --- 4. بدء المعاملة (Transaction) لضمان سلامة البيانات ---
    sessionDb.startTransaction();

    const event = new Event({
      companyId: session.user.companyId,
      clientId: client._id,
      title: formData.get('title'),
      description: formData.get('description'),
      eventDate: new Date(formData.get('eventDate') as string),
      eventTime: formData.get('eventTime'),
      location: formData.get('location'),
      invitationImage: templateUrl,
      qrCoordinates: {
        x: Number(formData.get('qrX')) || 50,
        y: Number(formData.get('qrY')) || 50,
        width: Number(formData.get('qrWidth')) || 150,
        height: Number(formData.get('qrHeight')) || 150,
      },
      status: 'processing', // حالة جديدة تعني أن الصور قيد التوليد
      createdBy: session.user.userId,
      clientViewToken: generateSecureToken(),
    });

    // تحضير بيانات الضيوف (Bulk)
    const guestsData = contacts.map(contact => ({
      eventId: event._id,
      contactId: contact._id,
      companyId: session.user.companyId,
      snapshotName: `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
      snapshotPhone: contact.phone,
      invitationToken: generateSecureToken(),
      qrToken: generateSecureToken(),
      invitationStatus: 'pending',
    }));

    await event.save({ session: sessionDb });
    await EventGuest.insertMany(guestsData, { session: sessionDb });

    await sessionDb.commitTransaction();

    // --- 5. تسجيل النشاط ---
    await ActivityLog.create({
      companyId: session.user.companyId,
      userId: session.user.userId,
      activityType: 'event_create',
      resourceType: 'event',
      resourceId: event._id,
      details: { count: contacts.length }
    });

    /**
     * ملاحظة هامة جداً:
     * هنا يجب أن تستدعي وظيفة خلفية (Background Job) لمعالجة الصور.
     * إذا كنت تستخدم Vercel، يمكنك استخدام "Vercel Cron" أو "Edge Functions".
     * أو ببساطة، ابدأ العملية ولا تنتظرها (ليست مثالية ولكنها تعمل):
     * generateAllGuestImages(event._id); 
     */

    return NextResponse.json({
      success: true,
      message: 'تم استلام الطلب وبدء معالجة بطاقات الدعوة',
      eventId: event._id,
      totalGuests: contacts.length
    }, { status: 201 });

  } catch (error: any) {
    if (sessionDb.inTransaction()) await sessionDb.abortTransaction();
    console.error('Critical Error:', error);
    return NextResponse.json({ error: 'خطأ داخلي: ' + error.message }, { status: 500 });
  } finally {
    sessionDb.endSession();
  }
}