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

const GuestForm = ({
    eventId,
    guest,
    onFinished,
}: {
    eventId: string;
    guest?: Guest;
    onFinished: () => void;
}) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        companion: '', // <-- camelCase
        phone: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (guest) {
            setFormData({
                firstName: guest.firstName || '',
                lastName: guest.lastName || '',
                companion: guest.companion || '',
                phone: guest.phone || '',
            });
        } else {
            setFormData({ firstName: '', lastName: '', companion: '', phone: '' });
        }
    }, [guest]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const url = guest
                ? `/api/v1/events/${eventId}/guests/${guest._id}`
                : `/api/v1/events/${eventId}/guests`;

            const method = guest ? 'PATCH' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('حدث خطأ أثناء حفظ الضيف');

            onFinished();
        } catch (err: any) {
            alert(err.message || 'خطأ غير معروف');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{guest ? 'تعديل بيانات الضيف' : 'إضافة ضيف جديد'}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
                <Input
                    placeholder="الاسم الأول"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
                <Input
                    placeholder="اسم العائلة"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
                <Input
                    placeholder="عدد المرافقين"
                    type="number"
                    value={formData.companion}
                    onChange={(e) => setFormData({ ...formData, companion: e.target.value })}
                />
                <Input
                    placeholder="رقم الجوال"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <Button onClick={handleSubmit} className="w-full" disabled={loading}>
                    {loading ? 'جارٍ الحفظ...' : guest ? 'حفظ التعديلات' : 'إضافة ضيف'}
                </Button>
            </div>
        </DialogContent>
    );
};

export default function EventGuestsPage() {
    const params = useParams();
    const eventId = Array.isArray(params.id) ? params.id[0] : params.id;

    const [guests, setGuests] = useState<Guest[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedGuest, setSelectedGuest] = useState<Guest | undefined>();

    const { execute: fetchGuests, loading } = useApi(
        `/api/v1/events/${eventId}/guests`,
        {
            onSuccess: (data) => {
                setGuests(data.data || data.guests || []);
            },
        }
    );

    const { execute: deleteGuestApi } = useApi('', {
        method: 'DELETE',
        onSuccess: fetchGuests,
    });

    useEffect(() => {
        if (eventId) fetchGuests();
    }, [eventId]);

    const filteredGuests = useMemo(() => {
        const term = searchTerm.toLowerCase();

        return guests.filter((g) => {
            const name = g.snapshotName || `${g.firstName || ''} ${g.lastName || ''}`.trim();
            const phone = g.snapshotPhone || g.phone || '';
            const email = g.snapshotEmail || g.email || '';
            return `${name} ${phone} ${email}`.toLowerCase().includes(term);
        });
    }, [guests, searchTerm]);

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

    const rsvpStatusMap: {
        [key: string]: { text: string; icon: React.ElementType; color: string };
    } = {
        PENDING: {
            text: 'لم يرد',
            icon: HelpCircle,
            color: 'bg-yellow-100 text-yellow-800',
        },
        ATTENDING: {
            text: 'سيحضر',
            icon: CheckCircle,
            color: 'bg-green-100 text-green-800',
        },
        DECLINED: {
            text: 'لن يحضر',
            icon: XCircle,
            color: 'bg-red-100 text-red-800',
        },
    };

    return (
        <DashboardLayout>
            <Card className="border-slate-200 shadow-md rounded-3xl overflow-hidden bg-white">

                <CardHeader className="flex flex-row justify-between items-center p-6">

                    <div>
                        <CardTitle className="text-2xl font-bold">
                            إدارة الضيوف ({guests.length})
                        </CardTitle>
                        <CardDescription>
                            إضافة وتعديل الضيوف لفعاليتك
                        </CardDescription>
                    </div>

                    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                        <DialogTrigger asChild>
                            <Button
                                onClick={() => {
                                    setSelectedGuest(undefined);
                                    setIsFormOpen(true);
                                }}
                            >
                                <UserPlus className="ml-2 h-4 w-4" />
                                إضافة ضيف
                            </Button>
                        </DialogTrigger>

                        <GuestForm
                            eventId={eventId}
                            guest={selectedGuest}
                            onFinished={handleFormFinished}
                        />
                    </Dialog>

                </CardHeader>

                <CardContent className="p-6">

                    <div className="mb-4 relative">

                        <Input
                            placeholder="بحث بالاسم..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-10"
                        />

                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

                    </div>

                    <div className="border rounded-lg overflow-hidden">

                        <Table>

                            <TableHeader className="bg-slate-50">
                                <TableRow>

                                    <TableHead className="px-6 py-3 text-right font-semibold">
                                        الضيف
                                    </TableHead>

                                    <TableHead className="px-6 py-3 text-right font-semibold">
                                        حالة الدعوة
                                    </TableHead>

                                    <TableHead className="px-6 py-3 text-right font-semibold">
                                        الإجراءات
                                    </TableHead>

                                </TableRow>
                            </TableHeader>

                            <TableBody>

                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-10">
                                            جاري تحميل الضيوف...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredGuests.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-10">
                                            لا يوجد ضيوف
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredGuests.map((guest) => {

                                        const status =
                                            rsvpStatusMap[
                                            (guest.rsvpStatus || 'PENDING').toUpperCase()
                                            ] || rsvpStatusMap.PENDING;

                                        return (
                                            <TableRow
                                                key={guest._id}
                                                className="border-b hover:bg-slate-50"
                                            >

                                                <TableCell className="px-6 py-4">

                                                    <div className="font-bold text-slate-900">
                                                        {guest.snapshotName || `${guest.firstName || ''} ${guest.lastName || ''}`.trim()}
                                                    </div>

                                                    <div className="text-sm text-slate-500">
                                                        {guest.snapshotPhone || guest.phone}
                                                    </div>

                                                </TableCell>

                                                <TableCell className="px-6 py-4">

                                                    <Badge
                                                        className={`${status.color} flex items-center gap-1 w-fit`}
                                                    >
                                                        <status.icon className="h-3 w-3" />
                                                        <span>{status.text}</span>
                                                    </Badge>

                                                </TableCell>

                                                <TableCell className="px-6 py-4 flex gap-2">

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedGuest(guest);
                                                            setIsFormOpen(true);
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        تعديل
                                                    </Button>

                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeleteGuest(guest._id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        حذف
                                                    </Button>

                                                </TableCell>

                                            </TableRow>
                                        );
                                    })
                                )}

                            </TableBody>

                        </Table>

                    </div>

                </CardContent>

            </Card>
        </DashboardLayout>
    );
}