'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        router.push('/dashboard'); // Redirect after state is updated.
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
    <div className="min-h-screen bg-gradient-to-br from-[#F3F4F6] via-white to-white flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-lg w-full max-w-md border border-slate-200">
        <div className="text-center mb-10">
           <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full mb-5 shadow-lg">
            <LogIn className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-900">مرحباً بعودتك</h1>
          <p className="text-slate-600 mt-3 text-lg">سجل دخولك لإدارة فعالياتك</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
                className="w-full pl-12 pr-4 py-3.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
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
                className="w-full pl-12 pr-12 py-3.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center select-none">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500"
              />
              <span className="ml-2 text-sm text-slate-700">تذكرني</span>
            </label>
            <a href="#" className="text-sm font-medium text-amber-600 hover:text-amber-700">
              نسيت كلمة المرور؟
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              'w-full py-4 px-4 rounded-lg font-bold text-white text-base',
              'transition-all transform active:scale-[0.98]',
              'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-500 shadow-lg hover:shadow-xl',
              {'bg-slate-400 cursor-not-allowed from-slate-400 to-slate-400': loading}
            )}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري التحقق...
              </span>
            ) : (
              'تسجيل الدخول'
            )}
          </button>
        </form>

        <div className="text-center mt-8">
          <p className="text-sm text-slate-600">
            ليس لديك حساب؟{' '}
            <a href="/register" className="font-bold text-amber-600 hover:text-amber-700">
              سجل الآن
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
