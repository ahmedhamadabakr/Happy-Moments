'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { X, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CreateUserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    roleKey: 'event_creator', // قيمة افتراضية تتوافق مع PERMISSION_GROUPS
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'فشل في إنشاء الموظف');
      }
      
      router.push('/dashboard/users');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div dir="rtl" className="p-4">
        <div className="mb-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/users">
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة إلى قائمة الموظفين
            </Link>
          </Button>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-right">إضافة موظف جديد</CardTitle>
            <CardDescription className="text-right">أدخل تفاصيل الموظف الجديد لتحديد صلاحياته في النظام.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 text-right">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">الاسم الأول</Label>
                  <Input id="firstName" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">اسم العائلة</Label>
                  <Input id="lastName" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف (اختياري)</Label>
                <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required minLength={8} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="roleKey">الدور الوظيفي (مجموعة الصلاحيات)</Label>
                <Select value={formData.roleKey} onValueChange={(value) => setFormData({ ...formData, roleKey: value })}>
                  <SelectTrigger id="roleKey">
                    <SelectValue placeholder="اختر دورًا" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="event_creator">منشئ الفعاليات</SelectItem>
                    <SelectItem value="contact_manager">مدير جهات الاتصال</SelectItem>
                    <SelectItem value="invitation_sender">مرسل الدعوات</SelectItem>
                    <SelectItem value="checkin_staff">موظف تسجيل الحضور</SelectItem>
                    <SelectItem value="viewer">مشاهد فقط</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <Alert variant="destructive">
                  <X className="h-4 w-4" />
                  <AlertTitle>خطأ</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={loading} className="w-full md:w-auto">
                  {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  إنشاء حساب الموظف
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}