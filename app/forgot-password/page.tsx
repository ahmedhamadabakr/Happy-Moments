'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, X, Mail, KeyRound, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'فشل إرسال رابط استعادة كلمة المرور');
      }

      setSuccessMessage('تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد الخاص بك.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-[#F08784]/5 to-violet-50/30 p-4 relative overflow-hidden" dir="rtl">
      {/* خلفية زخرفية */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-[#F08784]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-violet-400/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Image src="/logo2.png" alt="هابي مومنتس" width={140} height={50} className="object-contain" />
          </div>
          
          <div className="inline-flex items-center gap-2 bg-[#F08784]/10 text-[#F08784] px-4 py-2 rounded-full text-sm font-bold mb-4">
            <KeyRound size={16} />
            <span>استعادة كلمة المرور</span>
          </div>
          
          <h1 className="text-3xl font-black text-slate-900 mb-3">نسيت كلمة المرور؟</h1>
          <p className="text-slate-600 text-base leading-relaxed">
            لا تقلق، أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيينها
          </p>
        </div>

        {/* Card */}
        <Card className="border-slate-200/50 shadow-2xl rounded-3xl bg-white backdrop-blur-sm">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold text-slate-700">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-12 pr-4 py-3.5 border-slate-300 rounded-xl focus:ring-2 focus:ring-[#F08784] focus:border-transparent bg-slate-50 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="rounded-xl border-red-200 bg-red-50">
                  <X className="h-5 w-5 text-red-600" />
                  <AlertTitle className="font-bold text-red-800">خطأ</AlertTitle>
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              {successMessage ? (
                <Alert variant="default" className="bg-emerald-50 border-emerald-200 text-emerald-800 rounded-xl">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <AlertTitle className="font-bold text-emerald-900">تم الإرسال بنجاح ✓</AlertTitle>
                  <AlertDescription className="text-emerald-700 leading-relaxed">{successMessage}</AlertDescription>
                </Alert>
              ) : (
                <Button 
                  type="submit" 
                  className="w-full bg-[#F08784] hover:bg-[#D97673] text-white py-4 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all" 
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      جاري الإرسال...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Mail size={20} />
                      إرسال رابط الاستعادة
                    </span>
                  )}
                </Button>
              )}
            </form>

            <div className="mt-8 pt-6 border-t border-slate-200 text-center">
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 font-semibold text-[#F08784] hover:text-[#D97673] transition-colors text-sm group"
              >
                <ArrowRight size={18} className="group-hover:-translate-x-1 transition-transform" />
                العودة إلى تسجيل الدخول
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* معلومة إضافية */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            لم تستلم الرسالة؟ تحقق من مجلد الرسائل غير المرغوب فيها (Spam)
          </p>
        </div>
      </div>
    </div>
  );
}
