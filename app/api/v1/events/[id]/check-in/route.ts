import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { EventGuest } from '@/lib/models/EventGuest';
import { CheckInLog } from '@/lib/models/CheckInLog';
import { requirePermission } from '@/lib/middleware/permissions';
import { EmployeePermission } from '@/lib/types/roles';
import { createErrorResponse, createSuccessResponse } from '@/lib/api/errors';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requirePermission(request, EmployeePermission.CHECKIN_SCAN);
    if (authResult instanceof NextResponse) return authResult;

    const { id: eventId } = await params;
    const body = await request.json();
    const { qrToken, scanMethod = 'qr' } = body;

    if (!qrToken) {
      return NextResponse.json(
        createErrorResponse(400, 'QR token is required', 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    await connectDB();

    // Find guest by QR token
    const guest = await EventGuest.findOne({
      eventId,
      qrToken,
    });

    if (!guest) {
      return NextResponse.json(
        createErrorResponse(404, 'Guest not found', 'GUEST_NOT_FOUND'),
        { status: 404 }
      );
    }

    const now = new Date();
    const isFirstScan = guest.checkInStatus !== 'checked_in';

    // Update guest check-in status
    guest.checkInStatus = 'checked_in';
    guest.scanCount += 1;

    if (isFirstScan) {
      guest.firstCheckInAt = now;
      guest.checkedInAt = now;
    }
    guest.lastCheckInAt = now;

    await guest.save();

    // Create check-in log
    await CheckInLog.create({
      event: eventId,
      guest: guest._id,
      scannedBy: authResult.user.userId,
      scannedAt: now,
      scanType: isFirstScan ? 'first' : 'repeated',
      scanMethod,
    });

    return NextResponse.json(
      createSuccessResponse({
        guestId: guest._id,
        guestName: guest.snapshotName,
        scanType: isFirstScan ? 'first' : 'repeated',
        scanCount: guest.scanCount,
        checkedInAt: guest.checkedInAt,
      }, 'Check-in successful'),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      createErrorResponse(500, 'Internal server error', 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
}
