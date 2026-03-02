import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import ImageModel from '@/models/Image';

export const runtime = 'nodejs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ success: false, error: 'Cloudinary غير مُعدّ (تأكد من متغيرات البيئة)' }, { status: 500 });
    }

    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ success: false, error: 'MongoDB غير مُعدّ (MONGODB_URI مفقود)' }, { status: 500 });
    }

    await connectDB();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;

    if (!file) {
      return NextResponse.json({ success: false, error: 'الملف مطلوب' }, { status: 400 });
    }

    if (!title || !category) {
      return NextResponse.json({ success: false, error: 'العنوان والتصنيف مطلوبين' }, { status: 400 });
    }

    // تحويل الملف إلى Buffer للرفع
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // الرفع إلى Cloudinary
    const uploadResponse: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: 'events_gallery' }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }).end(buffer);
    });

    // حفظ البيانات في MongoDB
    const newImage = await ImageModel.create({
      title,
      category,
      imageUrl: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
    });

    return NextResponse.json({ success: true, data: newImage }, { status: 201 });
  } catch (error) {
    console.error('upload_photo error:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ أثناء الرفع' }, { status: 500 });
  }
}