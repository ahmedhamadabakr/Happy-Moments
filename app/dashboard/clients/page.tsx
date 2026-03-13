'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ClientHeader } from '@/components/clients/ClientHeader';
import { ClientTable } from '@/components/clients/ClientTable';
import { CreateClientModal } from '@/components/clients/CreateClientModal';
import { UploadContactsModal } from '@/components/clients/UploadContactsModal';
import { ClientLinkModal } from '@/components/clients/ClientLinkModal';
import { SuccessAlert } from '@/components/clients/SuccessAlert';

export default function ClientsPage() {
  // --- 1. إدارة البيانات (Data Management) ---
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '' });

  // --- 2. حالات النوافذ (Modals States) ---
  const [modals, setModals] = useState({
    create: false,
    upload: false,
    link: false,
    edit: false,
  });

  const [editingClient, setEditingClient] = useState<any>(null);
  const [activeClient, setActiveClient] = useState<{ id: string; name: string } | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState(null);

  // --- 3. وظائف جلب البيانات (Fetch Data) ---
  const loadClients = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/clients');
      const json = await res.json();
      if (json.success) setClients(json.clients || []);
    } catch (e) {
      console.error("Error loading clients:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  // --- 4. وظائف الإجراءات (Actions) ---

  // إنشاء عميل
  const handleCreate = async () => {
    if (!formData.fullName.trim()) {
      setFormErrors({ fullName: 'الاسم مطلوب' });
      return;
    }
    setFormErrors({});
    setLoading(true);
    try {
      const res = await fetch('/api/v1/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        setCreatedUrl(json.clientViewUrl);
        setModals((prev) => ({ ...prev, create: false }));
        setFormData({ fullName: '', email: '', phone: '' });
        loadClients();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // حذف عميل
  const handleDelete = async (client: any) => {
    if (window.confirm(`هل أنت متأكد أنك تريد حذف العميل ${client.fullName}؟`)) {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/clients?id=${client._id}`, {
          method: 'DELETE',
        });
        const json = await res.json();
        if (json.success) {
          loadClients();
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  // تعديل عميل
  const handleUpdateClient = async () => {
    if (!editingClient) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/clients?id=${editingClient._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        setModals((prev) => ({ ...prev, edit: false }));
        setEditingClient(null);
        setFormData({ fullName: '', email: '', phone: '' });
        loadClients();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // رفع جهات الاتصال (Upload)
  const handleUpload = async () => {
    if (!file || !activeClient) {
      alert("يرجى اختيار ملف أولاً");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('contactsFile', file);
      const res = await fetch(`/api/v1/clients/${activeClient.id}/contacts`, {
        method: 'POST',
        body: fd,
      });
      const json = await res.json();
      if (json.success) {
        setUploadResult(json);
        loadClients();
      } else {
        alert(json.error || "فشل الرفع");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // فتح نافذة التعديل
  const handleEditClick = (client: any) => {
    setEditingClient(client);
    setFormData({ 
      fullName: client.fullName, 
      email: client.email || '', 
      phone: client.phone || '' 
    });
    setModals((prev) => ({ ...prev, edit: true }));
  };

  // الفلترة والبحث
  const filteredClients = clients.filter((c: any) => 
    c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone?.includes(searchTerm)
  );

  return (
    <DashboardLayout>
      <div className="space-y-8" dir="rtl">
        {/* الهيدر */}
        <ClientHeader 
          count={filteredClients.length} 
          onAddClick={() => {
            setFormData({ fullName: '', email: '', phone: '' });
            setCreatedUrl(null);
            setModals((prev) => ({ ...prev, create: true }));
          }} 
        />
        
        {/* تنبيه النجاح */}
        <SuccessAlert url={createdUrl} />
        
        {/* الجدول */}
        <ClientTable 
          data={filteredClients} 
          loading={loading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onUploadClick={(c: any) => { 
            setActiveClient({ id: c._id, name: c.fullName }); 
            setModals((prev) => ({ ...prev, upload: true })); 
          }}
          onRowClick={(c: any) => { 
            const url = `${window.location.origin}/client-view/${c.accessToken}`;
            setSelectedUrl(url);
            setActiveClient({ id: c._id, name: c.fullName });
            setModals((prev) => ({ ...prev, link: true }));
          }}
          onDeleteClick={handleDelete}
          onEditClick={handleEditClick}
        />

        {/* مودال الإنشاء */}
        <CreateClientModal 
          isOpen={modals.create} 
          onClose={() => setModals((prev) => ({ ...prev, create: false }))}
          formData={formData}
          setFormData={setFormData}
          onSave={handleCreate}
          loading={loading}
          errors={formErrors}
        />

        {/* مودال التعديل */}
        {editingClient && (
          <CreateClientModal
            isOpen={modals.edit}
            onClose={() => {
              setModals((prev) => ({ ...prev, edit: false }));
              setEditingClient(null);
            }}
            formData={formData}
            setFormData={setFormData}
            onSave={handleUpdateClient}
            loading={loading}
            errors={formErrors}
            // @ts-ignore
            title="تعديل بيانات العميل"
            saveButtonText="حفظ التعديلات"
          />
        )}

        {/* مودال الرفع */}
        <UploadContactsModal 
          isOpen={modals.upload}
          onClose={() => { 
            setModals((prev) => ({ ...prev, upload: false })); 
            setUploadResult(null); 
            setFile(null);
          }}
          client={activeClient}
          selectedFile={file}
          onFileChange={setFile}
          onUpload={handleUpload}
          loading={loading}
          result={uploadResult}
        />

        {/* مودال الرابط */}
        <ClientLinkModal 
          isOpen={modals.link}
          onClose={() => setModals((prev) => ({ ...prev, link: false }))}
          url={selectedUrl}
          clientName={activeClient?.name}
        />
      </div>
    </DashboardLayout>
  );
}