'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { DataTable, Column } from '@/components/shared/DataTable';
import { Modal } from '@/components/shared/Modal';
import { FormInput } from '@/components/shared/FormInput';
import { useApi } from '@/lib/hooks/useApi';

interface WhatsAppMessage {
  _id: string;
  eventId: string;
  recipientPhone: string;
  messageText: string;
  status: 'pending' | 'sent' | 'failed';
  createdAt: string;
}

export default function WhatsAppPage() {
  const { user, company } = useAuthStore();
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [config, setConfig] = useState({
    accountSid: '',
    authToken: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);

  const { execute: fetchMessages } = useApi(
    '/api/v1/whatsapp/messages'
  );

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const data = await fetchMessages('GET');
        if (Array.isArray(data)) {
          setMessages(data);
        }
      } catch (error) {
        console.error('Failed to load messages');
      }
    };

    if (user && company) {
      loadMessages();
    }
  }, [user, company]);

  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      // API call to save WhatsApp config would go here
      setIsConfigOpen(false);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Failed to save config');
    }
  };

  const messageColumns: Column<WhatsAppMessage>[] = [
    { key: 'recipientPhone', label: 'رقم الهاتف' },
    { key: 'messageText', label: 'النص' },
    {
      key: 'status',
      label: 'الحالة',
      render: (value) => {
        const statusText = {
          pending: 'قيد الانتظار',
          sent: 'تم الإرسال',
          failed: 'فشل',
        };
        return (
          <span className={
            value === 'sent' ? 'text-green-600' :
            value === 'failed' ? 'text-red-600' :
            'text-yellow-600'
          }>
            {statusText[value as keyof typeof statusText] || value}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'التاريخ',
      render: (value) => new Date(value).toLocaleDateString('ar-SA'),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">تكامل WhatsApp</h1>
          <Button onClick={() => setIsConfigOpen(true)}>إعدادات الاتصال</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="إجمالي الرسائل">
            <div className="text-3xl font-bold text-gray-900">{messages.length}</div>
          </Card>
          <Card title="الرسائل المرسلة">
            <div className="text-3xl font-bold text-green-600">
              {messages.filter(m => m.status === 'sent').length}
            </div>
          </Card>
          <Card title="الرسائل الفاشلة">
            <div className="text-3xl font-bold text-red-600">
              {messages.filter(m => m.status === 'failed').length}
            </div>
          </Card>
        </div>

        <Card title="سجل الرسائل">
          <DataTable
            columns={messageColumns}
            data={messages}
            emptyMessage="لا توجد رسائل"
          />
        </Card>
      </div>

      <Modal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        title="إعدادات Twilio WhatsApp"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => setIsConfigOpen(false)}
            >
              إلغاء
            </Button>
            <Button onClick={handleSaveConfig} loading={loading}>
              حفظ
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput
            label="Account SID"
            value={config.accountSid}
            onChange={(e) =>
              setConfig({ ...config, accountSid: e.target.value })
            }
            helperText="من لوحة التحكم Twilio"
          />
          <FormInput
            label="Auth Token"
            type="password"
            value={config.authToken}
            onChange={(e) =>
              setConfig({ ...config, authToken: e.target.value })
            }
            helperText="من لوحة التحكم Twilio"
          />
          <FormInput
            label="رقم WhatsApp"
            value={config.phoneNumber}
            onChange={(e) =>
              setConfig({ ...config, phoneNumber: e.target.value })
            }
            helperText="رقم Twilio WhatsApp الخاص بك"
          />
        </div>
      </Modal>
    </DashboardLayout>
  );
}
