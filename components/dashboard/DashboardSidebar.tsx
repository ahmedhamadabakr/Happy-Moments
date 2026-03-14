'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useMemo } from 'react';

import {
  Calendar,
  Users,
  Home,
  UserPlus,
  ImagePlus,
  User,
  X
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  setOpen: (v: boolean) => void;
}

export function DashboardSidebar({ open, setOpen }: SidebarProps) {

  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();

  if (!user) return null;

  const navigationItems = useMemo(() => [
    {
      label: 'نظرة عامة',
      href: '/dashboard/manager',
      icon: Home,
      role: ['manager']
    },
    {
      label: 'الفعاليات',
      href: '/dashboard/events',
      icon: Calendar,
      role: ['manager', 'employee']
    },
    {
      label: 'العملاء',
      href: '/dashboard/clients',
      icon: Users,
      role: ['manager', 'employee']
    },
    {
      label: 'إضافة صورة',
      href: '/dashboard/addPhoto',
      icon: ImagePlus,
      role: ['manager', 'employee']
    },
    {
      label: 'إدارة الموظفين',
      href: '/dashboard/users',
      icon: UserPlus,
      role: ['manager']
    }
  ], []);

  const visibleItems = navigationItems.filter(item =>
    item.role.includes(user.role)
  );

  return (

    <aside
      className={cn(
        "fixed top-0 right-0 z-40 h-full w-64 bg-white border-l border-slate-200 flex flex-col transition-transform duration-300",
        open ? "translate-x-0" : "translate-x-full",
        "lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0 lg:shrink-0"
      )}
      dir="rtl"
    >

      {/* Mobile close button */}

      <div className="lg:hidden flex justify-end p-4">

        <button
          onClick={() => setOpen(false)}
          className="p-2 rounded-lg hover:bg-slate-100"
        >

          <X className="w-5 h-5" />

        </button>

      </div>

      {/* Logo */}

      <div className="px-6 pb-4 flex items-center gap-3">

        <Link
          href="/dashboard"
          className="flex items-center gap-3"
          onClick={() => setOpen(false)}
        >

          <Image
            src="/logo2.png"
            alt="Happy Moments"
            width={48}
            height={48}
          />

          <div>

            <h1 className="text-xl font-bold text-slate-900">
              مدير الفعاليات
            </h1>

            <p className="text-sm text-slate-600">
              لوحة التحكم
            </p>

          </div>

        </Link>

      </div>

      {/* Navigation */}

      <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">

        {visibleItems.map((item) => {

          const Icon = item.icon;

          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' &&
              item.href !== '#' &&
              pathname.startsWith(`${item.href}/`));


          return (

            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-4 rounded-lg px-4 py-3 text-base font-medium transition-colors',
                isActive
                  ? 'bg-[#F08784]/10 text-[#F08784] font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              )}
            >

              <Icon className="h-5 w-5" />

              <span>
                {item.label}
              </span>

            </Link>

          );

        })}

      </nav>

      {/* Footer */}

      <div className="border-t border-slate-200 p-4">

        <div className="flex items-center justify-between">

          <div className="text-sm text-slate-600">

            <p className="font-semibold text-slate-800 text-base">
              {user.fullName}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {user.email}
            </p>

          </div>

          <Link
            href="/dashboard/profile"
            className="p-2 rounded-lg hover:bg-slate-100"
          >

            <User className="w-5 h-5 text-slate-600" />

          </Link>

        </div>

      </div>

    </aside>

  );

}
