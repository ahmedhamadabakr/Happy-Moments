'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useApi } from '@/lib/hooks/useApi';
import { Guest } from '@/lib/types';
import { UserPlus, Edit, Trash2, Search, CheckCircle, XCircle, HelpCircle } from 'lucide-react';

const GuestForm = ({ eventId, guest, onFinished }: { eventId: string, guest?: Guest, onFinished: () => void }) => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

    useEffect(() => {
        if (guest) {
            setFormData({ name: guest.name, email: guest.email, phone: guest.phone || '' });
        } else {
            setFormData({ name: '', email: '', phone: '' });
        }
    }, [guest]);

    const { execute: saveGuest, loading } = useApi(
        guest?._id ? `/api/v1/events/${eventId}/guests/${guest._id}` : `/api/v1/events/${eventId}/guests`,
        {
            method: guest?._id ? 'PATCH' : 'POST',
            onSuccess: onFinished,
        }
    );

    const handleSubmit = async () => {
        await saveGuest(formData);
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{guest ? 'تعديل بيانات الضيف' : 'إضافة ضيف جديد'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <Input placeholder="الاسم الكامل" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <Input placeholder="البريد الإلكتروني" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                <Input placeholder="رقم الجوال (اختياري)" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                <Button onClick={handleSubmit} disabled={loading} loading={loading} className="w-full">{guest ? 'حفظ التعديلات' : 'إضافة ضيف'}</Button>
            </div>
        </DialogContent>
    );
};

export default function EventGuestsPage() {
    const params = useParams();
    const eventId = params.id as string;

    const [guests, setGuests] = useState<Guest[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedGuest, setSelectedGuest] = useState<Guest | undefined>(undefined);

    const { execute: fetchGuests, loading } = useApi(
        `/api/v1/events/${eventId}/guests`,
        { onSuccess: (data) => setGuests(data.guests || []) }
    );

    const { execute: deleteGuestApi } = useApi('', { method: 'DELETE', onSuccess: fetchGuests });

    useEffect(() => {
        if (eventId) fetchGuests();
    }, [eventId, fetchGuests]);

    const filteredGuests = useMemo(() => guests.filter(g => 
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.email.toLowerCase().includes(searchTerm.toLowerCase())
    ), [guests, searchTerm]);

    const handleFormFinished = () => {
        setIsFormOpen(false);
        setSelectedGuest(undefined);
        fetchGuests();
    };
    
    const handleDeleteGuest = (guestId: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الضيف؟')) {
            deleteGuestApi(null, `/api/v1/events/${eventId}/guests/${guestId}`);
        }
    };

    const rsvpStatusMap: { [key: string]: { text: string; icon: React.ElementType; color: string } } = {
        PENDING: { text: 'لم يرد', icon: HelpCircle, color: 'bg-yellow-100 text-yellow-800' },
        ATTENDING: { text: 'سيحضر', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
        DECLINED: { text: 'لن يحضر', icon: XCircle, color: 'bg-red-100 text-red-800' },
    };

    return (
        <DashboardLayout>
            <Card className="border-slate-200 shadow-md rounded-3xl overflow-hidden bg-white">
                <CardHeader className="flex flex-row justify-between items-center p-6">
                    <div>
                        <CardTitle className="text-2xl font-bold">إدارة الضيوف ({guests.length})</CardTitle>
                        <CardDescription>إضافة وتعديل الضيوف لفعاليتك</CardDescription>
                    </div>
                    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                        <DialogTrigger asChild>
                             <Button onClick={() => { setSelectedGuest(undefined); setIsFormOpen(true); }}><UserPlus className="ml-2 h-4 w-4"/> إضافة ضيف</Button>
                        </DialogTrigger>
                        <GuestForm eventId={eventId} guest={selectedGuest} onFinished={handleFormFinished} />
                    </Dialog>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="mb-4 relative">
                        <Input placeholder="بحث بالاسم أو البريد الإلكتروني..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 h-10" />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="px-6 py-3 text-right font-semibold">الضيف</TableHead>
                                    <TableHead className="px-6 py-3 text-right font-semibold">حالة الدعوة</TableHead>
                                    <TableHead className="px-6 py-3 text-right font-semibold">الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={3} className="text-center py-10">جاري تحميل الضيوف...</TableCell></TableRow>
                                ) : filteredGuests.length === 0 ? (
                                    <TableRow><TableCell colSpan={3} className="text-center py-10">لم يتم العثور على ضيوف.</TableCell></TableRow>
                                ) : filteredGuests.map(guest => {
                                    const status = rsvpStatusMap[guest.rsvpStatus] || rsvpStatusMap.PENDING;
                                    return (
                                        <TableRow key={guest._id} className="border-b hover:bg-slate-50">
                                            <TableCell className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{guest.name}</div>
                                                <div className="text-sm text-slate-500">{guest.email}</div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <Badge className={`${status.color} flex items-center gap-1 w-fit`}>
                                                    <status.icon className="h-3 w-3" />
                                                    <span>{status.text}</span>
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => { setSelectedGuest(guest); setIsFormOpen(true); }}><Edit className="h-4 w-4 mr-1" /> تعديل</Button>
                                                <Button variant="destructive" size="sm" onClick={() => handleDeleteGuest(guest._id)}><Trash2 className="h-4 w-4 mr-1" /> حذف</Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </DashboardLayout>
    );
}
