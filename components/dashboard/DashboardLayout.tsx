'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSidebar } from './DashboardSidebar';
import { Loader2 } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {

  const { user, status, checkAuth } = useAuthStore();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // check authentication
  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  // loading state
  if (status === 'loading') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-12 w-12 animate-spin text-[#F08784]" />
      </div>
    );
  }

  // authenticated state
  if (status === 'authenticated' && user) {
    return (
      <div className="flex min-h-screen bg-slate-50" dir="rtl">

        {/* Sidebar */}
        <DashboardSidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
        />

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">

          <DashboardHeader
            openSidebar={() => setSidebarOpen(true)}
          />

          <main className="flex-1 p-6 lg:p-8">
            {children}
          </main>

        </div>

      </div>
    );
  }

  return null;
}
