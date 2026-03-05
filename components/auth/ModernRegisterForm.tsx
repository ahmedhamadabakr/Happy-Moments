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
    agreeToTerms: false
  });
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
          roleKey: 'employee',
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
    <div className="min-h-screen bg-gradient-to-br from-[#1A2E26] via-[#2a4a3d] to-[#1A2E26] flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#C1A286] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white">جاري التحقق من الصلاحيات...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A2E26] via-[#2a4a3d] to-[#1A2E26] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl w-full max-w-lg border border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#C1A286] to-[#d4b896] rounded-full mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#1A2E26] mb-2">إضافة موظف جديد</h1>
          <p className="text-gray-600">قم بإضافة موظف أو مدير جديد للنظام</p>
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

          {/* Role Info - Hidden field, always EMPLOYEE */}
          <input type="hidden" name="role" value="EMPLOYEE" />
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">إضافة موظف جديد</p>
                <p className="text-xs text-blue-700 mt-1">
                  سيتم إضافة المستخدم كموظف. يمكنك تحديد صلاحياته بعد الإضافة من صفحة إدارة الموظفين.
                </p>
              </div>
            </div>
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
            className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all transform hover:scale-[1.02] ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#1A2E26] to-[#2a4a3d] hover:from-[#2a4a3d] hover:to-[#1A2E26] shadow-lg'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري إضافة الموظف...
              </span>
            ) : (
              'إضافة موظف جديد'
            )}
          </button>
        </form>

        {/* Back to Users */}
        <div className="text-center mt-8">
          <a href="/dashboard/users" className="text-sm text-[#C1A286] hover:text-[#a08060] transition-colors">
            ← العودة لإدارة الموظفين
          </a>
        </div>
      </div>
    </div>
  );
}
