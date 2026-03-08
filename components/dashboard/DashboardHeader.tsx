'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User as UserIcon } from 'lucide-react';

export function DashboardHeader() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push('/login');
  };

  if (!user) {
    return null; // The layout should prevent this, but it's a good safeguard.
  }

  // **THE FIX**: Create robust variables to handle both old (firstName/lastName) and new (fullName) user structures.
  const userFullName = (user as any).fullName || `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim();
  const userFirstName = userFullName.split(' ')[0] || 'المستخدم';
  const userInitial = userFullName.charAt(0).toUpperCase() || 'U';

  return (
    <header className="border-b border-slate-200 bg-white px-6 py-4" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">لوحة التحكم</h2>
          {/* Now safely displays the first name */}
          <p className="text-sm text-slate-600">أهلاً بعودتك، {userFirstName}!</p>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-lg font-semibold text-amber-700">
                  {/* Safely displays the initial */}
                  {userInitial}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64" dir="rtl">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-md font-semibold text-slate-900">
                    {/* Safely displays the full name */}
                    {userFullName}
                  </p>
                  <p className="text-xs text-slate-600">{user.email}</p>
                  <p className="text-xs text-slate-500 capitalize pt-1">الدور: {user.role}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push('/dashboard/profile')}
                className="cursor-pointer p-2 text-base"
              >
                <UserIcon className="ml-2 h-4 w-4" />
                <span></span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 p-2 text-base"
              >
                <LogOut className="ml-2 h-4 w-4" />
                <span>{isLoggingOut ? 'جاري تسجيل الخروج...' : 'تسجيل الخروج'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
