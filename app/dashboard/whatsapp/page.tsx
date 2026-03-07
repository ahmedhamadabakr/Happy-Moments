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
import { MessageCircle, Send, XCircle, Clock, Settings, Sparkles } from 'lucide-react';

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
    { 
      key: 'recipientPhone', 
      label: 'رقم الهاتف',
      render: (value) => (
        <span className="font-mono text-slate-700">{value}</span>
      )
    },
    { 
      key: 'messageText', 
      label: 'النص',
      render: (value) => (
        <span className="text-slate-600 line-clamp-2">{value}</span>
      )
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (value) => {
        const statusConfig = {
          pending: { text: 'قيد الانتظار', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
          sent: { text: 'تم الإرسال', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Send },
          failed: { text: 'فشل', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
        };
        const status = statusConfig[value as keyof typeof statusConfig] || statusConfig.pending;
        const Icon = status.icon;
        
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${status.color}`}>
            <Icon className="w-3 h-3" />
            {status.text}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'التاريخ',
      render: (value) => (
        <span className="text-slate-600 text-sm">
          {new Date(value).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </span>
      )
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8" dir="rtl">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-[#F08784]/5 via-white to-violet-50/30 rounded-3xl p-8 border border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#F08784]/10 rounded-2xl flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-[#F08784]" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-900">تكامل WhatsApp</h1>
                <p className="text-lg text-slate-600 mt-1">إدارة وإرسال رسائل WhatsApp للضيوف</p>
              </div>
            </div>
            <button
              onClick={() => setIsConfigOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[#F08784] text-white rounded-xl hover:bg-[#D97673] transition-all shadow-lg hover:shadow-xl font-bold"
            >
              <Settings className="w-5 h-5" />
              إعدادات الاتصال
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#F08784]/10 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-[#F08784]" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">{messages.length}</div>
            <div className="text-sm text-slate-600 font-medium">إجمالي الرسائل</div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Send className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-600 mb-1">
              {messages.filter(m => m.status === 'sent').length}
            </div>
            <div className="text-sm text-slate-600 font-medium">الرسائل المرسلة</div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-3xl font-black text-red-600 mb-1">
              {messages.filter(m => m.status === 'failed').length}
            </div>
            <div className="text-sm text-slate-600 font-medium">الرسائل الفاشلة</div>
          </div>
        </div>

        {/* Messages Table */}
        <div className="bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-[#F08784]/5 border-b border-slate-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F08784]/10 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#F08784]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">سجل الرسائل</h2>
                <p className="text-slate-600 text-sm">جميع رسائل WhatsApp المرسلة</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <DataTable
              columns={messageColumns}
              data={messages}
              emptyMessage="لا توجد رسائل"
            />
          </div>
        </div>
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
