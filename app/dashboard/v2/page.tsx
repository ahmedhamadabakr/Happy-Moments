'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/shared/Card';
import { StatsCard } from '@/components/shared/StatsCard';
import { DataTable, Column } from '@/components/shared/DataTable';
import { useApi } from '@/lib/hooks/useApi';

interface Event {
  _id: string;
  title: string;
  status: 'draft' | 'active' | 'closed';
  eventDate: string;
  guestCount: number;
  rsvpCount: number;
  checkedInCount: number;
}

export default function Dashboard() {
  const { user, company } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalGuests: 0,
    totalRsvp: 0,
  });

  const { execute: fetchCompanyAnalytics } = useApi('/api/v1/analytics/company');
  const { execute: fetchEvents } = useApi('/api/v1/events');

  useEffect(() => {
    const loadData = async () => {
      try {
        const analyticsData = await fetchCompanyAnalytics('GET');
        if (analyticsData) {
          setStats({
            totalEvents: analyticsData.totalEvents || 0,
            activeEvents: analyticsData.activeEvents || 0,
            totalGuests: analyticsData.totalGuests || 0,
            totalRsvp: analyticsData.totalRsvp || 0,
          });
        }

        const eventsData = await fetchEvents('GET');
        if (eventsData && Array.isArray(eventsData)) {
          setEvents(eventsData.slice(0, 10));
        }
      } catch (error) {
        console.error('Failed to load dashboard data');
      }
    };

    if (user && company) {
      loadData();
    }
  }, [user, company]);

  const eventColumns: Column<Event>[] = [
    { key: 'title', label: 'عنوان الفعالية' },
    {
      key: 'status',
      label: 'الحالة',
      render: (value) => {
        const statusText = {
          draft: 'مسودة',
          active: 'نشطة',
          closed: 'مغلقة',
        };
        return <span>{statusText[value as keyof typeof statusText] || value}</span>;
      },
    },
    { key: 'eventDate', label: 'التاريخ' },
    { key: 'guestCount', label: 'عدد الضيوف' },
    {
      key: 'rsvpCount',
      label: 'الرد على الدعوة',
      render: (value, row) => `${value} / ${row.guestCount}`,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
          <p className="text-gray-600 mt-1">مرحبا بك في منصة إدارة الفعاليات</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="إجمالي الفعاليات"
            value={stats.totalEvents}
            description="جميع الفعاليات"
          />
          <StatsCard
            title="الفعاليات النشطة"
            value={stats.activeEvents}
            description="حالياً"
          />
          <StatsCard
            title="إجمالي الضيوف"
            value={stats.totalGuests}
            description="في جميع الفعاليات"
          />
          <StatsCard
            title="الرد على الدعوات"
            value={stats.totalRsvp}
            description="تم الرد"
          />
        </div>

        {/* Recent Events */}
        <Card title="الفعاليات الأخيرة">
          <DataTable
            columns={eventColumns}
            data={events}
            emptyMessage="لا توجد فعاليات حتى الآن"
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
