'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'manager' | 'employee' | 'client';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    // Only check auth once on mount
    if (!isAuthenticated && !isLoading) {
      checkAuth();
    }
  }, []); // Empty dependency array - run only once

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      if (requiredRole && user?.role !== requiredRole) {
        router.push('/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, user?.role, requiredRole, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
