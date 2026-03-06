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
            <Card className="border-slate-200 shadow-md rounded-3xl overflow-hidden bg-white">
                <CardHeader className="p-6">
                    <CardTitle className="text-2xl font-bold">إرسال الدعوات</CardTitle>
                    <CardDescription>اختر الضيوف الذين تود إرسال دعوات واتساب إليهم.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    {(sendingLoading || jobId) && (
                        <div className="space-y-2">
                            <p>جاري إرسال الدعوات... ({Math.round(sendingProgress)}%)</p>
                            <Progress value={sendingProgress} />
                        </div>
                    )}

                    {sendError && (
                        <Alert variant="destructive">
                            <XCircle className="h-4 w-4" />
                            <AlertTitle>فشل الإرسال</AlertTitle>
                            <AlertDescription>{sendError.message}</AlertDescription>
                        </Alert>
                    )}

                    {sendData && !jobId && (
                         <Alert variant="success">
                            <CheckCircle className="h-4 w-4" />
                            <AlertTitle>اكتمل الإرسال</AlertTitle>
                            <AlertDescription>تم وضع طلبات الإرسال في قائمة الانتظار بنجاح.</AlertDescription>
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
                        <Button onClick={handleSend} disabled={sendingLoading || jobId !== null || selectedGuestIds.length === 0} loading={sendingLoading}>
                            <Send className="mr-2 h-4 w-4" /> إرسال لـ ({selectedGuestIds.length}) ضيف
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </DashboardLayout>
    );
}
