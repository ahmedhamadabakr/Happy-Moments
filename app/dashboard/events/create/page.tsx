'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { FormInput } from '@/components/shared/FormInput';

interface ClientOption {
  _id: string;
  fullName: string;
}

export default function CreateEventFromClientPage() {
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [invitationImage, setInvitationImage] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    description: '',
    eventDate: '',
    eventTime: '',
    location: '',
    locationUrl: '',
    qrX: '50',
    qrY: '50',
    qrWidth: '150',
    qrHeight: '150',
  });

  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [createdStats, setCreatedStats] = useState<any | null>(null);

  const isReadyToCreate = useMemo(() => {
    return Boolean(formData.clientId && formData.title && formData.eventDate && invitationImage);
  }, [formData.clientId, formData.title, formData.eventDate, invitationImage]);

  async function loadClients() {
    setError(null);
    try {
      const res = await fetch('/api/v1/clients', { method: 'GET' });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'فشل في جلب العملاء');
      }
      setClients((json.clients || []).map((c: any) => ({ _id: c._id, fullName: c.fullName })));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطأ غير معروف');
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  async function handleCreateEvent() {
    if (!isReadyToCreate || !invitationImage) return;

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    setCreatedEventId(null);
    setCreatedStats(null);

    try {
      const fd = new FormData();
      fd.append('clientId', formData.clientId);
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('eventDate', formData.eventDate);
      fd.append('eventTime', formData.eventTime);
      fd.append('location', formData.location);
      fd.append('locationUrl', formData.locationUrl);
      fd.append('qrX', formData.qrX);
      fd.append('qrY', formData.qrY);
      fd.append('qrWidth', formData.qrWidth);
      fd.append('qrHeight', formData.qrHeight);
      fd.append('invitationImage', invitationImage);

      const res = await fetch('/api/v1/events/create-from-client', {
        method: 'POST',
        body: fd,
      });

      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'فشل في إنشاء الفعالية');
      }

      setCreatedEventId(json?.event?.id?.toString?.() || json?.event?.id || null);
      setCreatedStats(json?.stats || null);
      setSuccessMessage(json?.message || 'تم إنشاء الفعالية بنجاح');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطأ غير معروف');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendInvitations() {
    if (!createdEventId) return;

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/v1/events/${createdEventId}/send-invitations`, {
        method: 'POST',
      });
      const json = await res.json();

      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'فشل في إرسال الدعوات');
      }

      setSuccessMessage(json?.message || 'تم إرسال الدعوات بنجاح');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطأ غير معروف');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إنشاء فعالية (من جهات اتصال العميل)</h1>
          <p className="mt-1 text-sm text-gray-600">
            سيتم إنشاء دعوة لكل شخص في شيت العميل مع QR مميز، ثم يمكنك إرسالها عبر واتساب.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
        )}
        {successMessage && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">{successMessage}</div>
        )}

        <Card title="بيانات الفعالية">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">العميل</label>
              <select
                className="h-10 rounded-lg border border-gray-300 px-3 text-sm"
                value={formData.clientId}
                onChange={(e) => setFormData((p) => ({ ...p, clientId: e.target.value }))}
              >
                <option value="">اختر عميل</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.fullName}
                  </option>
                ))}
              </select>
              <div className="text-xs text-gray-500">تأكد أنك رفعت جهات الاتصال لهذا العميل من صفحة العملاء.</div>
            </div>

            <FormInput
              label="عنوان الفعالية"
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              placeholder="مثال: حفل زفاف"
            />

            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">الوصف (اختياري)</label>
              <textarea
                className="min-h-24 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="وصف مختصر للفعالية..."
              />
            </div>

            <FormInput
              label="تاريخ الفعالية"
              type="date"
              value={formData.eventDate}
              onChange={(e) => setFormData((p) => ({ ...p, eventDate: e.target.value }))}
            />

            <FormInput
              label="وقت الفعالية (اختياري)"
              value={formData.eventTime}
              onChange={(e) => setFormData((p) => ({ ...p, eventTime: e.target.value }))}
              placeholder="مثال: 08:00 PM"
            />

            <FormInput
              label="المكان (اختياري)"
              value={formData.location}
              onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
              placeholder="اسم المكان"
            />

            <FormInput
              label="رابط الموقع الجغرافي (Google Maps)"
              value={formData.locationUrl}
              onChange={(e) => setFormData((p) => ({ ...p, locationUrl: e.target.value }))}
              placeholder="https://maps.google.com/..."
            />

            <div className="md:col-span-2">
              <div className="text-sm font-medium text-gray-700 mb-2">صورة الدعوة</div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setInvitationImage(e.target.files?.[0] || null)}
              />
              <div className="text-xs text-gray-500 mt-1">سيتم دمج QR لكل ضيف على هذه الصورة.</div>
            </div>
          </div>
        </Card>

        <Card title="مكان QR على الصورة (اختياري)">
          <div className="grid gap-4 md:grid-cols-4">
            <FormInput
              label="X"
              value={formData.qrX}
              onChange={(e) => setFormData((p) => ({ ...p, qrX: e.target.value }))}
            />
            <FormInput
              label="Y"
              value={formData.qrY}
              onChange={(e) => setFormData((p) => ({ ...p, qrY: e.target.value }))}
            />
            <FormInput
              label="Width"
              value={formData.qrWidth}
              onChange={(e) => setFormData((p) => ({ ...p, qrWidth: e.target.value }))}
            />
            <FormInput
              label="Height"
              value={formData.qrHeight}
              onChange={(e) => setFormData((p) => ({ ...p, qrHeight: e.target.value }))}
            />
          </div>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            onClick={handleCreateEvent}
            disabled={!isReadyToCreate || loading}
            loading={loading}
          >
            إنشاء الفعالية وتوليد الدعوات
          </Button>

          <Button
            variant="secondary"
            onClick={handleSendInvitations}
            disabled={!createdEventId || loading}
            loading={loading}
          >
            إرسال دعوات واتساب
          </Button>
        </div>

        {createdEventId && (
          <Card title="نتائج الإنشاء">
            <div className="space-y-2 text-sm text-gray-700">
              <div>Event ID: {createdEventId}</div>
              {createdStats && (
                <>
                  <div>إجمالي جهات الاتصال: {createdStats.totalContacts}</div>
                  <div>تم إنشاء ضيوف: {createdStats.guestsCreated}</div>
                  <div>أخطاء: {createdStats.errors}</div>
                </>
              )}
              <div className="text-xs text-gray-500">
                بعد الإرسال: كل ضيف سيرى صفحة RSVP ويمكنه قبول/رفض، والعميل يرى الردود من صفحة العميل.
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
