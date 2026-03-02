import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import ImageModel from '@/models/Image';

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;

    const images = await ImageModel.find(filter).sort({ createdAt: -1 }).lean();

    const grouped = images.reduce<Record<string, any[]>>((acc, img: any) => {
      const key = img.category || 'uncategorized';
      if (!acc[key]) acc[key] = [];
      acc[key].push(img);
      return acc;
    }, {});

    return NextResponse.json({ success: true, data: { images, grouped } }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'حدث خطأ أثناء جلب الصور' }, { status: 500 });
  }
}
