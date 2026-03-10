'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
  Calendar,
  MapPin,
  Users,
  CheckSquare,
  BarChart2,
  QrCode,
  Share2,
  Edit,
  X,
  UserPlus,
  Send
} from 'lucide-react';

import { Event, Guest } from '@/lib/types';
import { useApi } from '@/lib/hooks/useApi';

import { Input } from '@/components/ui/input';

import GuestList from '@/components/events/GuestList';
import EventAnalytics from '@/components/events/EventAnalytics';
import EventEditForm from '@/components/events/EventEditForm';

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
      onSuccess: (res) => {

        const updated = res.data || res;

        setEvent(updated);
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

  if (loading || fetchLoading)
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p>جاري التحميل...</p>
        </div>
      </DashboardLayout>
    );

  if (error)
    return (
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
    {
      title: "الردود على الدعوة",
      value: guests.filter(g => g.rsvpStatus === 'ATTENDING').length,
      icon: CheckSquare
    },
    {
      title: "نسبة الحضور المتوقع",
      value: `${guests.length > 0
        ? Math.round((guests.filter(g => g.rsvpStatus === 'ATTENDING').length / guests.length) * 100)
        : 0}%`,
      icon: BarChart2
    },
  ];

  return (
    <DashboardLayout>

      <div className="space-y-6" dir="rtl">

        {/* Header */}

        <Card className="p-6">

          <div className="flex justify-between">

            <div>

              <h1 className="text-3xl font-bold">
                {event.title}
              </h1>

              <div className="flex gap-4 mt-2 text-slate-600">

                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  {new Date(event.eventDate).toLocaleDateString('ar-SA')}
                </div>

                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    {event.location}
                  </div>
                )}

              </div>

            </div>

            <Button
              onClick={() => setIsEditMode(!isEditMode)}
            >
              {isEditMode ? (
                <>
                  <X className="ml-2" />
                  إلغاء
                </>
              ) : (
                <>
                  <Edit className="ml-2" />
                  تعديل
                </>
              )}
            </Button>

          </div>

        </Card>

        {/* Edit Mode */}

        {isEditMode && (

         <EventEditForm
  formData={formData}
  setFormData={setFormData}
  onSave={handleUpdate}
  onCancel={() => setIsEditMode(false)}
  loading={updateLoading}
/>

        )}

        {/* Stats */}

        <div className="grid md:grid-cols-4 gap-4">

          {stats.map(stat => (

            <Card key={stat.title} className="p-4">

              <div className="text-sm text-gray-500">
                {stat.title}
              </div>

              <div className="text-2xl font-bold">
                {stat.value}
              </div>

            </Card>

          ))}

        </div>

        {/* Tabs */}

        <Card>

          <Tabs defaultValue="guests">

            <div className="flex justify-between p-4">

              <TabsList>
                <TabsTrigger value="guests">الضيوف</TabsTrigger>
                <TabsTrigger value="analytics">التحليلات</TabsTrigger>
              </TabsList>

              <div className="flex gap-2">

                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(`/dashboard/events/${eventId}/guests`)
                  }
                >
                  <UserPlus className="ml-2" />
                  إضافة ضيوف
                </Button>

                <Button
                  onClick={() =>
                    router.push(`/dashboard/events/${eventId}/send-invitations`)
                  }
                >
                  <Send className="ml-2" />
                  إرسال الدعوات
                </Button>

              </div>

            </div>

            <TabsContent value="guests">
              <GuestList guests={guests} />
            </TabsContent>

            <TabsContent value="analytics">
              <EventAnalytics eventId={eventId} />
            </TabsContent>

          </Tabs>

        </Card>

      </div>

    </DashboardLayout>
  );
}