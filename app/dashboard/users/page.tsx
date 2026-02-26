'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { DataTable, Column } from '@/components/shared/DataTable';
import { Modal } from '@/components/shared/Modal';
import { FormInput } from '@/components/shared/FormInput';
import { Select } from '@/components/shared/Select';
import { useApi } from '@/lib/hooks/useApi';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export default function UsersPage() {
  const { user, company } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user' as const,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { execute: fetchUsers } = useApi('/api/v1/company/users');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchUsers('GET');
        if (Array.isArray(data)) {
          setUsers(data);
        }
      } catch (error) {
        console.error('Failed to load users');
      }
    };

    if (user && company) {
      loadUsers();
    }
  }, [user, company]);

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName) newErrors.firstName = 'الاسم الأول مطلوب';
    if (!formData.lastName) newErrors.lastName = 'الاسم الأخير مطلوب';
    if (!formData.email) newErrors.email = 'البريد الإلكتروني مطلوب';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // API call to create user would go here
      setIsModalOpen(false);
      setFormData({ firstName: '', lastName: '', email: '', role: 'user' });
      setErrors({});
    } catch (error) {
      console.error('Failed to create user');
    }
  };

  const userColumns: Column<User>[] = [
    {
      key: 'firstName',
      label: 'الاسم',
      render: (_, row) => `${row.firstName} ${row.lastName}`,
    },
    { key: 'email', label: 'البريد الإلكتروني' },
    {
      key: 'role',
      label: 'الدور',
      render: (value) => value === 'admin' ? 'مسؤول' : 'مستخدم',
    },
    {
      key: 'createdAt',
      label: 'تاريخ الإنشاء',
      render: (value) => new Date(value).toLocaleDateString('ar-SA'),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">إدارة المستخدمين</h1>
          <Button onClick={() => setIsModalOpen(true)}>إضافة مستخدم جديد</Button>
        </div>

        <Card>
          <DataTable
            columns={userColumns}
            data={users}
            emptyMessage="لا يوجد مستخدمون"
          />
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="إضافة مستخدم جديد"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              إلغاء
            </Button>
            <Button onClick={handleSubmit}>إضافة</Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput
            label="الاسم الأول"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            error={errors.firstName}
          />
          <FormInput
            label="الاسم الأخير"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            error={errors.lastName}
          />
          <FormInput
            label="البريد الإلكتروني"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            error={errors.email}
          />
          <Select
            label="الدور"
            value={formData.role}
            onChange={(e) =>
              setFormData({
                ...formData,
                role: e.target.value as 'admin' | 'user',
              })
            }
            options={[
              { value: 'user', label: 'مستخدم' },
              { value: 'admin', label: 'مسؤول' },
            ]}
          />
        </div>
      </Modal>
    </DashboardLayout>
  );
}
