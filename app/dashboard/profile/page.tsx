'use client';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, User, Mail, Shield, Calendar, Briefcase, Phone, MapPin } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';

export default function ProfilePage() {
  const { user, isLoading: userLoading } = useAuthStore();

  if (userLoading || !user) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-amber-500 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">جاري تحميل البيانات...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const userInfo = [
    { label: 'الاسم الكامل', value: user.fullName, icon: User },
    { label: 'البريد الإلكتروني', value: user.email, icon: Mail },
    { label: 'الصلاحية', value: user.role === 'manager' ? 'مدير' : 'موظف', icon: Shield },
    { label: 'رقم الجوال', value: user.phone || 'غير محدد', icon: Phone },
    { label: 'الشركة', value: user.company?.name || 'غير محدد', icon: Briefcase },
    { label: 'تاريخ الانضمام', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-SA', { dateStyle: 'long' }) : 'غير محدد', icon: Calendar },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        {/* Header Section */}
        <Card className="bg-gradient-to-br from-amber-50 via-white to-amber-50/30 rounded-2xl p-8 border-2 border-amber-100 shadow-lg">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">الملف الشخصي</h1>
              <p className="text-lg text-slate-600 mt-2 font-medium">عرض معلوماتك الشخصية وبيانات الحساب</p>
            </div>
          </div>
        </Card>

        {/* Profile Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* User Avatar Card */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-amber-100 shadow-lg rounded-2xl bg-gradient-to-br from-white to-amber-50/20">
              <CardContent className="p-8 text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <span className="text-5xl font-bold text-white">
                    {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{user.fullName}</h3>
                <p className="text-slate-600 mb-6 font-medium">{user.email}</p>
                
                <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-5 py-2.5 rounded-full font-bold shadow-sm border-2 border-amber-200">
                  <Shield size={18} />
                  <span className="text-base">{user.role === 'manager' ? 'مدير' : 'موظف'}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Information Card */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-amber-100 shadow-lg rounded-2xl bg-white">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-b-2 border-amber-100">
                <CardTitle className="text-2xl font-bold text-slate-900">المعلومات الشخصية</CardTitle>
                <CardDescription className="text-slate-600 font-medium">بيانات الحساب والمعلومات الأساسية</CardDescription>
              </CardHeader>
              
              <CardContent className="p-8">
                <div className="grid gap-6">
                  {userInfo.map((info, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-4 p-5 bg-gradient-to-r from-amber-50/50 to-white rounded-xl border-2 border-amber-100 hover:border-amber-200 hover:shadow-md transition-all"
                    >
                      <div className="p-3 bg-amber-100 rounded-lg flex-shrink-0">
                        <info.icon className="w-6 h-6 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-600 mb-1">{info.label}</p>
                        <p className="text-lg font-bold text-slate-900 break-words">{info.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Info Card */}
        <Card className="border-2 border-amber-100 shadow-lg rounded-2xl bg-gradient-to-br from-white to-amber-50/10">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-b-2 border-amber-100">
            <CardTitle className="text-xl font-bold text-slate-900">ملاحظة</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-start gap-3 text-slate-700">
              <Shield className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="font-medium leading-relaxed">
                هذه الصفحة مخصصة لعرض معلوماتك الشخصية فقط. لتحديث أي بيانات، يرجى التواصل مع المسؤول أو مدير النظام.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
