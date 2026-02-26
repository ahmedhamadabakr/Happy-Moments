'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { FormInput } from '@/components/shared/FormInput';
import { useApi } from '@/lib/hooks/useApi';

export default function SettingsPage() {
  const { user, company } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { execute: updateCompany } = useApi(
    `/api/v1/company`,
    {
      onSuccess: () => {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      },
    }
  );

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        email: company.email || '',
        phone: company.phone || '',
        address: company.address || '',
      });
    }
  }, [company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateCompany('PUT', formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">إعدادات الشركة</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2">
            <Card title="معلومات الشركة">
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                  label="اسم الشركة"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <FormInput
                  label="البريد الإلكتروني"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                <FormInput
                  label="رقم الهاتف"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
                <FormInput
                  label="العنوان"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
                <div className="flex justify-end gap-2">
                  <Button type="submit" loading={loading}>
                    حفظ التغييرات
                  </Button>
                </div>
                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                    تم حفظ التغييرات بنجاح
                  </div>
                )}
              </form>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div>
            <Card title="معلومات الحساب">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">المسؤول الحالي</p>
                  <p className="font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                  <p className="font-medium text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">الدور</p>
                  <p className="font-medium text-gray-900">
                    {user?.role === 'admin' ? 'مسؤول' : 'مستخدم'}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
