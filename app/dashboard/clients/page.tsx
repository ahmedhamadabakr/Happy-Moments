'use client';

import { useEffect, useMemo, useState } from 'react';
import { Users, UserPlus, Upload, Link as LinkIcon, ExternalLink, Copy, FileSpreadsheet, AlertCircle, CheckCircle2, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DataTable, Column } from '@/components/shared/DataTable';
import { Modal } from '@/components/shared/Modal';
import { Int32 } from 'mongoose';

interface ClientRow {
  _id: string;
  firstName: string;
  lastName: string;
  suffix?: string;
  companion?: number;
  fullName?: string;
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

  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredClients = clients.filter(client => {
    const fullName = `${client.firstName || ''} ${client.lastName || ''}`.trim();
    return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm);
  });

  const columns: Column<ClientRow>[] = useMemo(
    () => [
      { 
        key: 'firstName', 
        label: 'الاسم الأول',
        render: (value) => value || '-',
      },
      { 
        key: 'lastName', 
        label: 'اسم العائلة',
        render: (value) => value || '-',
      },
      {
        key: 'suffix',
        label: 'اللقب',
        render: (value) => value || '-',
      },
      {
        key: 'phone',
        label: 'رقم الهاتف',
        render: (value) => value || '-',
      },
      {
        key: 'companion',
        label: 'عدد المرافقين',
        render: (value) => value !== undefined ? value : '-',
      },
      {
        key: 'email',
        label: 'البريد الإلكتروني',
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                setError(null);
                setUploadResult(null);
                setContactsFile(null);
                const clientName = `${row.firstName || ''} ${row.lastName || ''}`.trim();
                setUploadClient({ id: row._id, name: clientName });
                setIsUploadContactsModalOpen(true);
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#F08784]/10 text-[#F08784] rounded-xl hover:bg-[#F08784]/20 transition-colors text-sm font-medium"
            >
              <Upload className="w-4 h-4" />
              رفع جهات اتصال
            </button>
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
      <div className="space-y-8" dir="rtl">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-[#F08784]/5 via-white to-violet-50/30 rounded-3xl p-8 border border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#F08784]/10 rounded-2xl flex items-center justify-center">
                <Users className="w-8 h-8 text-[#F08784]" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-900">إدارة العملاء</h1>
                <p className="text-lg text-slate-600 mt-1">إضافة عملاء جدد ومتابعة روابط الدعوات</p>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[#F08784] text-white rounded-xl hover:bg-[#D97673] transition-all shadow-lg hover:shadow-xl font-bold"
            >
              <UserPlus className="w-5 h-5" />
              إضافة عميل جديد
            </button>
          </div>
        </div>

        {createdClientViewUrl && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-emerald-800">تم إنشاء العميل بنجاح!</h3>
            </div>
            <p className="text-sm text-emerald-700 mb-3">رابط صفحة العميل (شارك هذا الرابط مع العميل لمتابعة الردود):</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex-1 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-mono text-slate-600 break-all shadow-inner">
                {createdClientViewUrl}
              </div>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(createdClientViewUrl);
                  } catch {
                    // ignore
                  }
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <Copy className="w-4 h-4" />
                نسخ
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-4 flex items-center gap-3 text-red-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Search & Table */}
        <div className="bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold text-slate-900">قائمة العملاء</h2>
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="بحث باسم العميل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-9 pl-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#F08784] focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="p-2">
            <DataTable
              columns={columns}
              data={filteredClients}
              loading={loading}
              emptyMessage="لا يوجد عملاء مطابقين للبحث"
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
          </div>
        </div>
      </div>

      <Modal
        isOpen={isClientLinkModalOpen}
        onClose={() => setIsClientLinkModalOpen(false)}
        title="رابط صفحة العميل"
        actions={
          <div className="flex gap-2 w-full">
            <button
              onClick={() => setIsClientLinkModalOpen(false)}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              إغلاق
            </button>
            {selectedClientUrl && (
              <>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(selectedClientUrl);
                    } catch {
                      // ignore
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-[#C1A286] text-white rounded-lg hover:bg-[#a08060] transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  نسخ الرابط
                </button>
                <button
                  onClick={() => {
                    window.open(selectedClientUrl, '_blank');
                  }}
                  className="px-4 py-2 bg-[#1A2E26] text-white rounded-lg hover:bg-[#2a4a3d] transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  فتح
                </button>
              </>
            )}
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <div className="flex items-center gap-3 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm">
            <LinkIcon className="w-5 h-5 flex-shrink-0" />
            شارك هذا الرابط مع العميل ليتمكن من متابعة الردود والحضور بشكل مباشر.
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-mono text-gray-600 break-all">
            {selectedClientUrl || '-'}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isUploadContactsModalOpen}
        onClose={() => setIsUploadContactsModalOpen(false)}
        title={uploadClient ? `رفع جهات الاتصال: ${uploadClient.name}` : 'رفع جهات الاتصال'}
        actions={
          <div className="flex gap-3 w-full">
            <button
              onClick={() => setIsUploadContactsModalOpen(false)}
              className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-semibold border-2 border-slate-200"
            >
              إغلاق
            </button>
            <button
              onClick={handleUploadContacts}
              disabled={loading}
              className={`flex-1 px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-bold shadow-md flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Upload className="w-5 h-5" />}
              رفع الملف
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-5 rounded-xl border-2 border-blue-200 shadow-sm">
            <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2 text-base">
              <FileSpreadsheet className="w-5 h-5" />
              تنسيق الملف المطلوب
            </h4>
            <p className="text-sm text-blue-800 mb-4 font-medium">
              يرجى التأكد من أن ملف Excel يحتوي على الأعمدة التالية (بنفس الأسماء بالضبط):
            </p>
            <div className="overflow-x-auto rounded-xl border-2 border-blue-300 mb-4 shadow-sm">
              <table className="w-full text-sm text-right bg-white">
                <thead className="bg-gradient-to-r from-blue-200 to-blue-100 text-blue-900 font-bold">
                  <tr>
                    <th className="p-3 border-b-2 border-blue-200">firstName</th>
                    <th className="p-3 border-b-2 border-blue-200">lastName</th>
                    <th className="p-3 border-b-2 border-blue-200">suffix</th>
                    <th className="p-3 border-b-2 border-blue-200">phone</th>
                    <th className="p-3 border-b-2 border-blue-200">companion</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 font-medium">
                  <tr className="border-b border-blue-50 hover:bg-blue-50/50">
                    <td className="p-3">منــال</td>
                    <td className="p-3">الشمري</td>
                    <td className="p-3">المكرمة</td>
                    <td className="p-3" dir="ltr">60288122</td>
                    <td className="p-3">0</td>
                  </tr>
                  <tr className="hover:bg-blue-50/50">
                    <td className="p-3">وردة</td>
                    <td className="p-3">العلي</td>
                    <td className="p-3">المكرمة</td>
                    <td className="p-3" dir="ltr">60222122</td>
                    <td className="p-3">2</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex items-start gap-2 text-sm text-blue-800 bg-blue-200/50 p-3 rounded-lg font-medium">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>سيتم إضافة مفتاح دولة الكويت (+965) تلقائياً للأرقام إذا لم يكن موجوداً.</p>
            </div>
          </div>

          <div className="border-2 border-dashed border-amber-300 rounded-xl p-8 text-center hover:border-amber-400 hover:bg-amber-50/30 transition-all cursor-pointer relative group bg-gradient-to-br from-white to-amber-50/20">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setContactsFile(file);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center group-hover:bg-amber-200 transition-colors shadow-sm">
                <Upload className="w-8 h-8 text-amber-600" />
              </div>
              <div className="text-base font-bold text-slate-700">
                {contactsFile ? (
                  <span className="text-green-600 flex items-center gap-2 text-lg">
                    <CheckCircle2 className="w-5 h-5" />
                    {contactsFile.name}
                  </span>
                ) : (
                  "اضغط لاختيار ملف Excel"
                )}
              </div>
              {!contactsFile && <p className="text-sm text-slate-500 font-medium">xlsx, xls, csv</p>}
            </div>
          </div>

          {uploadResult?.stats && (
            <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-md">
              <h5 className="font-bold text-slate-800 mb-3 text-base">نتيجة الرفع:</h5>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white p-3 rounded-lg border-2 border-slate-200 font-semibold shadow-sm">تمت المعالجة: <span className="font-bold text-slate-900">{uploadResult.stats.total}</span></div>
                <div className="bg-white p-3 rounded-lg border-2 border-green-200 text-green-700 font-semibold shadow-sm">تم الإنشاء: <span className="font-bold">{uploadResult.stats.created}</span></div>
                <div className="bg-white p-3 rounded-lg border-2 border-blue-200 text-blue-700 font-semibold shadow-sm">تم التحديث: <span className="font-bold">{uploadResult.stats.updated}</span></div>
                <div className="bg-white p-3 rounded-lg border-2 border-red-200 text-red-700 font-semibold shadow-sm">أخطاء: <span className="font-bold">{uploadResult.stats.errors}</span></div>
              </div>
            </div>
          )}

          {Array.isArray(uploadResult?.errors) && uploadResult.errors.length > 0 && (
            <div className="rounded-xl border-2 border-red-200 bg-red-50 p-5 text-sm text-red-800 max-h-48 overflow-y-auto shadow-sm">
              <div className="font-bold mb-3 flex items-center gap-2 text-base">
                <AlertCircle className="w-5 h-5" />
                أخطاء في المعالجة:
              </div>
              <div className="space-y-2 text-sm">
                {uploadResult.errors.slice(0, 10).map((er: any, idx: number) => (
                  <div key={idx} className="bg-white/70 p-2 rounded-lg font-medium border border-red-200">
                    <span className="font-bold">{er.name}</span> ({er.phone}): {er.error}
                  </div>
                ))}
              </div>
              {uploadResult.errors.length > 10 && (
                <div className="mt-3 text-sm opacity-75 font-medium">... والباقي {uploadResult.errors.length - 10} خطأ</div>
              )}
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="إضافة عميل جديد"
        actions={
          <div className="flex gap-3 w-full">
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-semibold border-2 border-slate-200"
            >
              إلغاء
            </button>
            <button
              onClick={handleCreateClient}
              disabled={loading}
              className={`flex-1 px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-bold shadow-md ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'جاري الحفظ...' : 'حفظ العميل'}
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          <div>
            <label className="block text-base font-bold text-slate-700 mb-2">اسم العميل <span className="text-red-500">*</span></label>
            <input
              value={formData.fullName}
              onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
              className={`w-full px-5 py-3 border-2 rounded-xl focus:ring-2 focus:ring-amber-300 outline-none transition-all text-lg ${formErrors.fullName ? 'border-red-500 bg-red-50' : 'border-amber-200 focus:border-amber-400'}`}
              placeholder="مثال: شركة الأفراح المتميزة"
            />
            {formErrors.fullName && <p className="text-red-600 text-sm mt-2 font-medium flex items-center gap-1"><AlertCircle className="w-4 h-4" />{formErrors.fullName}</p>}
          </div>

          <div>
            <label className="block text-base font-bold text-slate-700 mb-2">البريد الإلكتروني (اختياري)</label>
            <input
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              className="w-full px-5 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none transition-all text-lg"
              placeholder="client@example.com"
            />
          </div>

          <div>
            <label className="block text-base font-bold text-slate-700 mb-2">رقم الهاتف (اختياري)</label>
            <input
              value={formData.phone}
              onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
              className="w-full px-5 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none transition-all text-lg"
              placeholder="+965xxxxxxxx"
              dir="ltr"
            />
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
