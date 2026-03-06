'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, X, Loader2, User, Mail, Lock, Sparkles, Shield } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';

export default function ProfilePage() {
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
      
      if(json.user) {
        setUser(json.user);
      }

      setSuccessMessage('تم تحديث الملف الشخصي بنجاح!');
      setFormData(prev => ({ ...prev, password: '', passwordConfirmation: '' }));

    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطأ غير معروف');
    } finally {
      setLoading(false);
    }
  };

  if (userLoading || !user) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#F08784] mx-auto mb-4" />
            <p className="text-slate-600">جاري تحميل البيانات...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8" dir="rtl">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-[#F08784]/5 via-white to-violet-50/30 rounded-3xl p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#F08784]/10 rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-[#F08784]" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900">الملف الشخصي</h1>
              <p className="text-lg text-slate-600 mt-1">إدارة معلوماتك الشخصية وإعدادات الحساب</p>
            </div>
          </div>
        </div>

        {/* Profile Info Card */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* User Info Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-slate-200 shadow-md rounded-3xl bg-white">
              <CardContent className="p-8 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-[#F08784] to-[#D97673] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl font-black text-white">
                    {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{user.fullName}</h3>
                <p className="text-slate-600 mb-4">{user.email}</p>
                
                <div className="inline-flex items-center gap-2 bg-[#F08784]/10 text-[#F08784] px-4 py-2 rounded-full text-sm font-bold">
                  <Shield size={16} />
                  <span>{user.role === 'manager' ? 'مدير' : 'موظف'}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2">
            <Card className="border-slate-200 shadow-md rounded-3xl bg-white">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-[#F08784]/5 border-b border-slate-100 rounded-t-3xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F08784]/10 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#F08784]" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-900">تحديث البيانات</CardTitle>
                    <CardDescription className="text-slate-600">قم بتعديل معلوماتك الشخصية</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-8 space-y-6">
                {/* Form Fields */}
                <div className="space-y-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="font-bold text-slate-700 flex items-center gap-2">
                      <User size={16} />
                      الاسم الكامل
                    </Label>
                    <Input 
                      id="fullName" 
                      value={formData.fullName} 
                      onChange={(e) => setFormData(p => ({ ...p, fullName: e.target.value }))}
                      className="rounded-xl border-slate-300 focus:ring-[#F08784] focus:border-transparent bg-slate-50 focus:bg-white transition-all py-3"
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-bold text-slate-700 flex items-center gap-2">
                      <Mail size={16} />
                      البريد الإلكتروني
                    </Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={formData.email} 
                      onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                      className="rounded-xl border-slate-300 focus:ring-[#F08784] focus:border-transparent bg-slate-50 focus:bg-white transition-all py-3"
                      placeholder="example@email.com"
                    />
                  </div>

                  {/* Password Section */}
                  <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Lock size={18} className="text-slate-600" />
                      <h4 className="font-bold text-slate-800">تغيير كلمة المرور</h4>
                      <span className="text-sm text-slate-500">(اختياري)</span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password" className="font-semibold text-slate-700">كلمة المرور الجديدة</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          value={formData.password} 
                          onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                          className="rounded-xl border-slate-300 focus:ring-[#F08784] focus:border-transparent bg-white transition-all py-3"
                          placeholder="••••••••"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="passwordConfirmation" className="font-semibold text-slate-700">تأكيد كلمة المرور</Label>
                        <Input 
                          id="passwordConfirmation" 
                          type="password" 
                          value={formData.passwordConfirmation} 
                          onChange={(e) => setFormData(p => ({ ...p, passwordConfirmation: e.target.value }))}
                          className="rounded-xl border-slate-300 focus:ring-[#F08784] focus:border-transparent bg-white transition-all py-3"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alerts */}
                {error && (
                  <Alert variant="destructive" className="rounded-xl border-red-200 bg-red-50">
                    <X className="h-5 w-5 text-red-600" />
                    <AlertTitle className="font-bold text-red-800">حدث خطأ</AlertTitle>
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}

                {successMessage && (
                  <Alert variant="default" className="bg-emerald-50 border-emerald-200 text-emerald-800 rounded-xl">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <AlertTitle className="font-bold text-emerald-900">تم بنجاح ✓</AlertTitle>
                    <AlertDescription className="text-emerald-700">{successMessage}</AlertDescription>
                  </Alert>
                )}

                {/* Save Button */}
                <div className="flex justify-end pt-6 border-t border-slate-200">
                  <Button 
                    onClick={handleUpdateProfile} 
                    disabled={loading} 
                    className="bg-[#F08784] hover:bg-[#D97673] text-white px-8 py-3 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all"
                    size="lg"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        جاري الحفظ...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle size={20} />
                        حفظ التغييرات
                      </span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
