import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { requireManager } from '@/lib/middleware/permissions';
import { ActivityLog } from '@/lib/models/ActivityLog';

/**
 * GET /api/v1/manager/stats
 * الحصول على إحصائيات لوحة تحكم المدير
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireManager(request);
    if (session instanceof NextResponse) return session;

    await connectDB();

    // استيراد الموديلات بشكل ديناميكي لتجنب مشاكل الاستيراد الدائري
    const { Event } = await import('@/lib/models/Event');
    const { EventGuest: Guest } = await import('@/lib/models/EventGuest');

    // عدد الموظفين
    const totalEmployees = await User.countDocuments({
      company: session.user.companyId,
    });

    // عدد الفعاليات
    const totalEvents = await Event.countDocuments({
      company: session.user.companyId,
    });

    // عدد الفعاليات النشطة
    const activeEvents = await Event.countDocuments({
      company: session.user.companyId,
      status: { $in: ['draft', 'scheduled', 'ongoing'] },
    });

    // عدد الضيوف
    const totalGuests = await Guest.countDocuments({
      company: session.user.companyId,
    });

    // النشاط الأخير
    const recentActivity = await ActivityLog.find({
      companyId: session.user.companyId,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'firstName lastName')
      .lean();

    return NextResponse.json({
      success: true,
      stats: {
        totalEmployees,
        totalEvents,
        activeEvents,
        totalGuests,
        recentActivity,
      },
    });
  } catch (error: any) {
    console.error('Error fetching manager stats:', error);
    return NextResponse.json(
      { error: 'فشل في جلب الإحصائيات' },
      { status: 500 }
    );
  }
}
