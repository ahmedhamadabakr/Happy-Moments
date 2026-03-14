'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApi } from '@/lib/hooks/useApi';
import { IEvent } from '@/lib/models/Event';
import { PlusCircle, Calendar, Sparkles, Clock, Eye, QrCode, Search, Trash2, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from '@/components/shared/StatsCard';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// --- Components ---

const EventsGrid = ({ 
  loading, 
  events, 
  limit, 
  searchQuery, 
  onClearSearch,
  activeTab, 
  router, 
  onDelete 
}: { 
  loading: boolean, 
  events: IEvent[], 
  limit: number, 
  searchQuery: string, 
  onClearSearch: () => void,
  activeTab: string, 
  router: any, 
  onDelete: (eventId: string) => void 
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(limit)].map((_, i) => (
          <Card key={i} className="animate-pulse border-slate-200 rounded-3xl">
            <CardHeader className="p-6">
              <div className="h-6 bg-slate-200 rounded-xl w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded-lg w-1/2 mt-3"></div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="h-4 bg-slate-200 rounded-lg w-full mb-2"></div>
              <div className="h-4 bg-slate-200 rounded-lg w-2/3"></div>
              <div className="h-10 bg-slate-200 rounded-xl w-full mt-6"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
        <div className="w-20 h-20 bg-[#F08784]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Calendar className="w-10 h-10 text-[#F08784]" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-3">لا توجد فعاليات</h3>
        <p className="text-lg text-slate-600 mb-6 max-w-md mx-auto">
          {searchQuery 
            ? `لم نجد أي فعاليات تطابق بحثك عن "${searchQuery}"` 
            : `لا توجد فعاليات ${activeTab === 'active' ? 'نشطة' : 'منتهية'} في الوقت الحالي`}
        </p>
        {searchQuery && (
          <Button onClick={onClearSearch} variant="outline" className="rounded-xl border-[#F08784] text-[#F08784] hover:bg-[#F08784] hover:text-white">
            <XCircle className="ml-2 h-4 w-4" />
            إلغاء البحث
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event, idx) => {
        const eventDate = new Date(event.eventDate);
        const now = new Date();
        const isExpired = eventDate < now;
        const daysLeft = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const clientName = (event as any).clientId?.fullName;
        const eventId = (event as any)._id?.toString();

        return (
        <Card key={eventId || idx} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-slate-200 rounded-3xl bg-white group overflow-hidden">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <CardTitle className="text-xl font-bold text-slate-900 line-clamp-2 group-hover:text-[#F08784] transition-colors">
                  {event.title}
                </CardTitle>
                {clientName && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div className="w-4 h-4 rounded-full bg-[#F08784]/20 flex items-center justify-center">
                      <span className="text-[8px] text-[#F08784] font-black">ع</span>
                    </div>
                    <span className="text-sm text-[#F08784] font-semibold">{clientName}</span>
                  </div>
                )}
              </div>
              <div className="w-10 h-10 bg-[#F08784]/10 rounded-xl flex items-center justify-center mr-3 group-hover:bg-[#F08784]/20 transition-colors">
                <Sparkles className="w-5 h-5 text-[#F08784]" />
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                {eventDate.toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 pt-0">
            {/* حالة الدعوة */}
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl mb-4 text-sm font-bold ${
              isExpired 
                ? 'bg-slate-100 text-slate-600' 
                : daysLeft <= 3 
                  ? 'bg-orange-50 text-orange-600 border border-orange-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isExpired ? 'bg-slate-400' : daysLeft <= 3 ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`}></span>
              {isExpired 
                ? 'انتهت الفعالية' 
                : daysLeft === 0 
                  ? 'اليوم!' 
                  : daysLeft === 1 
                    ? 'غداً' 
                    : `باقي ${daysLeft} يوم`}
            </div>
    
            <div className="flex gap-2">
              <Link href={`/dashboard/events/${eventId}`} passHref className="flex-1">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full border-slate-200 hover:border-[#F08784] hover:text-[#F08784] hover:bg-[#F08784]/5 rounded-xl font-semibold transition-all"
                >
                  <Eye className="ml-2 h-4 w-4" />
                  التفاصيل
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push(`/dashboard/check-in/${eventId}`)}
                className="border-slate-200 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl font-semibold transition-all"
                title="تسجيل الحضور"
              >
                <QrCode className="h-4 w-4" />
              </Button>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDelete(eventId)}
                className="border-slate-200 hover:border-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl font-semibold transition-all"
                title="حذف الفعالية"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        );
      })}
    </div>
  );
};

// --- Main Page ---

export default function EventsListPage() {
  const router = useRouter();
  const [events, setEvents] = useState<IEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    pages: 1,
  });
  const [analytics, setAnalytics] = useState({ activeEvents: 0, endedEvents: 0 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  // 1. استخدام useMemo لبناء الرابط بشكل نظيف
  const apiEndpoint = useMemo(() => {
    const params = new URLSearchParams();
    params.append('page', pagination.page.toString());
    params.append('limit', pagination.limit.toString());
    params.append('status', activeTab);
    if (searchQuery.trim()) {
      params.append('search', searchQuery.trim());
    }
    return `/api/v1/events?${params.toString()}`;
  }, [pagination.page, pagination.limit, activeTab, searchQuery]);

  // 2. خطافات API
  const { execute: fetchEvents, loading } = useApi(
    apiEndpoint,
    {
      onSuccess: (data) => {
        setEvents(data.data || data.events || []);
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0,
          pages: data.pagination?.pages || 1,
          page: data.pagination?.page || 1
        }));
      }
    }
  );

  const { execute: fetchAnalytics } = useApi(
    '/api/v1/events/analytics',
    {
      onSuccess: (data) => setAnalytics(data.data)
    }
  );

  const { execute: deleteEvent } = useApi('', {
    method: 'DELETE',
    onSuccess: () => {
      fetchEvents();
      fetchAnalytics();
    }
  });

  // 3. معالجة الأحداث
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, searchQuery ? 500 : 0); // Debounce فقط عند البحث
    return () => clearTimeout(timer);
  }, [fetchEvents, apiEndpoint]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPagination(p => ({ ...p, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(p => ({ ...p, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <DashboardLayout>
      <div dir="rtl" className="space-y-8 pb-10">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-[#F08784]/10 via-white to-violet-50/50 rounded-3xl p-8 border border-slate-100 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#F08784] rounded-2xl flex items-center justify-center shadow-lg shadow-[#F08784]/20">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900">الفعاليات</h1>
                <p className="text-lg text-slate-500 mt-1">إدارة وتنظيم فعالياتك بذكاء</p>
              </div>
            </div>
            <Button 
              onClick={() => router.push('/dashboard/events/create')}
              className="w-full md:w-auto bg-[#F08784] hover:bg-[#D97673] text-white px-8 py-6 rounded-2xl font-bold shadow-lg shadow-[#F08784]/20 transition-all hover:scale-[1.02] active:scale-95 text-lg"
            >
              <PlusCircle className="ml-2 h-6 w-6" />
              إنشاء فعالية جديدة
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatsCard 
            title="الفعاليات النشطة"
            value={analytics.activeEvents}
            icon={<Calendar className="text-emerald-500" />}
            description="فعاليات قيد التنفيذ حالياً"
          />
          <StatsCard 
            title="الفعاليات المنتهية"
            value={analytics.endedEvents}
            icon={<Calendar className="text-rose-500" />}
            description="فعاليات مكتملة ومؤرشفة"
          />
        </div>

        {/* Filters & Content Section */}
        <Tabs value={activeTab} onValueChange={handleTabChange} dir="rtl">
          <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8">
                <div className="relative w-full lg:max-w-md">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="ابحث باسم الفعالية..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPagination(p => ({ ...p, page: 1 }));
                    }}
                    className="rounded-xl pr-12 pl-4 py-6 bg-slate-50 border-slate-200 focus:border-[#F08784] focus:ring-[#F08784] transition-all text-lg"
                  />
                </div>
                <TabsList className="bg-slate-100 p-1 rounded-xl h-auto w-full lg:w-auto">
                  <TabsTrigger value="active" className="flex-1 lg:flex-none text-base font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#F08784] data-[state=active]:shadow-sm px-8 py-3 transition-all">الفعاليات النشطة</TabsTrigger>
                  <TabsTrigger value="closed" className="flex-1 lg:flex-none text-base font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#F08784] data-[state=active]:shadow-sm px-8 py-3 transition-all">الفعاليات المنتهية</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value={activeTab} className="mt-0 outline-none">
                <EventsGrid 
                  loading={loading} 
                  events={events} 
                  limit={pagination.limit} 
                  searchQuery={searchQuery} 
                  onClearSearch={() => setSearchQuery('')}
                  activeTab={activeTab} 
                  router={router} 
                  onDelete={(id) => { setSelectedEvent(id); setDialogOpen(true); }}
                />
              </TabsContent>
              
              {/* Pagination */}
              {pagination.pages > 1 && !loading && (
                <div className="flex justify-center mt-10">
                  <Pagination>
                    <PaginationContent className="gap-2">
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#"
                          onClick={(e) => { e.preventDefault(); handlePageChange(pagination.page - 1); }}
                          className={`rounded-xl border-slate-200 ${pagination.page === 1 ? 'opacity-50 pointer-events-none' : 'hover:bg-slate-50'}`}
                        />
                      </PaginationItem>
                      
                      {[...Array(pagination.pages)].map((_, i) => (
                        <PaginationItem key={i} className="hidden sm:block">
                          <PaginationLink 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); handlePageChange(i + 1); }}
                            isActive={pagination.page === i + 1}
                            className={`rounded-xl ${pagination.page === i + 1 ? 'bg-[#F08784] border-[#F08784] text-white' : 'border-slate-200'}`}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext 
                          href="#" 
                          onClick={(e) => { e.preventDefault(); handlePageChange(pagination.page + 1); }}
                          className={`rounded-xl border-slate-200 ${pagination.page === pagination.pages ? 'opacity-50 pointer-events-none' : 'hover:bg-slate-50'}`}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </Tabs>

        {/* Delete Confirmation */}
        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialogContent className="rounded-3xl max-w-[400px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-bold text-center">هل أنت متأكد؟</AlertDialogTitle>
              <AlertDialogDescription className="text-center text-lg">
                سيتم حذف هذه الفعالية نهائياً مع كافة البيانات المتعلقة بها. هذا الإجراء لا يمكن التراجع عنه.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-3 mt-4">
              <AlertDialogCancel className="rounded-xl flex-1 py-6 font-bold border-slate-200">إلغاء</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  if (selectedEvent) deleteEvent(null, `/api/v1/events/${selectedEvent}`);
                  setDialogOpen(false);
                }}
                className="rounded-xl flex-1 py-6 font-bold bg-rose-500 hover:bg-rose-600 text-white"
              >
                تأكيد الحذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}