'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, X, PlusCircle, Trash2, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore, User } from '@/lib/store/authStore';

export default function ManageUsersPage() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/v1/employees');
        if (!res.ok) throw new Error('فشل في جلب المستخدمين');
        const data = await res.json();
        setUsers(data.data || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'خطأ غير متوقع');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'manager') {
      fetchUsers();
    }
  }, [user]);

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('هل أنت متأكد أنك تريد حذف هذا الموظف؟')) return;

    try {
      const res = await fetch(`/api/v1/employees/${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('فشل في حذف الموظف');
      setUsers(users.filter((u) => u.id !== userId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطأ غير متوقع');
    }
  };

  if (user?.role !== 'manager') {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <X className="h-4 w-4" />
          <AlertTitle>غير مصرح به</AlertTitle>
          <AlertDescription>ليس لديك الصلاحيات اللازمة لعرض هذه الصفحة.</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div dir="rtl">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">إدارة الموظفين</h1>
          <Button asChild>
            <Link href="/dashboard/users/create">
              <PlusCircle className="ml-2 h-4 w-4" />
              إضافة موظف جديد
            </Link>
          </Button>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>قائمة الموظفين</CardTitle>
            <CardDescription>عرض وحذف الموظفين الحاليين.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <X className="h-4 w-4" />
                <AlertTitle>خطأ</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : users.length === 0 ? (
                <div className="text-center py-12">
                    <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">لا يوجد موظفين</h3>
                    <p className="mt-1 text-sm text-gray-500">ابدأ بإضافة موظف جديد.</p>
                </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم الكامل</TableHead>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>الدور</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.fullName}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.role}</TableCell>
                      <TableCell className="text-left">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(u.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
