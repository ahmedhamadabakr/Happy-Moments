'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Users, CheckCircle, XCircle, Clock, UserCheck } from 'lucide-react';
import { format } from 'date-fns';

interface ClientEventViewProps {
  data: {
    event: {
      id: string;
      title: string;
      description?: string;
      eventDate: Date;
      eventTime?: string;
      location?: string;
      locationUrl?: string;
      status: string;
      company: any;
    };
    stats: {
      totalInvited: number;
      accepted: number;
      declined: number;
      pending: number;
      checkedIn: number;
    };
    guestList: Array<{
      id: string;
      name: string;
      rsvpStatus: string;
      checkInStatus: string;
      checkedInAt?: Date;
      rsvpMessage?: string;
    }>;
  };
  eventToken: string;
}

export default function ClientEventView({ data, eventToken }: ClientEventViewProps) {
  const [liveStats, setLiveStats] = useState(data.stats);
  const [liveGuests, setLiveGuests] = useState(data.guestList);

  // Setup SSE for real-time updates
  useEffect(() => {
    const eventSource = new EventSource(`/api/v1/events/stream/${eventToken}`);

    eventSource.onmessage = (event) => {
      const update = JSON.parse(event.data);
      
      if (update.type === 'stats') {
        setLiveStats(update.data);
      } else if (update.type === 'guest_update') {
        setLiveGuests((prev) =>
          prev.map((g) => (g.id === update.data.id ? { ...g, ...update.data } : g))
        );
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [eventToken]);

  const acceptanceRate = liveStats.totalInvited > 0
    ? ((liveStats.accepted / liveStats.totalInvited) * 100).toFixed(1)
    : '0';

  const checkInRate = liveStats.totalInvited > 0
    ? ((liveStats.checkedIn / liveStats.totalInvited) * 100).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl">{data.event.title}</CardTitle>
                {data.event.description && (
                  <p className="text-slate-600 mt-2">{data.event.description}</p>
                )}
              </div>
              {data.event.company?.logo && (
                <img
                  src={data.event.company.logo}
                  alt={data.event.company.name}
                  className="h-16 w-16 object-contain"
                />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-slate-700">
              <Calendar className="h-5 w-5" />
              <span>
                {format(new Date(data.event.eventDate), 'EEEE, MMMM d, yyyy')}
                {data.event.eventTime && ` at ${data.event.eventTime}`}
              </span>
            </div>
            {data.event.location && (
              <div className="flex items-center gap-2 text-slate-700">
                <MapPin className="h-5 w-5" />
                {data.event.locationUrl ? (
                  <a
                    href={data.event.locationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {data.event.location}
                  </a>
                ) : (
                  <span>{data.event.location}</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Invited</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold">{liveStats.totalInvited}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Accepted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold">{liveStats.accepted}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{acceptanceRate}% acceptance rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Declined</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="text-2xl font-bold">{liveStats.declined}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <span className="text-2xl font-bold">{liveStats.pending}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Checked In</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-purple-600" />
                <span className="text-2xl font-bold">{liveStats.checkedIn}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{checkInRate}% attendance</p>
            </CardContent>
          </Card>
        </div>

        {/* Guest List */}
        <Card>
          <CardHeader>
            <CardTitle>Guest List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {liveGuests.map((guest) => (
                <div
                  key={guest.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{guest.name}</p>
                    {guest.rsvpMessage && (
                      <p className="text-sm text-slate-600 mt-1">{guest.rsvpMessage}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        guest.rsvpStatus === 'confirmed'
                          ? 'bg-green-100 text-green-700'
                          : guest.rsvpStatus === 'declined'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {guest.rsvpStatus}
                    </span>
                    {guest.checkInStatus === 'checked_in' && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        Checked In
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
