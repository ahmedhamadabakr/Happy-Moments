import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { Event } from '@/lib/models/Event';
import { EventGuest } from '@/lib/models/EventGuest';
import ClientEventView from '@/components/client/ClientEventView';

interface PageProps {
  params: Promise<{ eventToken: string }>;
}

async function getEventData(token: string) {
  await connectDB();

  const event = await Event.findOne({ clientViewToken: token, deletedAt: null })
    .populate('companyId', 'name logo')
    .lean();

  if (!event) {
    return null;
  }

  // Get guest statistics
  const guests = await EventGuest.find({ eventId: event._id }).lean();

  const stats = {
    totalInvited: guests.length,
    accepted: guests.filter((g) => g.rsvpStatus === 'confirmed').length,
    declined: guests.filter((g) => g.rsvpStatus === 'declined').length,
    pending: guests.filter((g) => g.rsvpStatus === 'pending').length,
    checkedIn: guests.filter((g) => g.checkInStatus === 'checked_in').length,
  };

  // Get guest list with limited info
  const guestList = guests.map((g) => ({
    id: g._id.toString(),
    name: g.snapshotName,
    rsvpStatus: g.rsvpStatus,
    checkInStatus: g.checkInStatus,
    checkedInAt: g.checkedInAt,
    rsvpMessage: g.rsvpMessage,
  }));

  return {
    event: {
      id: event._id.toString(),
      title: event.title,
      description: event.description,
      eventDate: event.eventDate,
      eventTime: event.eventTime,
      location: event.location,
      locationUrl: event.locationUrl,
      status: event.status,
      company: event.companyId,
    },
    stats,
    guestList,
  };
}

export default async function ClientEventPage({ params }: PageProps) {
  const { eventToken } = await params;
  const data = await getEventData(eventToken);

  if (!data) {
    notFound();
  }

  return <ClientEventView data={data} eventToken={eventToken} />;
}

export const metadata = {
  title: 'Event View',
  description: 'Public event view',
};
