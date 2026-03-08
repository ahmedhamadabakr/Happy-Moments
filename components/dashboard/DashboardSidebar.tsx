'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  Home,
  UserPlus,
  ImagePlus,
  User,
  QrCode,
} from 'lucide-react';

// This component no longer needs props as it will fetch its own data from the auth store.
export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  // Fetch the user object directly from the auth store.
  const { user } = useAuthStore();
  const [showCheckInMenu, setShowCheckInMenu] = useState(false);
  const [activeEvents, setActiveEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // The parent DashboardLayout ensures that the user object is available here.
  // If for some reason it's not, we can return null or a loading state.
  if (!user) {
    return null; // Or a slim loading skeleton
  }

  // Fetch active events when check-in menu is opened
  useEffect(() => {
    if (showCheckInMenu && activeEvents.length === 0) {
      setLoadingEvents(true);
      fetch('/api/v1/events')
        .then(res => res.json())
        .then(data => {
          const active = (data.events || []).filter((e: any) => e.status === 'active');
          setActiveEvents(active);
        })
        .catch(err => console.error('Error fetching events:', err))
        .finally(() => setLoadingEvents(false));
    }
  }, [showCheckInMenu]);

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
      label: 'إضافة صورة',
      href: '/dashboard/addPhoto',
      icon: ImagePlus,
      role: ['manager', 'employee'],
    },
    {
      label: 'تسجيل الحضور',
      href: '#',
      icon: QrCode,
      role: ['manager', 'employee'],
      isCheckIn: true,
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
      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && item.href !== '#' && pathname.startsWith(`${item.href}/`));
          const isCheckInActive = pathname.includes('/check-in/');

          // Special handling for check-in menu
          if (item.isCheckIn) {
            return (
              <div key="check-in">
                <button
                  onClick={() => setShowCheckInMenu(!showCheckInMenu)}
                  className={cn(
                    'w-full flex items-center gap-4 rounded-lg px-4 py-3 text-base font-medium transition-colors',
                    isCheckInActive
                      ? 'bg-emerald-50 text-emerald-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="flex-1 text-right">{item.label}</span>
                  <svg 
                    className={cn("h-4 w-4 transition-transform", showCheckInMenu && "rotate-180")} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Submenu for active events */}
                {showCheckInMenu && (
                  <div className="mr-9 mt-1 space-y-1">
                    {loadingEvents ? (
                      <div className="px-4 py-2 text-sm text-slate-500">جاري التحميل...</div>
                    ) : activeEvents.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-slate-500">لا توجد فعاليات نشطة</div>
                    ) : (
                      activeEvents.map((event) => (
                        <button
                          key={event._id}
                          onClick={() => router.push(`/dashboard/check-in/${event._id}`)}
                          className={cn(
                            'w-full text-right px-4 py-2 text-sm rounded-lg transition-colors',
                            pathname === `/dashboard/check-in/${event._id}`
                              ? 'bg-emerald-50 text-emerald-700 font-semibold'
                              : 'text-slate-600 hover:bg-slate-50'
                          )}
                        >
                          {event.title}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-4 rounded-lg px-4 py-3 text-base font-medium transition-colors',
                isActive
                  ? 'bg-[#F08784]/10 text-[#F08784] font-bold'
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
