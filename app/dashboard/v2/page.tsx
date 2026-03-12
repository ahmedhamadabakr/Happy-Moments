'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/shared/Card';
import { StatsCard } from '@/components/shared/StatsCard';
import { DataTable, Column } from '@/components/shared/DataTable';
import { useApi } from '@/lib/hooks/useApi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';


interface Event {
  _id: string;
  title: string;
  status: 'draft' | 'active' | 'closed';
  eventDate: string;
  guestCount: number;
  rsvpCount: number;
  checkedInCount: number;
}

// A simple debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}


export default function Dashboard() {
  const { toast } = useToast();
  const { user, company } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalGuests: 0,
    totalRsvp: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // State for delete confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);


  const { execute: fetchCompanyAnalytics } = useApi('/api/v1/analytics/company');
  const { execute: fetchEvents, loading: loadingEvents } = useApi('/api/v1/events');
  const { execute: deleteEvent } = useApi(`/api/v1/events`, { method: 'DELETE' });


  const loadEvents = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (debouncedSearchTerm) {
        queryParams.set('search', debouncedSearchTerm);
      }
      
      const eventsData = await fetchEvents(null, `/api/v1/events?${queryParams.toString()}`);
      if (eventsData && Array.isArray(eventsData.data)) {
        setEvents(eventsData.data);
      }
    } catch (error) {
      console.error('Failed to load events');
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل قائمة الفعاليات.',
        variant: 'destructive',
      })
    }
  };

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const analyticsData = await fetchCompanyAnalytics();
        if (analyticsData) {
          setStats({
            totalEvents: analyticsData.summary?.إجمالي_الفعاليات || 0,
            activeEvents: analyticsData.summary?.الفعاليات_النشطة || 0,
            totalGuests: analyticsData.summary?.إجمالي_الضيوف || 0,
            totalRsvp: analyticsData.summary?.إجمالي_الحضور || 0,
          });
        }
      } catch (error) {
        console.error('Failed to load dashboard analytics');
      }
    };

    if (user && company) {
      loadAnalytics();
    }
  }, [user, company]);


  useEffect(() => {
    if (user && company) {
      loadEvents();
    }
  }, [user, company, debouncedSearchTerm]);


  const handleDeleteClick = (event: Event) => {
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEvent) return;
    try {
      await deleteEvent(null, `/api/v1/events/${selectedEvent._id}`);
      toast({
        title: 'نجاح',
        description: `تم حذف فعالية "${selectedEvent.title}" بنجاح.`,
      });
      loadEvents(); // Refresh the list
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في حذف الفعالية.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedEvent(null);
    }
  };

  const eventColumns: Column<Event>[] = useMemo(() => [
    { key: 'title', label: 'عنوان الفعالية' },
    {
      key: 'status',
      label: 'الحالة',
      render: (value) => {
        const statusText = {
          draft: 'مسودة',
          active: 'نشطة',
          closed: 'مغلقة',
        };
        const statusClasses = {
          draft: 'bg-yellow-100 text-yellow-800',
          active: 'bg-green-100 text-green-800',
          closed: 'bg-gray-100 text-gray-800',
        }
        const a = value as keyof typeof statusText;
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[a]}`}>{statusText[a] || value}</span>;
      },
    },
    { key: 'eventDate', label: 'التاريخ', render: (value) => new Date(value).toLocaleDateString('ar-EG') },
    { key: 'guestCount', label: 'عدد الضيوف' },
    {
      key: 'rsvpCount',
      label: 'الرد على الدعوة',
      render: (value, row) => `${value} / ${row.guestCount}`,
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (_, row) => (
        <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(row)}>
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      ),
    }
  ], []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
          <p className="text-gray-600 mt-1">مرحبا بك في منصة إدارة الفعاليات</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="إجمالي الفعاليات"
            value={stats.totalEvents}
            description="جميع الفعاليات"
          />
          <StatsCard
            title="الفعاليات النشطة"
            value={stats.activeEvents}
            description="حالياً"
          />
          <StatsCard
            title="إجمالي الضيوف"
            value={stats.totalGuests}
            description="في جميع الفعاليات"
          />
          <StatsCard
            title="الرد على الدعوات"
            value={stats.totalRsvp}
            description="تم الرد"
          />
        </div>

        {/* Recent Events */}
        <Card title="الفعاليات الأخيرة">
          <div className="p-4">
              <Input
                placeholder="ابحث عن فعالية..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
          </div>
          <DataTable
            columns={eventColumns}
            data={events}
            loading={loadingEvents}
            emptyMessage="لا توجد فعاليات تطابق بحثك"
          />
        </Card>
      </div>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد تماماً؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف فعالية "{selectedEvent?.title}". هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              نعم، قم بالحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
