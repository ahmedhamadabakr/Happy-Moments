'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User as UserType, Company as CompanyType } from '@/lib/store/authStore';
import { cn } from '@/lib/utils';
import { Calendar, Users, Settings, BarChart3, Home } from 'lucide-react';

interface DashboardSidebarProps {
  user: UserType;
  company: CompanyType;
}

export function DashboardSidebar({ user, company }: DashboardSidebarProps) {
  const pathname = usePathname();

  const navigationItems = [
    {
      label: 'Overview',
      href: '/dashboard',
      icon: Home,
      role: ['manager', 'admin', 'user'],
    },
    {
      label: 'Events',
      href: '/dashboard/events',
      icon: Calendar,
      role: ['manager', 'admin', 'user'],
    },
    {
      label: 'Contacts',
      href: '/dashboard/contacts',
      icon: Users,
      role: ['manager', 'admin'],
    },
    {
      label: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
      role: ['manager', 'admin'],
    },
    {
      label: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      role: ['manager', 'admin', ],
    },
    {
      label: 'v2',
      href: '/dashboard/v2',
      icon: Settings,
      role: ['manager', 'admin', 'user'],
    },
    {
      label: 'whatsapp',
      href: '/dashboard/whatsapp',
      icon: Settings,
      role: ['manager', 'admin', 'user'],
    },

  ];

  const visibleItems = navigationItems.filter((item) => item.role.includes(user.role));

  return (
    <aside className="w-64 border-r border-slate-200 bg-white">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
            EM
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Event Manager</h1>
            <p className="text-xs text-slate-600">{company.name}</p>
          </div>
        </Link>
      </div>

      <nav className="space-y-1 px-3 py-6">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-700 hover:bg-slate-50'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="text-xs text-slate-600">
          <p className="font-semibold text-slate-700">Logged in as</p>
          <p>{user.firstName} {user.lastName}</p>
          <p className="mt-1 text-slate-500">{user.email}</p>
        </div>
      </div>
    </aside>
  );
}
