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
  // Logic & State Management
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '' });
  
  // Modals States
  const [modals, setModals] = useState({
    create: false,
    upload: false,
    link: false,
    edit: false,
  });
  
  const [editingClient, setEditingClient] = useState<any>(null);
  const [activeClient, setActiveClient] = useState(null);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState(null);

  const loadClients = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/clients');
      const json = await res.json();
      if (json.success) setClients(json.clients || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { loadClients(); }, []);

  const handleCreate = async () => {
    if (!formData.fullName.trim()) {
      setFormErrors({ fullName: 'الاسم مطلوب' });
      return;
    }
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
        setModals({ ...modals, create: false });
        setFormData({ fullName: '', email: '', phone: '' });
        loadClients();
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleDelete = async (client: any) => {
    if (window.confirm(`هل أنت متأكد أنك تريد حذف العميل ${client.fullName}؟`)) {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/clients?id=${client._id}`, {
          method: 'DELETE',
        });
        const json = await res.json();
        if (json.success) {
          loadClients(); // Reload clients after deletion
        } else {
          // Handle error, maybe show a toast notification
          console.error('Failed to delete client:', json.message);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

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
        setModals({ ...modals, edit: false });
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

  const handleEditClick = (client: any) => {
    setEditingClient(client);
    setFormData({ fullName: client.fullName, email: client.email || '', phone: client.phone || '' });
    setModals({ ...modals, edit: true });
  };

  const filteredClients = clients.filter((c: any) => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone?.includes(searchTerm)
  );

  return (
    <DashboardLayout>
      <div className="space-y-8" dir="rtl">
        <ClientHeader count={filteredClients.length} onAddClick={() => setModals({...modals, create: true})} />
        
        <SuccessAlert url={createdUrl} />
        
        <ClientTable 
          data={filteredClients} 
          loading={loading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onUploadClick={(c) => { setActiveClient({id: c._id, name: c.fullName}); setModals({...modals, upload: true}); }}
          onRowClick={(c) => { 
            const url = `${window.location.origin}/client-view/${c.accessToken}`;
            setSelectedUrl(url);
            setModals({...modals, link: true});
          }}
          onDeleteClick={handleDelete}
          onEditClick={handleEditClick}
        />

        <CreateClientModal 
          isOpen={modals.create} 
          onClose={() => setModals({...modals, create: false})}
          formData={formData}
          setFormData={setFormData}
          onSave={handleCreate}
          loading={loading}
          errors={formErrors}
        />

        {editingClient && (
          <CreateClientModal
            isOpen={modals.edit}
            onClose={() => {
              setModals({ ...modals, edit: false });
              setEditingClient(null);
            }}
            formData={formData}
            setFormData={setFormData}
            onSave={handleUpdateClient}
            loading={loading}
            errors={formErrors}
            title="تعديل بيانات العميل"
            saveButtonText="حفظ التعديلات"
          />
        )}

        <UploadContactsModal 
          isOpen={modals.upload}
          onClose={() => { setModals({...modals, upload: false}); setUploadResult(null); }}
          client={activeClient}
          selectedFile={file}
          onFileChange={setFile}
          onUpload={() => {}} // اربطها بدالة الرفع الخاصة بك
          loading={loading}
          result={uploadResult}
        />

        <ClientLinkModal 
          isOpen={modals.link}
          onClose={() => setModals({...modals, link: false})}
          url={selectedUrl}
          
        />
      </div>
    </DashboardLayout>
  );
}