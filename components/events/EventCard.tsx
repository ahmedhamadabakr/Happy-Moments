import { Event } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Sparkles, Eye, QrCode, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface EventCardProps {
  event: Event;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  onDelete: (id: string) => void;
  onCheckIn: (id: string) => void;
}

export const EventCard = ({ event, getStatusColor, getStatusText, onDelete, onCheckIn }: EventCardProps) => (
  <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-slate-200 rounded-3xl bg-white group overflow-hidden">
    <CardHeader className="p-6 pb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <CardTitle className="text-xl font-bold text-slate-900 line-clamp-2 group-hover:text-[#F08784] transition-colors">
            {event.title}
          </CardTitle>
        </div>
        <div className="w-10 h-10 bg-[#F08784]/10 rounded-xl flex items-center justify-center mr-3 group-hover:bg-[#F08784]/20 transition-colors">
          <Sparkles className="w-5 h-5 text-[#F08784]" />
        </div>
      </div>
      <div className="flex items-center gap-2 text-slate-500">
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium">
          {new Date(event.eventDate).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>
    </CardHeader>
    <CardContent className="p-6 pt-0">
      <p className="text-slate-600 line-clamp-2 mb-6 leading-relaxed min-h-[3rem]">
        {event.description || 'لا يوجد وصف للفعالية'}
      </p>
      <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border mb-4 ${getStatusColor(event.status)}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current ml-2 animate-pulse" />
        {getStatusText(event.status)}
      </div>
      <div className="flex gap-2">
        <Link href={`/dashboard/events/${event._id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full border-slate-200 rounded-xl font-semibold">
            <Eye className="ml-2 h-4 w-4" /> التفاصيل
          </Button>
        </Link>
        <Button variant="outline" size="sm" onClick={() => onCheckIn(event._id)} className="border-slate-200 hover:border-emerald-500 rounded-xl">
          <QrCode className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onDelete(event._id)} className="border-slate-200 hover:border-rose-500 rounded-xl">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
);