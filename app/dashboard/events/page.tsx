'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useApi } from '@/lib/hooks/useApi';
import { Event } from '@/lib/types';
import { PlusCircle, ArrowLeft, Calendar, Sparkles, Clock, Users, Eye, QrCode } from 'lucide-react';

export default function EventsListPage() {
    const router = useRouter();
    const [events, setEvents] = useState<Event[]>([]);
    
    const { execute: fetchEvents, loading } = useApi(
        '/api/v1/events',
        {
            onSuccess: (data) => {
                setEvents(data.data || data.events || []);
            }
        }
    );

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'draft': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'closed': return 'bg-slate-50 text-slate-700 border-slate-200';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'نشطة';
            case 'draft': return 'مسودة';
            case 'closed': return 'مغلقة';
            default: return 'غير محدد';
        }
    };

    return (
        <DashboardLayout>
            <div dir="rtl" className="space-y-8">
                {/* Header Section */}
                <div className="bg-gradient-to-br from-[#F08784]/5 via-white to-violet-50/30 rounded-3xl p-8 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-[#F08784]/10 rounded-2xl flex items-center justify-center">
                                <Calendar className="w-8 h-8 text-[#F08784]" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-slate-900">الفعاليات</h1>
                                <p className="text-lg text-slate-600 mt-1">إدارة جميع فعالياتك في مكان واحد</p>
                            </div>
                        </div>
                        <Button 
                            onClick={() => router.push('/dashboard/events/create')}
                            className="bg-[#F08784] hover:bg-[#D97673] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                        >
                            <PlusCircle className="ml-2 h-5 w-5" />
                            إنشاء فعالية جديدة
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                             <Card key={i} className="animate-pulse border-slate-200 rounded-3xl">
                                <CardHeader className="p-6">
                                    <div className="h-6 bg-slate-200 rounded-xl w-3/4"></div>
                                    <div className="h-4 bg-slate-200 rounded-lg w-1/2 mt-3"></div>
                                </CardHeader>
                                <CardContent className="p-6 pt-0">
                                    <div className="h-4 bg-slate-200 rounded-lg w-full"></div>
                                    <div className="h-4 bg-slate-200 rounded-lg w-full mt-2"></div>
                                    <div className="h-10 bg-slate-200 rounded-xl w-full mt-4"></div>
                                </CardContent>
                             </Card>
                        ))}
                    </div>
                ) : events.length === 0 ? (
                    <Card className="text-center py-20 border-slate-200 rounded-3xl bg-white shadow-md">
                        <CardContent className="p-12">
                            <div className="w-20 h-20 bg-[#F08784]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Calendar className="w-10 h-10 text-[#F08784]" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-slate-900 mb-3">لم تقم بإنشاء أي فعاليات بعد</CardTitle>
                            <CardDescription className="text-lg text-slate-600 mb-6">ابدأ بإنشاء فعاليتك الأولى وادعُ ضيوفك</CardDescription>
                            <Button 
                                className="bg-[#F08784] hover:bg-[#D97673] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all" 
                                onClick={() => router.push('/dashboard/events/create')}
                            >
                                <PlusCircle className="ml-2 h-5 w-5" />
                                إنشاء فعالية جديدة
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map(event => (
                            <Card key={event._id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-slate-200 rounded-3xl bg-white group">
                                <CardHeader className="p-6 pb-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <CardTitle className="text-xl font-bold text-slate-900 line-clamp-2 group-hover:text-[#F08784] transition-colors">
                                                {event.title}
                                            </CardTitle>
                                        </div>
                                        <div className="w-10 h-10 bg-[#F08784]/10 rounded-xl flex items-center justify-center ml-3 group-hover:bg-[#F08784]/20 transition-colors">
                                            <Sparkles className="w-5 h-5 text-[#F08784]" />
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-sm font-medium">
                                            {new Date(event.eventDate).toLocaleDateString('ar-SA', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </CardHeader>
                                
                                <CardContent className="p-6 pt-0">
                                    <p className="text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                                        {event.description || 'لا يوجد وصف للفعالية'}
                                    </p>
                                    
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(event.status)}`}>
                                            {getStatusText(event.status)}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link href={`/dashboard/events/${event._id}`} passHref className="flex-1">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                className="w-full border-slate-300 hover:border-[#F08784] hover:text-[#F08784] hover:bg-[#F08784]/5 rounded-xl font-semibold transition-all"
                                            >
                                                <Eye className="ml-2 h-4 w-4" />
                                                التفاصيل
                                            </Button>
                                        </Link>
                                        
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => router.push(`/dashboard/check-in/${event._id}`)}
                                            className="border-slate-300 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl font-semibold transition-all"
                                            title="تسجيل الحضور"
                                        >
                                            <QrCode className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
