'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSidebar } from './DashboardSidebar';
import { Loader2 } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  // **THE FIX**: We are now using the new `status` field from our refactored store.
  const { user, status, checkAuth } = useAuthStore();
  const router = useRouter();

  // This effect runs ONCE when the component mounts if the status is 'loading'.
  // It's responsible for starting the authentication check.
  useEffect(() => {
    if (status === 'loading') {
      checkAuth();
    }
  }, [status, checkAuth]);

  // This effect is responsible for reacting to the *result* of the auth check.
  useEffect(() => {
    // When the check is complete and the result is 'unauthenticated', redirect.
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  // 1. If the status is 'loading', show a full-screen loader.
  // This is the correct behavior while we wait for the server's response.
  if (status === 'loading') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-12 w-12 animate-spin text-amber-600" />
      </div>
    );
  }

  // 2. If the status is 'authenticated' and we have a user, render the full dashboard.
  // This is the successful state.
  if (status === 'authenticated' && user) {
    return (
      <div className="flex min-h-screen bg-slate-50" dir="rtl">
        {/* These components now safely fetch their own data from the store */}
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </div>
    );
  }

  // 3. If the status is 'unauthenticated', the redirection effect is handling it.
  // We return null here to prevent any part of the dashboard from rendering and causing a flash.
  return null;
}
