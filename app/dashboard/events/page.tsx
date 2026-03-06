'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useApi } from '@/lib/hooks/useApi';
import { Event } from '@/lib/types';
import { PlusCircle, ArrowLeft } from 'lucide-react';

export default function EventsListPage() {
    const router = useRouter();
    const [events, setEvents] = useState<Event[]>([]);
    
    const { execute: fetchEvents, loading } = useApi(
        '/api/v1/events',
        {
            onSuccess: (data) => {
                setEvents(data.events || []);
            }
        }
    );

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    return (
        <DashboardLayout>
            <div dir="rtl" className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">الفعاليات</h1>
                        <p className="text-gray-600 mt-1">إدارة جميع فعالياتك في مكان واحد.</p>
                    </div>
                    <Button onClick={() => router.push('/dashboard/events/create')}>
                        <PlusCircle className="ml-2 h-4 w-4" />
                        إنشاء فعالية جديدة
                    </Button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                             <Card key={i} className="animate-pulse">
                                <CardHeader>
                                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full mt-2"></div>
                                </CardContent>
                             </Card>
                        ))}
                    </div>
                ) : events.length === 0 ? (
                    <Card className="text-center py-20">
                        <CardTitle>لم تقم بإنشاء أي فعاليات بعد</CardTitle>
                        <CardDescription className="mt-2">ابدأ بإنشاء فعاليتك الأولى.</CardDescription>
                        <Button className="mt-4" onClick={() => router.push('/dashboard/events/create')}>
                           إنشاء فعالية
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map(event => (
                            <Card key={event._id} className="hover:shadow-lg transition-shadow duration-300">
                                <CardHeader>
                                    <CardTitle className="truncate">{event.title}</CardTitle>
                                    <CardDescription>{new Date(event.eventDate).toLocaleDateString('ar-SA')}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 line-clamp-2">{event.description}</p>
                                    <div className="flex justify-between items-center mt-4">
                                       <span className="text-sm font-semibold">{event.status === 'active' ? 'نشطة' : (event.status === 'draft' ? 'مسودة' : 'مغلقة')}</span>
                                        <Link href={`/dashboard/events/${event._id}`} passHref>
                                            <Button variant="outline" size="sm">
                                                التفاصيل <ArrowLeft className="mr-2 h-4 w-4" />
                                            </Button>
                                        </Link>
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
