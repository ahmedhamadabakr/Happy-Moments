'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, X } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
            <Image src="/logo2.png" alt="Happy Moments" width={80} height={80} className="mx-auto" />
            <h1 className="text-3xl font-bold text-slate-900 mt-4">نسيت كلمة المرور؟</h1>
            <p className="text-slate-600">لا تقلق، أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيينها.</p>
        </div>
        <Card className="border-slate-200 shadow-lg rounded-2xl">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <X className="h-4 w-4" />
                  <AlertTitle>خطأ</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {successMessage ? (
                <Alert variant="default" className='bg-green-50 border-green-200 text-green-800'>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle>تم الإرسال</AlertTitle>
                    <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              ) : (
                 <Button type="submit" className="w-full" disabled={loading} loading={loading} size="lg">
                    إرسال رابط الاستعادة
                </Button>
              )}
            </form>

            <div className="mt-6 text-center text-sm">
                <Link href="/login" className="font-medium text-amber-600 hover:text-amber-500">
                    العودة إلى تسجيل الدخول
                </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
