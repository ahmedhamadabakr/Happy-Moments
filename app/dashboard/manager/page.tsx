'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield, Users, Calendar, TrendingUp, Activity,
  UserPlus, ArrowLeft, Sparkles, CheckCircle2
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';

interface DashboardStats {
  totalEmployees: number;
  totalEvents: number;
  totalGuests: number;
  activeEvents: number;
}

export default function ManagerDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    try {
      const response = await fetch('/api/auth/profile');
      const data = await response.json();
      if (!data.success || !data.data?.user || data.data.user.role !== 'manager') {
        router.push('/dashboard');
        return;
      }
      setAuthorized(true);
      fetchStats();
    } catch {
      router.push('/dashboard');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/manager/stats');
      const data = await response.json();
      if (data.success) setStats(data.stats);
    } catch {
      console.error('Error fetching stats');
    } finally {
      setLoading(false);
    }
  };

  if (!authorized || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F08784] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const statsCards = [
    { label: 'إجمالي الموظفين', value: stats?.totalEmployees ?? 0, icon: Users, color: 'text-[#F08784]', bg: 'bg-[#F08784]/10' },
    { label: 'إجمالي الفعاليات', value: stats?.totalEvents ?? 0, icon: Calendar, color: 'text-violet-600', bg: 'bg-violet-100' },
    { label: 'الفعاليات النشطة', value: stats?.activeEvents ?? 0, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'إجمالي الضيوف', value: stats?.totalGuests ?? 0, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100' },
  ];

  const quickActions = [
    { title: 'إضافة موظف جديد', description: 'إضافة موظف للنظام', icon: UserPlus, color: 'bg-[#F08784]', href: '/register' },
    { title: 'إدارة الموظفين', description: 'عرض وإدارة جميع الموظفين', icon: Users, color: 'bg-emerald-500', href: '/dashboard/users' },
  ];

  const steps = [
    { n: 1, title: 'أنشئ أول فعالية', desc: 'اذهب إلى قسم الفعاليات لإنشاء فعالية جديدة وبدء إدارتها', href: '/dashboard/events/create', color: 'bg-[#F08784] text-white' },
    { n: 2, title: 'أضف جهات الاتصال', desc: 'ارفع قائمة جهات الاتصال أو أضف الضيوف يدوياً لدعوتهم', href: '/dashboard/clients', color: 'bg-emerald-500 text-white' },
    { n: 3, title: 'أرسل الدعوات', desc: 'أرسل دعوات شخصية عبر البريد الإلكتروني أو الواتساب', href: '/dashboard/events', color: 'bg-violet-500 text-white' },
    { n: 4, title: 'تتبع الحضور', desc: 'راقب الحضور وتأكيدات الضيوف في الوقت الفعلي', href: '/dashboard/events', color: 'bg-blue-500 text-white' },
  ];

  return (
    <DashboardLayout>
      <div dir="rtl" className="space-y-8 pb-10">

        {/* Header */}
        <div className="bg-gradient-to-br from-[#F08784]/10 via-white to-violet-50/50 rounded-3xl p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-16 h-16 bg-[#F08784] rounded-2xl flex items-center justify-center shadow-lg shadow-[#F08784]/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900">لوحة تحكم المدير</h1>
              <p className="text-slate-500 mt-1 text-lg">
                مرحباً{user?.fullName ? `، ${user.fullName}` : ''} 👋
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statsCards.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-slate-500 text-sm font-medium">{s.label}</p>
                  <div className={`p-2 ${s.bg} rounded-xl`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                </div>
                <p className={`text-4xl font-black ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#F08784]" />
            إجراءات سريعة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => router.push(action.href)}
                className="bg-white rounded-3xl border border-slate-200 p-6 hover:shadow-lg hover:border-[#F08784]/30 transition-all hover:-translate-y-0.5 text-right group"
              >
                <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">{action.title}</h3>
                <p className="text-sm text-slate-500">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-[#F08784]/5">
            <h2 className="text-2xl font-black text-slate-900">ابدأ الآن</h2>
            <p className="text-slate-500 mt-1">خطوات بسيطة لإطلاق فعاليتك الأولى</p>
          </div>
          <div className="p-6 space-y-3">
            {steps.map((step) => (
              <Link href={step.href} key={step.n}>
                <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all group cursor-pointer border border-transparent hover:border-slate-200">
                  <div className={`w-11 h-11 ${step.color} rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm`}>
                    {step.n}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">{step.title}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{step.desc}</p>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-slate-300 group-hover:text-[#F08784] transition-colors flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
