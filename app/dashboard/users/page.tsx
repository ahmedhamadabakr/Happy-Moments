'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, X, PlusCircle, Trash2, User as UserIcon, Users, Shield, Mail, Sparkles } from 'lucide-react';
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
        const res = await fetch('/api/v1/employees', {
          credentials: 'include'
        });
  
        if (!res.ok) throw new Error('فشل في جلب المستخدمين');
  
        const data = await res.json();
  
        const formattedUsers = data.employees.map((u: any) => ({
          id: u._id,
          fullName: u.firstName + ' ' + u.lastName,
          email: u.email,
          role: u.role,
        }));
  
        setUsers(formattedUsers);
  
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
        <div className="flex items-center justify-center h-96">
          <Alert variant="destructive" className="max-w-md rounded-3xl border-red-200 bg-red-50">
            <X className="h-5 w-5 text-red-600" />
            <AlertTitle className="font-bold text-red-800">غير مصرح به</AlertTitle>
            <AlertDescription className="text-red-700">ليس لديك الصلاحيات اللازمة لعرض هذه الصفحة.</AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div dir="rtl" className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-[#F08784]/5 via-white to-violet-50/30 rounded-3xl p-8 border border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#F08784]/10 rounded-2xl flex items-center justify-center">
                <Users className="w-8 h-8 text-[#F08784]" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-900">إدارة الموظفين</h1>
                <p className="text-lg text-slate-600 mt-1">عرض وإدارة جميع الموظفين في النظام</p>
              </div>
            </div>
            <Button 
              asChild
              className="bg-[#F08784] hover:bg-[#D97673] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <Link href="/register">
                <PlusCircle className="ml-2 h-5 w-5" />
                إضافة موظف جديد
              </Link>
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="rounded-3xl border-red-200 bg-red-50">
            <X className="h-5 w-5 text-red-600" />
            <AlertTitle className="font-bold text-red-800">خطأ</AlertTitle>
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {/* Users Table Card */}
        <Card className="border-slate-200 shadow-md rounded-3xl bg-white">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-[#F08784]/5 border-b border-slate-100 rounded-t-3xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F08784]/10 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#F08784]" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900">قائمة الموظفين</CardTitle>
                <CardDescription className="text-slate-600">عرض وحذف الموظفين الحاليين</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {loading ? (
              <div className="flex flex-col justify-center items-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-[#F08784] mb-4" />
                <p className="text-slate-600">جاري تحميل البيانات...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-[#F08784]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <UserIcon className="h-10 w-10 text-[#F08784]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">لا يوجد موظفين</h3>
                <p className="text-slate-600 mb-6">ابدأ بإضافة موظف جديد للنظام</p>
                <Button 
                  asChild
                  className="bg-[#F08784] hover:bg-[#D97673] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  <Link href="/register">
                    <PlusCircle className="ml-2 h-5 w-5" />
                    إضافة موظف
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="font-bold text-slate-900">الاسم الكامل</TableHead>
                      <TableHead className="font-bold text-slate-900">البريد الإلكتروني</TableHead>
                      <TableHead className="font-bold text-slate-900">الدور</TableHead>
                      <TableHead className="text-left font-bold text-slate-900">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="font-semibold text-slate-900">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#F08784]/10 rounded-full flex items-center justify-center">
                              <span className="text-[#F08784] font-bold">
                                {u.fullName?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                            {u.fullName}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-400" />
                            {u.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                            u.role === 'manager' 
                              ? 'bg-violet-50 text-violet-700 border-violet-200' 
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            <Shield className="w-3 h-3" />
                            {u.role === 'manager' ? 'مدير' : 'موظف'}
                          </div>
                        </TableCell>
                        <TableCell className="text-left">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(u.id)}
                            className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl font-semibold"
                          >
                            <Trash2 className="h-4 w-4 ml-1" />
                            حذف
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
