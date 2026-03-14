'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

// This is now a "dumb" component. Its only job is to display and submit a form.
// It does NOT check auth status on its own. The parent page (`/login/page.tsx`) handles that.
export default function ModernLoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  // We get the `checkAuth` function from the store to re-validate after a successful login.
  const { checkAuth } = useAuthStore();

  // CRITICAL FIX: The problematic useEffect that checked auth status has been removed.
  // This was causing a race condition with our main auth logic in the page and layout.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // On successful login, manually trigger a re-check of the auth status.
        // This will update the global state to 'authenticated' and the layout/page will redirect correctly.
        await checkAuth(); 

        // توجيه المستخدم بناءً على دوره
        if (data.data?.user?.role === 'manager') {
          router.push('/dashboard/manager');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(data.error || 'فشل تسجيل الدخول. يرجى التحقق من بياناتك.');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#F08784]/5 to-violet-50/30 flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      {/* خلفية زخرفية */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-[#F08784]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-violet-400/10 rounded-full blur-3xl" />
      </div>

      {/* زر العودة للرئيسية */}
      <a
        href="/"
        className="absolute top-6 right-6 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-md hover:bg-white text-slate-700 hover:text-[#F08784] px-5 py-3 rounded-full font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border border-slate-200"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>العودة للرئيسية</span>
      </a>

      <div className="relative z-10 bg-white p-8 sm:p-12 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200/50 backdrop-blur-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Image src="/logo2.png" alt="هابي مومنتس" width={140} height={50} className="object-contain" />
          </div>
          
          <div className="inline-flex items-center gap-2 bg-[#F08784]/10 text-[#F08784] px-4 py-2 rounded-full text-sm font-bold mb-4">
           {/* <Sparkles size={16} />*/}
            <span>مرحباً بعودتك</span>
          </div>
          
          <h1 className="text-3xl font-black text-slate-900 mb-2">تسجيل الدخول (للإدارة)</h1>
          <p className="text-slate-600 text-base">سجل دخولك لإدارة فعالياتك بكل سهولة</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-2">
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full pl-12 pr-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#F08784] focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                placeholder="example@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full pl-12 pr-12 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#F08784] focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-[#F08784] transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center select-none cursor-pointer group">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="w-4 h-4 text-[#F08784] border-slate-300 rounded focus:ring-[#F08784]"
              />
              <span className="ml-2 text-sm text-slate-700 group-hover:text-slate-900">تذكرني</span>
            </label>
            <a href="/forgot-password" className="text-sm font-semibold text-[#F08784] hover:text-[#D97673] transition-colors">
              نسيت كلمة المرور؟
            </a>
          </div>

          <Button
            type="submit"
            loading={loading}
            className={cn(
              'w-full py-4 px-4 rounded-xl font-bold text-white text-base',
              'transition-all transform active:scale-[0.98]',
              'bg-[#F08784] hover:bg-[#D97673] shadow-lg hover:shadow-xl',
              loading && 'bg-slate-400 cursor-not-allowed hover:bg-slate-400'
            )}
          >
            <LogIn size={20} className="ml-2" />
            تسجيل الدخول
          </Button>
        </form>
      </div>
    </div>
  );
}
