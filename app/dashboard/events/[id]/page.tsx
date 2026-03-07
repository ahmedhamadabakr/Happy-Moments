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
        PENDING: { text: 'لم يرد', icon: HelpCircle, color: 'bg-yellow-100 text-yellow-800' },
        ATTENDING: { text: 'سيحضر', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
        DECLINED: { text: 'لن يحضر', icon: XCircle, color: 'bg-red-100 text-red-800' },
    };

    return (
        <div className="border rounded-lg overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        <TableHead className="px-6 py-3 text-right font-semibold">الضيف</TableHead>
                        <TableHead className="px-6 py-3 text-right font-semibold">رقم الجوال</TableHead>
                        <TableHead className="px-6 py-3 text-right font-semibold">حالة الدعوة</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {guests.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center py-10">لم يتم العثور على ضيوف.</TableCell>
                        </TableRow>
                    ) : (
                        guests.map(guest => {
                            const status = rsvpStatusMap[(guest.rsvpStatus || 'PENDING').toUpperCase()] || rsvpStatusMap.PENDING;
                            return (
                                <TableRow key={guest._id} className="border-b hover:bg-slate-50">
                                    <TableCell className="px-6 py-4">
                                        <div className="font-bold text-slate-900">{guest.firstName} {guest.lastName}</div>
                                    </TableCell>
                                    <TableCell className="px-6 py-4">{guest.phone || '-'}</TableCell>
                                    <TableCell className="px-6 py-4">
                                        <Badge className={`${status.color} flex items-center gap-1 w-fit`}>
                                            <status.icon className="h-3 w-3" />
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
            <div className="flex items-center justify-center h-full">
                <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
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
                <Card className="bg-gradient-to-br from-slate-50 to-amber-50/20 rounded-3xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">{event.title}</h1>
                            <div className="flex items-center gap-4 text-slate-600 mt-2">
                                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-amber-500" /> {new Date(event.eventDate).toLocaleDateString('ar-SA', { dateStyle: 'long' })}</div>
                                {event.location && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-amber-500" /> {event.location}</div>}
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button variant="outline" onClick={() => router.push(`/dashboard/check-in/${eventId}`)}><QrCode className="ml-2 h-4 w-4"/> سكانر تسجيل الدخول</Button>
                            <Button variant="outline" onClick={() => alert('سيتم فتح رابط المشاركة قريباً')}><Share2 className="ml-2 h-4 w-4"/> مشاركة الفعالية</Button>
                            <Button onClick={() => setIsEditMode(!isEditMode)}>
                                {isEditMode ? <><X className="ml-2 h-4 w-4"/> إلغاء</> : <><Edit className="ml-2 h-4 w-4"/> تعديل</>}
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Edit Mode */}
                {isEditMode && (
                    <Card className="border-slate-200 shadow-md rounded-3xl">
                        <CardHeader>
                            <CardTitle>تعديل الفعالية</CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-4">
                            {/* يمكن إضافة حقول الإدخال هنا */}
                            <Button onClick={handleUpdate} disabled={updateLoading} loading={updateLoading}>حفظ التغييرات</Button>
                            <Button variant="ghost" onClick={() => setIsEditMode(false)}>إلغاء</Button>
                        </CardContent>
                    </Card>
                )}

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map(stat => (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
                                <stat.icon className="w-4 h-4 text-amber-500"/>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Tabs for Guests / Analytics */}
                <Tabs defaultValue="guests">
                    <div className="flex justify-between items-center">
                        <TabsList>
                            <TabsTrigger value="guests">الضيوف</TabsTrigger>
                            <TabsTrigger value="analytics">التحليلات</TabsTrigger>
                        </TabsList>
                        <div className="flex gap-2">
                             <Button variant="outline" onClick={() => router.push(`/dashboard/events/${eventId}/guests`)}><UserPlus className="ml-2 h-4 w-4"/> إضافة ضيوف</Button>
                             <Button onClick={() => router.push(`/dashboard/events/${eventId}/send-invitations`)}><Send className="ml-2 h-4 w-4"/> إرسال الدعوات</Button>
                        </div>
                    </div>
                    <TabsContent value="guests" className="mt-4">
                        <GuestList guests={guests} />
                    </TabsContent>
                    <TabsContent value="analytics" className="mt-4">
                        <EventAnalytics eventId={eventId} />
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}