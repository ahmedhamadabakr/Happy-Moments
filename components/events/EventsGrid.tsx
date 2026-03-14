import { EventCard } from './EventCard';
import { Calendar, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Event } from '@/lib/types';

export const EventsGrid = ({ loading, events, limit, searchQuery, onClearSearch, ...props }: any) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-3xl" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
        <Calendar className="w-12 h-12 text-[#F08784] mx-auto mb-4" />
        <h3 className="text-xl font-bold">لا توجد فعاليات</h3>
        {searchQuery && (
          <Button onClick={onClearSearch} variant="link" className="text-[#F08784]">إلغاء البحث</Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event: Event) => (
        <EventCard key={event._id} event={event} {...props} />
      ))}
    </div>
  );
};