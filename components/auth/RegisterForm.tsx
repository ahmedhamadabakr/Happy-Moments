'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { registerCompanySchema, RegisterCompanyInput } from '@/lib/validations/auth';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';

export function RegisterForm() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const setCompany = useAuthStore((state) => state.setCompany);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const form = useForm<RegisterCompanyInput>({
    resolver: zodResolver(registerCompanySchema),
    defaultValues: {
      companyName: '',
      companyEmail: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterCompanyInput) => {
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || 'Registration failed');
        return;
      }

      setSuccessMessage('Registration successful! Redirecting...');
      if (result.data) {
        setUser(result.data.user);
        setCompany(result.data.company);
      }

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error) {
      setErrorMessage('An error occurred during registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create Your Account</CardTitle>
        <CardDescription>Register your company and create your admin account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Company Information */}
          <div className="space-y-4">
            <div className="text-sm font-semibold text-foreground">Company Information</div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="companyName" className="text-sm font-medium">
                  Company Name
                </label>
                <Input
                  id="companyName"
                  {...form.register('companyName')}
                  placeholder="Your Company"
                  disabled={isSubmitting}
                />
                {form.formState.errors.companyName && (
                  <p className="text-sm text-red-600">{form.formState.errors.companyName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="companyEmail" className="text-sm font-medium">
                  Company Email
                </label>
                <Input
                  id="companyEmail"
                  type="email"
                  {...form.register('companyEmail')}
                  placeholder="company@example.com"
                  disabled={isSubmitting}
                />
                {form.formState.errors.companyEmail && (
                  <p className="text-sm text-red-600">{form.formState.errors.companyEmail.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Admin User Information */}
          <div className="space-y-4">
            <div className="text-sm font-semibold text-foreground">Admin Account</div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  First Name
                </label>
                <Input
                  id="firstName"
                  {...form.register('firstName')}
                  placeholder="John"
                  disabled={isSubmitting}
                />
                {form.formState.errors.firstName && (
                  <p className="text-sm text-red-600">{form.formState.errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Last Name
                </label>
                <Input
                  id="lastName"
                  {...form.register('lastName')}
                  placeholder="Doe"
                  disabled={isSubmitting}
                />
                {form.formState.errors.lastName && (
                  <p className="text-sm text-red-600">{form.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="john@example.com"
                disabled={isSubmitting}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="space-y-4">
            <div className="text-sm font-semibold text-foreground">Security</div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                {...form.register('password')}
                placeholder="Enter a strong password"
                disabled={isSubmitting}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
              )}
              <p className="text-xs text-gray-600">
                Must contain uppercase, lowercase, number, and special character
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                {...form.register('confirmPassword')}
                placeholder="Confirm your password"
                disabled={isSubmitting}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-red-600">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          {/* Messages */}
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

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              Sign in here
            </a>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
