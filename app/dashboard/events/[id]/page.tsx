'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { StatsCard } from '@/components/shared/StatsCard';
import { FormInput } from '@/components/shared/FormInput';
import { useApi } from '@/lib/hooks/useApi';

interface Event {
  _id: string;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  status: 'draft' | 'active' | 'closed';
  guestCount: number;
  rsvpCount: number;
  checkedInCount: number;
}

export default function EventDetailsPage() {
  const params = useParams();
  const eventId = params.id as string;
  const { user, company } = useAuthStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    guestCount: 0,
    rsvpCount: 0,
    checkedInCount: 0,
    rsvpRate: 0,
  });

  const { execute: fetchEvent } = useApi(`/api/v1/events/${eventId}`);
  const { execute: fetchEventAnalytics } = useApi(
    `/api/v1/analytics/events/${eventId}`
  );
  const { execute: updateEvent } = useApi(`/api/v1/events/${eventId}`, {
    onSuccess: (data) => {
      setEvent(data);
      setIsEditMode(false);
    },
  });

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const eventData = await fetchEvent('GET');
        if (eventData) {
          setEvent(eventData);
          setFormData({
            title: eventData.title || '',
            description: eventData.description || '',
            eventDate: eventData.eventDate || '',
            location: eventData.location || '',
          });
        }

        const analyticsData = await fetchEventAnalytics('GET');
        if (analyticsData) {
          setStats({
            guestCount: analyticsData.guestCount || 0,
            rsvpCount: analyticsData.rsvpCount || 0,
            checkedInCount: analyticsData.checkedInCount || 0,
            rsvpRate: analyticsData.rsvpRate || 0,
          });
        }
      } catch (error) {
        console.error('Failed to load event');
      }
    };

    if (user && company && eventId) {
      loadEvent();
    }
  }, [user, company, eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateEvent('PUT', formData);
    } finally {
      setLoading(false);
    }
  };

  if (!event) {
    return (
      <DashboardLayout>
        <div className="text-center py-10">
          <p className="text-gray-500">جاري تحميل الفعالية...</p>
        </div>
      </DashboardLayout>
    );
  }

  const statusBg = {
    draft: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    closed: 'bg-red-100 text-red-800',
  };

  const statusLabel = {
    draft: 'مسودة',
    active: 'نشطة',
    closed: 'مغلقة',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
            <div className="flex gap-2 mt-2">
              <span
                className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                  statusBg[event.status as keyof typeof statusBg]
                }`}
              >
                {statusLabel[event.status as keyof typeof statusLabel]}
              </span>
            </div>
          </div>
          <Button onClick={() => setIsEditMode(!isEditMode)}>
            {isEditMode ? 'إلغاء' : 'تعديل'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="إجمالي الضيوف"
            value={stats.guestCount}
            description="تم دعوتهم"
          />
          <StatsCard
            title="الرد على الدعوة"
            value={stats.rsvpCount}
            description={`${stats.rsvpRate}% من الضيوف`}
          />
          <StatsCard
            title="الحاضرون فعلياً"
            value={stats.checkedInCount}
            description="تم تسجيلهم"
          />
          <StatsCard
            title="نسبة الحضور"
            value={`${stats.checkedInCount > 0 ? Math.round((stats.checkedInCount / stats.guestCount) * 100) : 0}%`}
            description="من إجمالي الضيوف"
          />
        </div>

        {/* Event Details */}
        <Card title="تفاصيل الفعالية">
          {isEditMode ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormInput
                label="اسم الفعالية"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  الوصف
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>
              <FormInput
                label="التاريخ والوقت"
                type="datetime-local"
                value={formData.eventDate}
                onChange={(e) =>
                  setFormData({ ...formData, eventDate: e.target.value })
                }
              />
              <FormInput
                label="المكان"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditMode(false)}
                >
                  إلغاء
                </Button>
                <Button type="submit" loading={loading}>
                  حفظ التغييرات
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">الوصف</p>
                <p className="text-gray-900 mt-1">{event.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">التاريخ والوقت</p>
                  <p className="text-gray-900 mt-1">
                    {new Date(event.eventDate).toLocaleString('ar-SA')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">المكان</p>
                  <p className="text-gray-900 mt-1">{event.location}</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Actions */}
        <Card>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary">إرسال الدعوات</Button>
            <Button variant="secondary">تحديث قائمة الضيوف</Button>
            <Button variant="secondary">إرسال تذكير</Button>
            {event.status !== 'closed' && (
              <Button variant="danger">إغلاق الفعالية</Button>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
