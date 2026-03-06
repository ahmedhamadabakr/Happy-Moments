'use client';

import { useEffect, useMemo, useState } from 'react';
import { Users, UserPlus, Upload, Link as LinkIcon, ExternalLink, Copy, FileSpreadsheet, AlertCircle, CheckCircle2, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/shared/Card';
import { DataTable, Column } from '@/components/shared/DataTable';
import { Modal } from '@/components/shared/Modal';

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

  const filteredClients = clients.filter(client => 
    client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm)
  );

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
            <button
              onClick={(e) => {
                e.stopPropagation();
                setError(null);
                setUploadResult(null);
                setContactsFile(null);
                setUploadClient({ id: row._id, name: row.fullName });
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
            <div className="flex gap-2 w-full">
              <button 
                onClick={() => setIsUploadContactsModalOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                إغلاق
              </button>
              <button 
                onClick={handleUploadContacts} 
                disabled={loading}
                className={`flex-1 px-4 py-2 bg-[#1A2E26] text-white rounded-lg hover:bg-[#2a4a3d] transition-colors flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Upload className="w-4 h-4" />}
                رفع الملف
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2 text-sm">
                <FileSpreadsheet className="w-4 h-4" />
                تنسيق الملف المطلوب
              </h4>
              <p className="text-xs text-blue-800 mb-3">
                يرجى التأكد من أن ملف Excel يحتوي على الأعمدة التالية بالترتيب:
              </p>
              <div className="overflow-x-auto rounded-lg border border-blue-200 mb-3">
                <table className="w-full text-xs text-right bg-white">
                  <thead className="bg-blue-100 text-blue-900 font-semibold">
                    <tr>
                      <th className="p-2 border-b border-blue-100">First Name</th>
                      <th className="p-2 border-b border-blue-100">Last Name</th>
                      <th className="p-2 border-b border-blue-100">Suffix</th>
                      <th className="p-2 border-b border-blue-100">Phone</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    <tr className="border-b border-gray-50">
                      <td className="p-2">منــال</td>
                      <td className="p-2">الشمري</td>
                      <td className="p-2">المكرمة</td>
                      <td className="p-2" dir="ltr">60288122</td>
                    </tr>
                    <tr>
                      <td className="p-2">وردة</td>
                      <td className="p-2">العلي</td>
                      <td className="p-2">المكرمة</td>
                      <td className="p-2" dir="ltr">60222122</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex items-start gap-2 text-xs text-blue-700 bg-blue-100/50 p-2 rounded-lg">
                <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <p>سيتم إضافة مفتاح دولة الكويت (+965) تلقائياً للأرقام إذا لم يكن موجوداً.</p>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#C1A286] hover:bg-gray-50 transition-all cursor-pointer relative group">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setContactsFile(file);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-[#C1A286]/10 transition-colors">
                  <Upload className="w-5 h-5 text-gray-500 group-hover:text-[#C1A286]" />
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {contactsFile ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      {contactsFile.name}
                    </span>
                  ) : (
                    "اضغط لاختيار ملف Excel"
                  )}
                </div>
                {!contactsFile && <p className="text-xs text-gray-500">xlsx, xls, csv</p>}
              </div>
            </div>

            {uploadResult?.stats && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm">
                <h5 className="font-bold text-gray-800 mb-2">نتيجة الرفع:</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2 rounded border">تمت المعالجة: <span className="font-bold">{uploadResult.stats.total}</span></div>
                  <div className="bg-white p-2 rounded border text-green-600">تم الإنشاء: <span className="font-bold">{uploadResult.stats.created}</span></div>
                  <div className="bg-white p-2 rounded border text-blue-600">تم التحديث: <span className="font-bold">{uploadResult.stats.updated}</span></div>
                  <div className="bg-white p-2 rounded border text-red-600">أخطاء: <span className="font-bold">{uploadResult.stats.errors}</span></div>
                </div>
              </div>
            )}

            {Array.isArray(uploadResult?.errors) && uploadResult.errors.length > 0 && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 max-h-40 overflow-y-auto">
                <div className="font-bold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  أخطاء في المعالجة:
                </div>
                <div className="space-y-1 text-xs">
                  {uploadResult.errors.slice(0, 10).map((er: any, idx: number) => (
                    <div key={idx} className="bg-white/50 p-1 rounded">
                      <span className="font-semibold">{er.name}</span> ({er.phone}): {er.error}
                    </div>
                  ))}
                </div>
                {uploadResult.errors.length > 10 && (
                  <div className="mt-2 text-xs opacity-75">... والباقي {uploadResult.errors.length - 10} خطأ</div>
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
            <div className="flex gap-2 w-full">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={handleCreateClient} 
                disabled={loading}
                className={`flex-1 px-4 py-2 bg-[#1A2E26] text-white rounded-lg hover:bg-[#2a4a3d] transition-colors flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'جاري الحفظ...' : 'حفظ العميل'}
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم العميل <span className="text-red-500">*</span></label>
              <input
                value={formData.fullName}
                onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C1A286] outline-none transition-all ${formErrors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="مثال: شركة الأفراح المتميزة"
              />
              {formErrors.fullName && <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني (اختياري)</label>
              <input
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C1A286] outline-none transition-all"
                placeholder="client@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف (اختياري)</label>
              <input
                value={formData.phone}
                onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C1A286] outline-none transition-all"
                placeholder="+965xxxxxxxx"
                dir="ltr"
              />
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
