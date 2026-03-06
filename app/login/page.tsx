'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import ModernLoginForm from '@/components/auth/ModernLoginForm';
import { Loader2 } from 'lucide-react';

// Metadata can't be dynamically exported from a client component,
// but we can manage the title if needed using useEffect.
// For simplicity, we'll rely on the static metadata from the layout.

export default function LoginPage() {
  const { status, checkAuth } = useAuthStore();
  const router = useRouter();

  // Like in DashboardLayout, we must initiate an auth check if the status is 'loading'.
  useEffect(() => {
    if (status === 'loading') {
      checkAuth();
    }
  }, [status, checkAuth]);

  // This effect handles redirection *away* from the login page if the user is already authenticated.
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  // 1. While the auth status is being determined, show a loader.
  // This prevents the login form from flashing on the screen for users who are already logged in.
  if (status === 'loading') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-12 w-12 animate-spin text-amber-600" />
      </div>
    );
  }

  // 2. If the auth check is complete and the user is *not* authenticated, show the login form.
  // This is the primary purpose of the login page.
  if (status === 'unauthenticated') {
    return <ModernLoginForm />;
  }

  // 3. If the status is 'authenticated', the redirection effect is running.
  // Return null to prevent the login form from rendering during the redirect.
  return null;
}
