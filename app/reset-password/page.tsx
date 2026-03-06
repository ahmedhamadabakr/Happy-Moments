'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (resetToken) {
      setToken(resetToken);
    } else {
      setError('رابط إعادة التعيين غير صالح أو مفقود.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== passwordConfirmation) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }
    
    if (!token) {
        setError('لا يمكن المتابعة بدون رمز صالح.')
        return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'فشل في إعادة تعيين كلمة المرور');
      }

      setSuccessMessage('تم تغيير كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.');
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
            <h1 className="text-3xl font-bold text-slate-900 mt-4">إعادة تعيين كلمة المرور</h1>
            <p className="text-slate-600">أدخل كلمة المرور الجديدة أدناه.</p>
        </div>
        <Card className="border-slate-200 shadow-lg rounded-2xl">
          <CardContent className="p-8">
            {successMessage ? (
                <div className='text-center space-y-4'>
                    <Alert variant="default" className='bg-green-50 border-green-200 text-green-800'>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle>نجاح!</AlertTitle>
                        <AlertDescription>{successMessage}</AlertDescription>
                    </Alert>
                    <Link href="/login">
                        <Button className="w-full" size="lg">الذهاب إلى تسجيل الدخول</Button>
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="password">كلمة المرور الجديدة</Label>
                    <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="passwordConfirmation">تأكيد كلمة المرور الجديدة</Label>
                    <Input
                    id="passwordConfirmation"
                    type="password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
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

                <Button type="submit" className="w-full" disabled={loading || !token} loading={loading} size="lg">
                    تغيير كلمة المرور
                </Button>
                </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
