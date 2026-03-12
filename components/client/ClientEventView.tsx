'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Calendar, MapPin, Users, CheckCircle, XCircle, Clock, UserCheck, Sparkles, TrendingUp } from 'lucide-react';

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

  const statusLabels: Record<string, string> = {
    confirmed: 'مؤكد',
    declined: 'معتذر',
    pending: 'قيد الانتظار',
    maybe: 'ربما',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo2.png" alt="هابي مومنتس" width={120} height={40} className="object-contain" />
          </div>
          {data.event.company?.logo && (
            <img
              src={data.event.company.logo}
              alt={data.event.company.name}
              className="h-12 w-12 object-contain rounded-full border-2 border-slate-200"
            />
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#F08784]/10 text-[#F08784] px-5 py-2 rounded-full text-sm font-bold mb-4">
            <Sparkles size={18} />
            <span>متابعة حية</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            {data.event.title}
          </h1>
          {data.event.description && (
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {data.event.description}
            </p>
          )}
        </div>

        {/* Event Info Card */}
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-8 shadow-xl border border-slate-200 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-14 h-14 bg-gradient-to-br from-[#F08784] to-[#D97673] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Calendar className="text-white" size={28} />
              </div>
              <div>
                <div className="text-sm text-slate-600 font-medium mb-1">التاريخ</div>
                <div className="font-black text-slate-900 text-lg">
                  {new Date(data.event.eventDate).toLocaleDateString('ar-EG', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </div>
              </div>
            </div>

            {data.event.eventTime && (
              <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-14 h-14 bg-gradient-to-br from-[#F08784] to-[#D97673] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Clock className="text-white" size={28} />
                </div>
                <div>
                  <div className="text-sm text-slate-600 font-medium mb-1">الوقت</div>
                  <div className="font-black text-slate-900 text-lg">{data.event.eventTime}</div>
                </div>
              </div>
            )}

            {data.event.location && (
              <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm md:col-span-2">
                <div className="w-14 h-14 bg-gradient-to-br from-[#F08784] to-[#D97673] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <MapPin className="text-white" size={28} />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-slate-600 font-medium mb-1">الموقع</div>
                  {data.event.locationUrl ? (
                    <a
                      href={data.event.locationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-black text-[#F08784] hover:text-[#D97673] transition-colors text-lg"
                    >
                      {data.event.location}
                    </a>
                  ) : (
                    <div className="font-black text-slate-900 text-lg">{data.event.location}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <Users className="text-blue-600" size={28} />
              <div className="w-10 h-10 bg-blue-600/10 rounded-full flex items-center justify-center">
                <TrendingUp className="text-blue-600" size={18} />
              </div>
            </div>
            <div className="text-4xl font-black text-blue-900 mb-2">
              {liveStats.totalInvited}
            </div>
            <div className="text-sm font-bold text-blue-700">إجمالي المدعوين</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-6 border-2 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <CheckCircle className="text-green-600" size={28} />
              <div className="w-10 h-10 bg-green-600/10 rounded-full flex items-center justify-center">
                <span className="text-xs font-black text-green-600">{acceptanceRate}%</span>
              </div>
            </div>
            <div className="text-4xl font-black text-green-900 mb-2">
              {liveStats.accepted}
            </div>
            <div className="text-sm font-bold text-green-700">مؤكد الحضور</div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl p-6 border-2 border-red-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <XCircle className="text-red-600" size={28} />
            </div>
            <div className="text-4xl font-black text-red-900 mb-2">
              {liveStats.declined}
            </div>
            <div className="text-sm font-bold text-red-700">معتذر</div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-6 border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <Clock className="text-orange-600" size={28} />
            </div>
            <div className="text-4xl font-black text-orange-900 mb-2">
              {liveStats.pending}
            </div>
            <div className="text-sm font-bold text-orange-700">قيد الانتظار</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-6 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <UserCheck className="text-purple-600" size={28} />
              <div className="w-10 h-10 bg-purple-600/10 rounded-full flex items-center justify-center">
                <span className="text-xs font-black text-purple-600">{checkInRate}%</span>
              </div>
            </div>
            <div className="text-4xl font-black text-purple-900 mb-2">
              {liveStats.checkedIn}
            </div>
            <div className="text-sm font-bold text-purple-700">حضر فعلياً</div>
          </div>
        </div>

        {/* Guest List */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-10 bg-gradient-to-b from-[#F08784] to-[#D97673] rounded-full shadow-md"></div>
            <h2 className="text-3xl font-black text-slate-900">قائمة الضيوف</h2>
            <span className="bg-gradient-to-r from-[#F08784]/10 to-[#D97673]/10 text-[#F08784] px-5 py-2 rounded-full text-sm font-bold border border-[#F08784]/20">
              {liveGuests.length} ضيف
            </span>
          </div>

          <div className="space-y-3">
            {liveGuests.map((guest) => (
              <div
                key={guest.id}
                className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 hover:border-[#F08784]/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-black text-xl text-slate-900 mb-2">{guest.name}</div>
                    {guest.rsvpMessage && (
                      <div className="mt-3 p-4 bg-white rounded-xl border-2 border-slate-200 shadow-sm">
                        <div className="text-xs text-slate-500 font-bold mb-2">رسالة:</div>
                        <div className="text-sm text-slate-700 leading-relaxed">{guest.rsvpMessage}</div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`px-5 py-2.5 rounded-full text-sm font-black border-2 shadow-sm ${
                      guest.rsvpStatus === 'confirmed'
                        ? 'bg-green-50 text-green-700 border-green-300'
                        : guest.rsvpStatus === 'declined'
                        ? 'bg-red-50 text-red-700 border-red-300'
                        : 'bg-orange-50 text-orange-700 border-orange-300'
                    }`}>
                      {statusLabels[guest.rsvpStatus] || guest.rsvpStatus}
                    </span>
                    {guest.checkInStatus === 'checked_in' && (
                      <span className="px-5 py-2.5 rounded-full text-sm font-black bg-purple-50 text-purple-700 border-2 border-purple-300 shadow-sm">
                        ✓ حضر
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {liveGuests.length === 0 && (
              <div className="text-center py-16">
                <Users className="w-20 h-20 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-xl font-medium">لا يوجد ضيوف بعد</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 bg-white text-center text-slate-600 text-sm mt-12">
        <p>© {new Date().getFullYear()} هابي مومنتس. جميع الحقوق محفوظة - صنع بكل حب في الكويت 🇰🇼</p>
      </footer>
    </div>
  );
}
