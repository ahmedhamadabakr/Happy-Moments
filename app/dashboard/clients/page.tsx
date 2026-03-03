'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { DataTable, Column } from '@/components/shared/DataTable';
import { Modal } from '@/components/shared/Modal';
import { FormInput } from '@/components/shared/FormInput';

interface ClientRow {
  _id: string;
  fullName: string;
  email?: string;
  phone?: string;
  accessToken?: string;
  createdAt?: string;
  createdBy?: {
    firstName?: string;
    lastName?: string;
  };
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [createdClientViewUrl, setCreatedClientViewUrl] = useState<string | null>(null);
  const [selectedClientUrl, setSelectedClientUrl] = useState<string | null>(null);
  const [isClientLinkModalOpen, setIsClientLinkModalOpen] = useState(false);

  const [isUploadContactsModalOpen, setIsUploadContactsModalOpen] = useState(false);
  const [uploadClient, setUploadClient] = useState<{ id: string; name: string } | null>(null);
  const [contactsFile, setContactsFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any | null>(null);

  async function loadClients() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/clients', { method: 'GET' });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'فشل في جلب العملاء');
      }
      setClients(json.clients || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطأ غير معروف');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  const columns: Column<ClientRow>[] = useMemo(
    () => [
      { key: 'fullName', label: 'اسم العميل' },
      {
        key: 'email',
        label: 'البريد الإلكتروني',
        render: (value) => value || '-',
      },
      {
        key: 'phone',
        label: 'رقم الهاتف',
        render: (value) => value || '-',
      },
      {
        key: 'createdBy',
        label: 'أنشئ بواسطة',
        render: (value) => {
          const name = `${value?.firstName || ''} ${value?.lastName || ''}`.trim();
          return name || '-';
        },
      },
      {
        key: 'createdAt',
        label: 'تاريخ الإنشاء',
        render: (value) => (value ? new Date(value).toLocaleDateString('ar-SA') : '-'),
      },
      {
        key: 'actions',
        label: 'إجراءات',
        render: (_value, row) => (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setError(null);
                setUploadResult(null);
                setContactsFile(null);
                setUploadClient({ id: row._id, name: row.fullName });
                setIsUploadContactsModalOpen(true);
              }}
            >
              رفع جهات اتصال
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  async function handleUploadContacts() {
    if (!uploadClient) return;
    if (!contactsFile) {
      setError('اختر ملف جهات الاتصال أولاً');
      return;
    }

    setLoading(true);
    setError(null);
    setUploadResult(null);

    try {
      const fd = new FormData();
      fd.append('contactsFile', contactsFile);

      const res = await fetch(`/api/v1/clients/${uploadClient.id}/contacts`, {
        method: 'POST',
        body: fd,
      });

      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'فشل في رفع جهات الاتصال');
      }

      setUploadResult(json);
      await loadClients();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطأ غير معروف');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateClient() {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'اسم العميل مطلوب';

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }

    setFormErrors({});
    setError(null);
    setCreatedClientViewUrl(null);

    setLoading(true);
    try {
      const res = await fetch('/api/v1/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'فشل في إنشاء العميل');
      }

      if (json?.clientViewUrl) {
        setCreatedClientViewUrl(json.clientViewUrl);
      }

      setIsModalOpen(false);
      setFormData({ fullName: '', email: '', phone: '' });

      await loadClients();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطأ غير معروف');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">العملاء</h1>
            <p className="mt-1 text-sm text-gray-600">إضافة عميل جديد وإنشاء رابط متابعة الردود</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>إضافة عميل</Button>
        </div>

        {createdClientViewUrl && (
          <Card>
            <div className="flex flex-col gap-3">
              <div className="text-sm text-gray-700">رابط صفحة العميل (شارك هذا الرابط مع العميل):</div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm break-all">
                  {createdClientViewUrl}
                </div>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(createdClientViewUrl);
                    } catch {
                      // ignore
                    }
                  }}
                >
                  نسخ الرابط
                </Button>
              </div>
            </div>
          </Card>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
        )}

        <Card title="قائمة العملاء">
          <DataTable
            columns={columns}
            data={clients}
            loading={loading}
            emptyMessage="لا يوجد عملاء"
            onRowClick={(row) => {
              if (!row.accessToken) {
                setError('لا يمكن إنشاء رابط للعميل (accessToken غير متوفر)');
                return;
              }

              const baseUrl = window.location.origin;
              const url = `${baseUrl}/client-view/${row.accessToken}`;
              setSelectedClientUrl(url);
              setIsClientLinkModalOpen(true);
            }}
          />
        </Card>

        <Modal
          isOpen={isClientLinkModalOpen}
          onClose={() => setIsClientLinkModalOpen(false)}
          title="رابط صفحة العميل"
          actions={
            <>
              <Button variant="secondary" onClick={() => setIsClientLinkModalOpen(false)}>
                إغلاق
              </Button>
              {selectedClientUrl && (
                <>
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(selectedClientUrl);
                      } catch {
                        // ignore
                      }
                    }}
                  >
                    نسخ الرابط
                  </Button>
                  <Button
                    onClick={() => {
                      window.open(selectedClientUrl, '_blank');
                    }}
                  >
                    فتح
                  </Button>
                </>
              )}
            </>
          }
        >
          <div className="space-y-3">
            <div className="text-sm text-gray-700">شارك هذا الرابط مع العميل لمراجعة ردود الدعوات:</div>
            <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm break-all">
              {selectedClientUrl || '-'}
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={isUploadContactsModalOpen}
          onClose={() => setIsUploadContactsModalOpen(false)}
          title={uploadClient ? `رفع جهات الاتصال: ${uploadClient.name}` : 'رفع جهات الاتصال'}
          actions={
            <>
              <Button variant="secondary" onClick={() => setIsUploadContactsModalOpen(false)}>
                إغلاق
              </Button>
              <Button onClick={handleUploadContacts} loading={loading}>
                رفع
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="text-sm text-gray-700">
              ارفع ملف Excel/CSV يحتوي على أعمدة مثل: Name/اسم و Phone/رقم (و Email اختياري).
            </div>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setContactsFile(file);
              }}
            />

            {uploadResult?.stats && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 space-y-1">
                <div>تمت المعالجة: {uploadResult.stats.total}</div>
                <div>صالح: {uploadResult.stats.valid}</div>
                <div>تم الإنشاء: {uploadResult.stats.created}</div>
                <div>تم التحديث: {uploadResult.stats.updated}</div>
                <div>تم التخطي: {uploadResult.stats.skipped}</div>
                <div>أخطاء: {uploadResult.stats.errors}</div>
              </div>
            )}

            {Array.isArray(uploadResult?.errors) && uploadResult.errors.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <div className="font-semibold mb-2">بعض السطور لم يتم إضافتها:</div>
                <div className="space-y-1">
                  {uploadResult.errors.slice(0, 10).map((er: any, idx: number) => (
                    <div key={idx}>
                      {er.name} - {er.phone}: {er.error}
                    </div>
                  ))}
                </div>
                {uploadResult.errors.length > 10 && (
                  <div className="mt-2">... والباقي {uploadResult.errors.length - 10} سطر</div>
                )}
              </div>
            )}
          </div>
        </Modal>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="إضافة عميل"
          actions={
            <>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleCreateClient} loading={loading}>
                حفظ
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <FormInput
              label="اسم العميل"
              value={formData.fullName}
              onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
              error={formErrors.fullName}
              placeholder="مثال: أحمد محمد"
            />
            <FormInput
              label="البريد الإلكتروني (اختياري)"
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              placeholder="example@email.com"
            />
            <FormInput
              label="رقم الهاتف (اختياري)"
              value={formData.phone}
              onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
              placeholder="+2010xxxxxxx"
            />
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
