'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Briefcase, Building, Phone, Shield, Users } from 'lucide-react';

export default function EmployeeRegisterForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'EMPLOYEE', // EMPLOYEE only (MANAGER is the admin role)
    roleKey: '', // مجموعة الصلاحيات
    agreeToTerms: false
  });

  // مجموعات الصلاحيات المتاحة
  const permissionGroups = [
    { key: 'event_creator', label: 'منشئ فعاليات' },
    { key: 'contact_manager', label: 'مدير جهات الاتصال' },
    { key: 'invitation_sender', label: 'مرسل الدعوات' },
    { key: 'viewer', label: 'مشاهد فقط' },
    { key: 'checkin_staff', label: 'موظف تسجيل حضور' },
  ];
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    checkAuthorization();
  }, [router]);

  const checkAuthorization = async () => {
    try {
      const response = await fetch('/api/auth/profile');
      const data = await response.json();
      
      if (!data.success || !data.data || !data.data.user || data.data.user.role !== 'manager') {
        router.push('/dashboard');
        return;
      }
      
      setAuthorized(true);
    } catch (error) {
      console.error('Authorization check failed:', error);
      router.push('/dashboard');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'الاسم الأول مطلوب';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'الاسم الأخير مطلوب';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }
    
    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 8) {
      newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'يجب الموافقة على الشروط والأحكام';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/v1/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
          roleKey: formData.roleKey,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse';
        successMessage.textContent = 'تم إضافة الموظف بنجاح!';
        document.body.appendChild(successMessage);

        setTimeout(() => {
          document.body.removeChild(successMessage);
          router.push('/dashboard/users');
        }, 2000);
      } else {
        setErrors({ general: data.error || 'فشل إضافة الموظف' });
      }
    } catch (error) {
      setErrors({ general: 'حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const target = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? target.checked : value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!mounted || !authorized) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#F08784]/5 to-violet-50/30 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#F08784] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600">جاري التحقق من الصلاحيات...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#F08784]/5 to-violet-50/30 flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      {/* خلفية زخرفية */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-[#F08784]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-violet-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 bg-white p-8 rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-200/50 backdrop-blur-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F08784]/10 rounded-2xl mb-4">
            <Users className="w-8 h-8 text-[#F08784]" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">إضافة موظف جديد</h1>
          <p className="text-slate-600">قم بإضافة موظف أو مدير جديد للنظام</p>
        </div>

        {/* Error Message */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs">!</span>
            </div>
            <p className="text-red-700 text-sm">{errors.general}</p>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الأول</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C1A286] focus:border-transparent transition-all text-right ${
                    errors.firstName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="أحمد"
                />
              </div>
              {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الأخير</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C1A286] focus:border-transparent transition-all text-right ${
                  errors.lastName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="محمد"
              />
              {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C1A286] focus:border-transparent transition-all text-right ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="employee@company.com"
                dir="ltr"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف (اختياري)</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C1A286] focus:border-transparent transition-all text-right"
                placeholder="+966 50 123 4567"
                dir="ltr"
              />
            </div>
          </div>

          {/* اختيار مجموعة الصلاحيات */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">مجموعة الصلاحيات</label>
            <select
              name="roleKey"
              value={formData.roleKey}
              onChange={handleInputChange}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C1A286] focus:border-transparent transition-all text-right ${errors.roleKey ? 'border-red-300' : 'border-gray-300'}`}
            >
              <option value="">اختر مجموعة الصلاحيات</option>
              {permissionGroups.map(group => (
                <option key={group.key} value={group.key}>{group.label}</option>
              ))}
            </select>
            {errors.roleKey && <p className="mt-1 text-xs text-red-600">{errors.roleKey}</p>}
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className={`w-full pr-10 pl-10 py-3 border rounded-lg focus:ring-2 focus:ring-[#C1A286] focus:border-transparent transition-all text-right ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">تأكيد كلمة المرور</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className={`w-full pr-10 pl-10 py-3 border rounded-lg focus:ring-2 focus:ring-[#C1A286] focus:border-transparent transition-all text-right ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Terms Agreement */}
          <div>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="w-4 h-4 text-[#C1A286] border-gray-300 rounded focus:ring-[#C1A286] mt-1"
              />
              <span className="text-sm text-gray-600">
                أوافق على أن هذا الموظف سيلتزم بشروط العمل والسياسات الداخلية
              </span>
            </label>
            {errors.agreeToTerms && <p className="mt-1 text-xs text-red-600">{errors.agreeToTerms}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-4 rounded-xl font-bold text-white transition-all transform hover:scale-[1.02] shadow-lg ${
              loading
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-[#F08784] hover:bg-[#D97673]'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري إضافة الموظف...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Users className="w-5 h-5" />
                إضافة موظف جديد
              </span>
            )}
          </button>
        </form>

        {/* Back to Users */}
        <div className="text-center mt-8 pt-6 border-t border-slate-200">
          <a href="/dashboard/users" className="text-sm text-[#F08784] hover:text-[#D97673] transition-colors font-semibold">
            ← العودة لإدارة الموظفين
          </a>
        </div>
      </div>
    </div>
  );
}
