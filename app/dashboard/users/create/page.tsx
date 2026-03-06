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
import { X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CreateUserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'employee', // Default role
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

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'فشل في إنشاء الموظف');
      }
      
      // Redirect to the users list on success
      router.push('/dashboard/users');

    } catch (e) {
      setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div dir="rtl">
        <div className="mb-4">
            <Button variant="outline" asChild>
                <Link href="/dashboard/users">
                    <ArrowRight className="ml-2 h-4 w-4" />
                    العودة إلى قائمة الموظفين
                </Link>
            </Button>
        </div>

        <Card className="max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl">إضافة موظف جديد</CardTitle>
                <CardDescription>أدخل تفاصيل الموظف الجديد لإضافته إلى النظام.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">الاسم الكامل</Label>
                        <Input id="fullName" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">البريد الإلكتروني</Label>
                        <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">كلمة المرور</Label>
                        <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">الدور</Label>
                        <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                            <SelectTrigger id="role">
                                <SelectValue placeholder="اختر دورًا" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="employee">موظف</SelectItem>
                                <SelectItem value="manager">مدير</SelectItem>
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

                    <div className="flex justify-end">
                        <Button type="submit" disabled={loading} loading={loading}>
                            إنشاء الموظف
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
