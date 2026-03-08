'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useApi } from '@/lib/hooks/useApi';
import { Guest, Event } from '@/lib/types';
import { Send, CheckCircle, XCircle } from 'lucide-react';

export default function SendInvitationsPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;

    const [event, setEvent] = useState<Event | null>(null);
    const [guests, setGuests] = useState<Guest[]>([]);
    const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([]);
    const [sendingProgress, setSendingProgress] = useState(0);
    const [jobId, setJobId] = useState<string | null>(null);

    const { execute: fetchData, loading: dataLoading } = useApi(
        `/api/v1/events/${eventId}`,
        { onSuccess: (data) => {
            setEvent(data.event);
            setGuests(data.guests || []);
            // Default to selecting guests who haven't received an invitation yet
            const uninvited = (data.guests || []).filter((g: Guest) => g.invitationStatus !== 'SENT').map((g: Guest) => g._id);
            setSelectedGuestIds(uninvited);
        } }
    );

    const { execute: sendInvitations, loading: sendingLoading, error: sendError, data: sendData } = useApi(
        `/api/v1/events/${eventId}/send-invitations`,
        { method: 'POST', onSuccess: (data) => setJobId(data.jobId) }
    );

    useEffect(() => {
        if (eventId) fetchData();
    }, [eventId, fetchData]);
    
    // Poll for job status
    useEffect(() => {
        if (!jobId) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/v1/jobs/${jobId}`);
                const data = await res.json();
                if(data.success) {
                    setSendingProgress(data.job.progress);
                    if (data.job.status === 'completed' || data.job.status === 'failed') {
                        clearInterval(interval);
                        fetchData(); // Refresh guest data to show updated statuses
                        setJobId(null);
                    }
                }
            } catch (e) {
                console.error(e);
                clearInterval(interval);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [jobId, fetchData]);

    const handleSelectAll = (checked: boolean) => {
        setSelectedGuestIds(checked ? guests.map(g => g._id) : []);
    };

    const handleSelectGuest = (guestId: string, checked: boolean) => {
        setSelectedGuestIds(prev => 
            checked ? [...prev, guestId] : prev.filter(id => id !== guestId)
        );
    };

    const handleSend = async () => {
        await sendInvitations({ guestIds: selectedGuestIds });
    };
    
    const allSelected = selectedGuestIds.length > 0 && selectedGuestIds.length === guests.length;

    return (
        <DashboardLayout>
            {/* Header */}
            <Card className="bg-gradient-to-br from-[#F08784]/5 via-white to-violet-50/30 rounded-3xl p-8 border-none shadow-lg mb-6">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#F08784] to-[#D97673] rounded-2xl flex items-center justify-center shadow-lg">
                        <Send className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">إرسال الدعوات</h1>
                        <p className="text-lg text-slate-600 mt-2 font-medium">اختر الضيوف الذين تود إرسال دعوات واتساب إليهم</p>
                    </div>
                </div>
            </Card>

            <Card className="border-slate-200 shadow-md rounded-3xl overflow-hidden bg-white">
                <CardHeader className="p-6 bg-gradient-to-r from-slate-50 to-white border-b">
                    <CardTitle className="text-2xl font-bold text-slate-900">قائمة الضيوف</CardTitle>
                    <CardDescription className="text-slate-600">حدد الضيوف لإرسال الدعوات</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    {(sendingLoading || jobId) && (
                        <div className="space-y-3 p-4 bg-[#F08784]/5 rounded-xl border border-[#F08784]/20">
                            <p className="font-semibold text-slate-900">جاري إرسال الدعوات... ({Math.round(sendingProgress)}%)</p>
                            <Progress value={sendingProgress} className="h-2" />
                        </div>
                    )}

                    {sendError && (
                        <Alert variant="destructive" className="border-red-200 bg-red-50">
                            <XCircle className="h-5 w-5" />
                            <AlertTitle className="font-bold">فشل الإرسال</AlertTitle>
                            <AlertDescription>{sendError.message}</AlertDescription>
                        </Alert>
                    )}

                    {sendData && !jobId && (
                         <Alert className="border-emerald-200 bg-emerald-50">
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                            <AlertTitle className="font-bold text-emerald-900">اكتمل الإرسال</AlertTitle>
                            <AlertDescription className="text-emerald-700">تم وضع طلبات الإرسال في قائمة الانتظار بنجاح.</AlertDescription>
                        </Alert>
                    )
                    }

                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="px-4 w-12">
                                        <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />
                                    </TableHead>
                                    <TableHead>الضيف</TableHead>
                                    <TableHead>حالة الدعوة</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dataLoading ? (
                                    <TableRow><TableCell colSpan={3} className="text-center py-10">جاري تحميل الضيوف...</TableCell></TableRow>
                                ) : guests.map(guest => (
                                    <TableRow key={guest._id}>
                                        <TableCell className="px-4">
                                            <Checkbox 
                                                checked={selectedGuestIds.includes(guest._id)} 
                                                onCheckedChange={(checked) => handleSelectGuest(guest._id, !!checked)}
                                            />
                                        </TableCell>
                                        <TableCell>{guest.name}</TableCell>
                                        <TableCell>{guest.invitationStatus === 'SENT' ? 'أرسلت' : 'لم ترسل'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="flex justify-end">
                        <Button 
                            onClick={handleSend} 
                            disabled={sendingLoading || jobId !== null || selectedGuestIds.length === 0} 
                            className="bg-[#F08784] hover:bg-[#D97673] text-white font-semibold shadow-md px-8"
                        >
                            <Send className="mr-2 h-5 w-5" /> إرسال لـ ({selectedGuestIds.length}) ضيف
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </DashboardLayout>
    );
}
