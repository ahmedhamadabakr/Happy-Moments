'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, X, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore'; // Direct import

export default function ProfilePage() {
  // Use the store directly
  const { user, isLoading: userLoading, setUser } = useAuthStore();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        password: '',
        passwordConfirmation: '',
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (formData.password && formData.password !== formData.passwordConfirmation) {
      setError('كلمتا المرور غير متطابقتين');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          ...(formData.password && { password: formData.password }),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'فشل في تحديث الملف الشخصي');
      }
      
      // Update user in the auth store on success
      if(json.user) {
        setUser(json.user);
      }

      setSuccessMessage('تم تحديث الملف الشخصي بنجاح!');
      // Clear password fields after success
      setFormData(prev => ({ ...prev, password: '', passwordConfirmation: '' }));

    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطأ غير معروف');
    } finally {
      setLoading(false);
    }
  };

  // A more robust loading state
  if (userLoading || !user) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <Card className="border-slate-200 shadow-md rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-amber-50/20 border-b border-slate-100">
            <CardTitle className="text-2xl font-bold text-slate-900">الملف الشخصي</CardTitle>
            <CardDescription className="text-slate-600 text-base">تعديل معلوماتك الشخصية وتغيير كلمة المرور.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="font-semibold">الاسم الكامل</Label>
                <Input id="fullName" value={formData.fullName} onChange={(e) => setFormData(p => ({ ...p, fullName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold">البريد الإلكتروني</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-semibold">كلمة المرور الجديدة (اتركه فارغاً لعدم التغيير)</Label>
                <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passwordConfirmation" className="font-semibold">تأكيد كلمة المرور الجديدة</Label>
                <Input id="passwordConfirmation" type="password" value={formData.passwordConfirmation} onChange={(e) => setFormData(p => ({ ...p, passwordConfirmation: e.target.value }))} />
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-6">
                <X className="h-4 w-4" />
                <AlertTitle>حدث خطأ</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert variant="default" className='bg-green-50 border-green-200 text-green-800 mt-6'>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>تم بنجاح</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-200 mt-6">
              <Button onClick={handleUpdateProfile} disabled={loading} loading={loading} size="lg">
                حفظ التغييرات
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
