'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import {
  Calendar,
  Users,
  Home,
  UserPlus,
  LayoutGrid,
  MessageSquare,
  User,
} from 'lucide-react';

// This component no longer needs props as it will fetch its own data from the auth store.
export function DashboardSidebar() {
  const pathname = usePathname();
  // Fetch the user object directly from the auth store.
  const { user } = useAuthStore();

  // The parent DashboardLayout ensures that the user object is available here.
  // If for some reason it's not, we can return null or a loading state.
  if (!user) {
    return null; // Or a slim loading skeleton
  }

  const navigationItems = [
    {
      label: 'نظرة عامة',
      href: '/dashboard',
      icon: Home,
      // Visible to all authenticated users
      role: ['manager', 'employee'],
    },
    {
      label: 'الفعاليات',
      href: '/dashboard/events',
      icon: Calendar,
      role: ['manager', 'employee'],
    },
    {
      label: 'العملاء',
      href: '/dashboard/clients',
      icon: Users,
      role: ['manager', 'employee'],
    },
    {
      label: 'واتساب',
      href: '/dashboard/whatsapp',
      icon: MessageSquare,
      role: ['manager', 'employee'],
    },
    {
      label: 'القوالب',
      href: '/dashboard/templates',
      icon: LayoutGrid,
      role: ['manager', 'employee'],
    },
    {
      label: 'إدارة الموظفين',
      href: '/dashboard/users',
      icon: UserPlus,
      // Visible only to managers
      role: ['manager'],
    },
  ];

  // Filter navigation items based on the current user's role
  const visibleItems = navigationItems.filter((item) => item.role.includes(user.role));

  return (
    <aside className="w-72 border-l border-slate-200 bg-white flex flex-col" dir="rtl">
      {/* Header with Logo */}
      <div className="p-6 flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image src="/logo2.png" alt="Happy Moments Logo" width={48} height={48} />
          <div>
            <h1 className="text-xl font-bold text-slate-900">مدير الفعاليات</h1>
            <p className="text-sm text-slate-600">لوحة التحكم</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-4 rounded-lg px-4 py-3 text-base font-medium transition-colors',
                isActive
                  ? 'bg-amber-50 text-amber-700 font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer with User Info */}
      <div className="border-t border-slate-200 p-4">
         <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
                <p className="font-semibold text-slate-800 text-base">{user.fullName}</p>
                <p className="mt-1 text-xs text-slate-500">{user.email}</p>
            </div>
            <Link href="/dashboard/profile" title="Edit Profile" className='p-2 rounded-lg hover:bg-slate-100 transition-colors'>
                <User className='w-5 h-5 text-slate-600' />
            </Link>
        </div>
      </div>
    </aside>
  );
}
