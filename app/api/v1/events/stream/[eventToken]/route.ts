import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { Event } from '@/lib/models/Event';
import { EventGuest } from '@/lib/models/EventGuest';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventToken: string }> }
) {
  const { eventToken } = await params;

  await connectDB();

  const event = await Event.findOne({ clientViewToken: eventToken, deletedAt: null });

  if (!event) {
    return new Response('Event not found', { status: 404 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)
      );

      // Poll for updates every 5 seconds
      const interval = setInterval(async () => {
        try {
          const guests = await EventGuest.find({ eventId: event._id }).lean();

          const stats = {
            totalInvited: guests.length,
            accepted: guests.filter((g) => g.rsvpStatus === 'confirmed').length,
            declined: guests.filter((g) => g.rsvpStatus === 'declined').length,
            pending: guests.filter((g) => g.rsvpStatus === 'pending').length,
            checkedIn: guests.filter((g) => g.checkInStatus === 'checked_in').length,
          };

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'stats', data: stats })}\n\n`)
          );
        } catch (error) {
          console.error('SSE error:', error);
        }
      }, 5000);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
