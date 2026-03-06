'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function SettingsPage() {
  // **THE FIX**: We are now using the unified `user` object and `setUser` updater from the store.
  const { user, setUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for the form, initialized with user data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  // Effect to populate the form once the user object is available.
  useEffect(() => {
    if (user) {
      // Gracefully handle both `fullName` and `firstName`/`lastName` structures.
      const currentFullName = (user as any).fullName || `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim();
      setFormData({
        fullName: currentFullName,
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // API endpoint to update the user's own profile
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // **Crucially, update the user state in the global store**
        setUser(result.user);
        toast.success('تم تحديث ملفك الشخصي بنجاح!');
      } else {
        throw new Error(result.error || 'فشل تحديث الملف الشخصي.');
      }
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ غير متوقع.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Don't render the form until the user data is loaded to prevent flicker
  if (!user) {
    return null;
  }

  return (
      <div className="space-y-8 max-w-3xl mx-auto">
        <header>
            <h1 className="text-4xl font-extrabold text-slate-900">الإعدادات</h1>
            <p className="mt-2 text-lg text-slate-600">إدارة معلومات ملفك الشخصي وتفضيلاتك.</p>
        </header>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <form onSubmit={handleSubmit} className="p-8">
                <div className="space-y-6">
                    <div>
                        <Label htmlFor="fullName" className="text-lg font-semibold">الاسم الكامل</Label>
                        <p className="text-sm text-slate-500 mb-2">هذا هو الاسم الذي سيظهر للآخرين.</p>
                        <Input
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className="text-lg py-6"
                        />
                    </div>
                    <div>
                        <Label htmlFor="email" className="text-lg font-semibold">البريد الإلكتروني</Label>
                        <p className="text-sm text-slate-500 mb-2">لا يمكن تغيير البريد الإلكتروني للحساب.</p>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            disabled
                            className="text-lg py-6 bg-slate-50"
                        />
                    </div>
                    <div>
                        <Label htmlFor="phone" className="text-lg font-semibold">رقم الهاتف</Label>
                         <p className="text-sm text-slate-500 mb-2">يستخدم هذا الرقم للتواصل عند الضرورة.</p>
                        <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="text-lg py-6"
                        />
                    </div>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
                    <Button type="submit" loading={isSubmitting} size="lg" className="text-lg px-8 py-6">
                        {isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </Button>
                </div>
            </form>
        </div>
      </div>
  );
}
