'use client';

import { ReactNode } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSidebar } from './DashboardSidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, company } = useAuthStore();

  if (!user || !company) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar user={user} company={company} />
      <div className="flex-1">
        <DashboardHeader user={user} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
