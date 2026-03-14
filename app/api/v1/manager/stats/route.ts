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

    const totalEmployees = await User.countDocuments({ role: 'employee' });
    const totalEvents = await Event.countDocuments({});
    const activeEvents = await Event.countDocuments({
      status: { $in: ['draft', 'scheduled', 'ongoing'] },
    });
    const totalGuests = await Guest.countDocuments({});
    const recentActivity = await ActivityLog.find({})
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
