import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { EventGuest } from '@/lib/models/EventGuest';
import { requirePermission } from '@/lib/middleware/permissions';
import { EmployeePermission } from '@/lib/types/roles';
import { createSuccessResponse } from '@/lib/api/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission(request, EmployeePermission.CHECKIN_VIEW);
    if (authResult instanceof NextResponse) return authResult;

    const { id: eventId } = await params;

    await connectDB();

    const [total, checkedIn] = await Promise.all([
      EventGuest.countDocuments({ eventId }),
      EventGuest.countDocuments({ eventId, checkInStatus: 'checked_in' }),
    ]);

    return NextResponse.json(
      createSuccessResponse({ total, checkedIn }),
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      createSuccessResponse({ total: 0, checkedIn: 0 }),
      { status: 200 }
    );
  }
}
