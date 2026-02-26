'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { DataTable, Column } from '@/components/shared/DataTable';
import { Modal } from '@/components/shared/Modal';
import { useApi } from '@/lib/hooks/useApi';

interface Guest {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  rsvpStatus?: 'pending' | 'accepted' | 'declined';
  checkedIn?: boolean;
  checkedInAt?: string;
}

export default function GuestManagementPage() {
  const params = useParams();
  const eventId = params.id as string;
  const { user, company } = useAuthStore();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'declined' | 'checked'>('all');
  const [loading, setLoading] = useState(false);

  const { execute: fetchGuests } = useApi(
    `/api/v1/events/${eventId}/guests`
  );

  const { execute: updateGuestStatus } = useApi(
    `/api/v1/events/${eventId}/guests`,
    {
      onSuccess: (data) => {
        if (Array.isArray(data)) {
          setGuests(data);
        }
      },
    }
  );

  useEffect(() => {
    const loadGuests = async () => {
      try {
        const data = await fetchGuests('GET');
        if (Array.isArray(data)) {
          setGuests(data);
        }
      } catch (error) {
        console.error('Failed to load guests');
      }
    };

    if (user && company && eventId) {
      loadGuests();
    }
  }, [user, company, eventId]);

  const filteredGuests = guests.filter((guest) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'checked') return guest.checkedIn;
    return guest.rsvpStatus === filterStatus;
  });

  const stats = {
    total: guests.length,
    accepted: guests.filter((g) => g.rsvpStatus === 'accepted').length,
    declined: guests.filter((g) => g.rsvpStatus === 'declined').length,
    pending: guests.filter((g) => g.rsvpStatus === 'pending').length,
    checkedIn: guests.filter((g) => g.checkedIn).length,
  };

  const guestColumns: Column<Guest>[] = [
    {
      key: 'firstName',
      label: 'الاسم',
      render: (_, row) => `${row.firstName} ${row.lastName}`,
    },
    { key: 'email', label: 'البريد الإلكتروني' },
    { key: 'phone', label: 'رقم الهاتف' },
    {
      key: 'rsvpStatus',
      label: 'حالة الرد',
      render: (value) => {
        const statusText = {
          pending: 'قيد الانتظار',
          accepted: 'مقبول',
          declined: 'مرفوض',
        };
        return (
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
            value === 'accepted' ? 'bg-green-100 text-green-800' :
            value === 'declined' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {statusText[value as keyof typeof statusText] || 'unknown'}
          </span>
        );
      },
    },
    {
      key: 'checkedIn',
      label: 'الحضور',
      render: (value, row) => (
        <span className={value ? 'text-green-600' : 'text-gray-400'}>
          {value ? '✓ تم التسجيل' : 'لم يتم التسجيل'}
        </span>
      ),
    },
  ];

  const handleSendReminder = async () => {
    setLoading(true);
    try {
      // API call to send reminders
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Failed to send reminders');
    }
  };

  const handleExportCSV = () => {
    const csv = [
      ['الاسم الأول', 'الاسم الأخير', 'البريد الإلكتروني', 'الهاتف', 'حالة الرد', 'حاضر'],
      ...filteredGuests.map((g) => [
        g.firstName,
        g.lastName,
        g.email,
        g.phone,
        g.rsvpStatus || 'unknown',
        g.checkedIn ? 'نعم' : 'لا',
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guests-${eventId}.csv`;
    a.click();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">إدارة الضيوف</h1>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleExportCSV}>
              تحميل CSV
            </Button>
            <Button onClick={handleSendReminder} loading={loading}>
              إرسال تذكير
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600 mt-1">الإجمالي</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            <div className="text-sm text-gray-600 mt-1">مقبول</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600 mt-1">قيد الانتظار</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.declined}</div>
            <div className="text-sm text-gray-600 mt-1">مرفوض</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.checkedIn}</div>
            <div className="text-sm text-gray-600 mt-1">حاضر</div>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {(['all', 'pending', 'accepted', 'declined', 'checked'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                filterStatus === status
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {status === 'all' ? 'الكل' :
               status === 'pending' ? 'قيد الانتظار' :
               status === 'accepted' ? 'مقبول' :
               status === 'declined' ? 'مرفوض' :
               'حاضر'}
            </button>
          ))}
        </div>

        {/* Guests Table */}
        <Card>
          <DataTable
            columns={guestColumns}
            data={filteredGuests}
            onRowClick={(guest) => {
              setSelectedGuest(guest);
              setIsDetailModalOpen(true);
            }}
            emptyMessage="لا توجد ضيوف"
          />
        </Card>
      </div>

      {/* Guest Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="تفاصيل الضيف"
      >
        {selectedGuest && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">الاسم الكامل</p>
              <p className="font-medium text-gray-900">
                {selectedGuest.firstName} {selectedGuest.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">البريد الإلكتروني</p>
              <p className="font-medium text-gray-900">{selectedGuest.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">رقم الهاتف</p>
              <p className="font-medium text-gray-900">{selectedGuest.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">حالة الرد</p>
              <p className="font-medium text-gray-900">
                {selectedGuest.rsvpStatus === 'accepted' ? 'مقبول' :
                 selectedGuest.rsvpStatus === 'declined' ? 'مرفوض' :
                 'قيد الانتظار'}
              </p>
            </div>
            {selectedGuest.checkedIn && (
              <div>
                <p className="text-sm text-gray-600">وقت التسجيل</p>
                <p className="font-medium text-gray-900">
                  {selectedGuest.checkedInAt ? new Date(selectedGuest.checkedInAt).toLocaleString('ar-SA') : '-'}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
