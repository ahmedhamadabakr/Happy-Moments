'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { loginSchema, LoginInput } from '@/lib/validations/auth';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const setCompany = useAuthStore((state) => state.setCompany);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || 'Login failed');
        return;
      }

      if (result.success && result.data) {
        setUser(result.data.user);
        setCompany(result.data.user.company);
        setSuccessMessage('Login successful! Redirecting...');
        
        // Small delay to ensure state is saved
        await new Promise(resolve => setTimeout(resolve, 500));
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      setErrorMessage('An error occurred during login. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              {...form.register('email')}
              placeholder="you@example.com"
              disabled={isSubmitting}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              {...form.register('password')}
              placeholder="Enter your password"
              disabled={isSubmitting}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
            )}
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">{successMessage}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="text-blue-600 hover:underline">
              Create one here
            </a>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
