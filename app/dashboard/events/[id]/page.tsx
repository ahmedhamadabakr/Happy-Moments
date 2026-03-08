'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar, MapPin, Users, CheckSquare, BarChart2, QrCode, Share2, Edit, X, UserPlus, Send, HelpCircle, CheckCircle, XCircle } from 'lucide-react';
import { Event, Guest } from '@/lib/types';
import { useApi } from '@/lib/hooks/useApi';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// Guests Table Component
const GuestList = ({ guests }: { guests: Guest[] }) => {
    const rsvpStatusMap: { [key: string]: { text: string; icon: React.ElementType; color: string } } = {
        PENDING: { text: 'لم يرد', icon: HelpCircle, color: 'bg-amber-50 text-amber-700 border border-amber-200' },
        ATTENDING: { text: 'سيحضر', icon: CheckCircle, color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
        DECLINED: { text: 'لن يحضر', icon: XCircle, color: 'bg-red-50 text-red-700 border border-red-200' },
    };

    return (
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-md">
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow className="border-b border-slate-200">
                        <TableHead className="px-6 py-4 text-right font-bold text-slate-900">الضيف</TableHead>
                        <TableHead className="px-6 py-4 text-right font-bold text-slate-900">رقم الجوال</TableHead>
                        <TableHead className="px-6 py-4 text-right font-bold text-slate-900">حالة الدعوة</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {guests.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center py-12 text-slate-500 text-lg">لم يتم العثور على ضيوف.</TableCell>
                        </TableRow>
                    ) : (
                        guests.map(guest => {
                            const status = rsvpStatusMap[(guest.rsvpStatus || 'PENDING').toUpperCase()] || rsvpStatusMap.PENDING;
                            return (
                                <TableRow key={guest._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <TableCell className="px-6 py-4">
                                        <div className="font-bold text-slate-900 text-base">{guest.firstName} {guest.lastName}</div>
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-slate-700 font-medium">{guest.phone || '-'}</TableCell>
                                    <TableCell className="px-6 py-4">
                                        <Badge className={`${status.color} flex items-center gap-2 w-fit px-3 py-1.5 font-semibold rounded-full`}>
                                            <status.icon className="h-4 w-4" />
                                            <span>{status.text}</span>
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

// Analytics Placeholder
const EventAnalytics = ({ eventId }: { eventId: string }) => (
    <Card>
        <CardHeader>
            <CardTitle>تحليلات الفعالية</CardTitle>
        </CardHeader>
        <CardContent>
            <p>سيتم عرض تحليلات الحضور والردود هنا.</p>
        </CardContent>
    </Card>
);

export default function EventDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = Array.isArray(params.id) ? params.id[0] : params.id;

    const [event, setEvent] = useState<Event | null>(null);
    const [guests, setGuests] = useState<Guest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState<Partial<Event>>({});

    const { execute: fetchEventData, loading: fetchLoading } = useApi(
        `/api/v1/events/${eventId}`,
        {
            onSuccess: (data) => {
                const eventData = data.event || data.data;
                setEvent(eventData);
                setGuests(data.guests || []);
                setFormData(eventData);
                setLoading(false);
            },
            onError: (err) => {
                setError(err.message || 'حدث خطأ غير متوقع');
                setLoading(false);
            }
        }
    );

    const { execute: updateEvent, loading: updateLoading } = useApi(
        `/api/v1/events/${eventId}`,
        {
            method: 'PATCH',
            onSuccess: (updatedEvent) => {
                setEvent(updatedEvent);
                setIsEditMode(false);
            },
            onError: (err) => setError(err.message || 'حدث خطأ غير متوقع')
        }
    );

    useEffect(() => {
        if (eventId) fetchEventData();
    }, [eventId]);

    const handleUpdate = async () => {
        await updateEvent(formData);
    };

    if (loading || fetchLoading) return (
        <DashboardLayout>
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#F08784] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">جاري التحميل...</p>
                </div>
            </div>
        </DashboardLayout>
    );

    if (error) return (
        <DashboardLayout>
            <Alert variant="destructive" className="m-4">
                <X className="h-4 w-4" />
                <AlertTitle>حدث خطأ</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        </DashboardLayout>
    );

    if (!event) return null;

    const stats = [
        { title: "الحالة", value: event.status, icon: CheckSquare },
        { title: "إجمالي الضيوف", value: guests.length, icon: Users },
        { title: "الردود على الدعوة", value: guests.filter(g => g.rsvpStatus === 'ATTENDING').length, icon: CheckSquare },
        { title: "نسبة الحضور المتوقع", value: `${guests.length > 0 ? Math.round((guests.filter(g => g.rsvpStatus === 'ATTENDING').length / guests.length) * 100) : 0}%`, icon: BarChart2 },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6" dir="rtl">
                {/* Header */}
                <Card className="bg-gradient-to-br from-[#F08784]/5 via-white to-violet-50/30 rounded-3xl p-8 border border-slate-100 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                        <div className="space-y-3">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{event.title}</h1>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-slate-700">
                                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                                    <Calendar className="w-5 h-5 text-[#F08784]" /> 
                                    <span className="font-medium">{new Date(event.eventDate).toLocaleDateString('ar-SA', { dateStyle: 'long' })}</span>
                                </div>
                                {event.location && (
                                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                                        <MapPin className="w-5 h-5 text-[#F08784]" /> 
                                        <span className="font-medium">{event.location}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button 
                                variant="outline" 
                                onClick={() => router.push(`/dashboard/check-in/${eventId}`)}
                                className="bg-white hover:bg-[#F08784]/5 border border-slate-300 hover:border-[#F08784] text-slate-900 font-semibold shadow-sm rounded-xl"
                            >
                                <QrCode className="ml-2 h-5 w-5 text-[#F08784]"/> سكانر تسجيل الدخول
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => alert('سيتم فتح رابط المشاركة قريباً')}
                                className="bg-white hover:bg-[#F08784]/5 border border-slate-300 hover:border-[#F08784] text-slate-900 font-semibold shadow-sm rounded-xl"
                            >
                                <Share2 className="ml-2 h-5 w-5 text-[#F08784]"/> مشاركة الفعالية
                            </Button>
                            <Button 
                                onClick={() => setIsEditMode(!isEditMode)}
                                className="bg-[#F08784] hover:bg-[#D97673] text-white font-semibold shadow-lg rounded-xl"
                            >
                                {isEditMode ? <><X className="ml-2 h-5 w-5"/> إلغاء</> : <><Edit className="ml-2 h-5 w-5"/> تعديل</>}
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Edit Mode */}
                {isEditMode && (
                    <Card className="border-2 border-[#F08784]/30 shadow-lg rounded-3xl bg-gradient-to-br from-white to-[#F08784]/5">
                        <CardHeader className="border-b border-[#F08784]/20 bg-[#F08784]/5">
                            <CardTitle className="text-2xl text-slate-900">تعديل الفعالية</CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-4 pt-6">
                            {/* يمكن إضافة حقول الإدخال هنا */}
                            <Button 
                                onClick={handleUpdate} 
                                disabled={updateLoading} 
                                loading={updateLoading}
                                className="bg-[#F08784] hover:bg-[#D97673] text-white font-semibold shadow-md rounded-xl"
                            >
                                حفظ التغييرات
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => setIsEditMode(false)}
                                className="border-2 border-slate-300 hover:bg-slate-50 font-semibold rounded-xl"
                            >
                                إلغاء
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map(stat => (
                        <Card key={stat.title} className="border-2 border-[#F08784]/20 hover:border-[#F08784]/40 transition-all hover:shadow-lg bg-gradient-to-br from-white to-[#F08784]/5 rounded-2xl">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-semibold text-slate-700">{stat.title}</CardTitle>
                                <div className="p-2 bg-[#F08784]/10 rounded-lg">
                                    <stat.icon className="w-5 h-5 text-[#F08784]"/>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Tabs for Guests / Analytics */}
                <Card className="border-2 border-[#F08784]/20 shadow-lg rounded-3xl overflow-hidden">
                    <Tabs defaultValue="guests">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-gradient-to-r from-[#F08784]/5 to-white border-b-2 border-[#F08784]/20">
                            <TabsList className="bg-white border-2 border-[#F08784]/30 shadow-sm rounded-xl">
                                <TabsTrigger value="guests" className="data-[state=active]:bg-[#F08784] data-[state=active]:text-white font-semibold rounded-lg">الضيوف</TabsTrigger>
                                <TabsTrigger value="analytics" className="data-[state=active]:bg-[#F08784] data-[state=active]:text-white font-semibold rounded-lg">التحليلات</TabsTrigger>
                            </TabsList>
                            <div className="flex flex-wrap gap-2">
                                <Button 
                                    variant="outline" 
                                    onClick={() => router.push(`/dashboard/events/${eventId}/guests`)}
                                    className="bg-white hover:bg-[#F08784]/5 border-2 border-[#F08784]/30 hover:border-[#F08784] font-semibold rounded-xl"
                                >
                                    <UserPlus className="ml-2 h-5 w-5 text-[#F08784]"/> إضافة ضيوف
                                </Button>
                                <Button 
                                    onClick={() => router.push(`/dashboard/events/${eventId}/send-invitations`)}
                                    className="bg-[#F08784] hover:bg-[#D97673] text-white font-semibold shadow-md rounded-xl"
                                >
                                    <Send className="ml-2 h-5 w-5"/> إرسال الدعوات
                                </Button>
                            </div>
                        </div>
                        <TabsContent value="guests" className="p-6">
                            <GuestList guests={guests} />
                        </TabsContent>
                        <TabsContent value="analytics" className="p-6">
                            <EventAnalytics eventId={eventId} />
                        </TabsContent>
                    </Tabs>
                </Card>
            </div>
        </DashboardLayout>
    );
}