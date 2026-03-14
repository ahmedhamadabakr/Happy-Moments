'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield, Users, Calendar, TrendingUp, Activity,
  UserPlus, BarChart3, Clock, CheckCircle
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/shared/Card';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface DashboardStats {
  totalEmployees: number;
  totalEvents: number;
  totalGuests: number;
  activeEvents: number;
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  _id: string;
  activityType: string;
  details: any;
  createdAt: string;
  userId: {
    firstName: string;
    lastName: string;
  };
}

export default function ManagerDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    try {
      const response = await fetch('/api/auth/profile');
      const data = await response.json();

      if (!data.success || !data.data || !data.data.user || data.data.user.role !== 'manager') {
        router.push('/dashboard');
        return;
      }

      setAuthorized(true);
      fetchStats();
    } catch (error) {
      console.error('Authorization check failed:', error);
      router.push('/dashboard');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/manager/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!authorized || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F08784] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">{!authorized ? 'جاري التحقق من الصلاحيات...' : 'جاري تحميل البيانات...'}</p>
        </div>
      </div>
    );
  }

  const gettingStartedSteps = [
    {
      step: 1,
      title: 'أنشئ أول فعالية لك',
      description: 'اذهب إلى قسم الفعاليات لإنشاء فعالية جديدة وبدء إدارتها',
      link: '/dashboard/events/create',
      color: 'bg-[#F08784]/10 text-[#F08784]',
      hoverColor: 'hover:bg-[#F08784] hover:text-white',
    },
    {
      step: 2,
      title: 'استيراد أو إضافة جهات اتصال',
      description: 'ارفع قائمة جهات الاتصال الخاصة بك أو أضف الضيوف يدوياً لدعوتهم إلى الفعاليات',
      link: '/dashboard/clients',
      color: 'bg-emerald-50 text-emerald-600',
      hoverColor: 'hover:bg-emerald-600 hover:text-white',
    },
    {
      step: 3,
      title: 'إرسال الدعوات',
      description: 'أرسل دعوات شخصية عبر البريد الإلكتروني أو الواتساب',
      link: '/dashboard/events',
      color: 'bg-violet-50 text-violet-600',
      hoverColor: 'hover:bg-violet-600 hover:text-white',
    },
    {
      step: 4,
      title: 'تتبع الردود',
      description: 'راقب الحضور وإدارة تأكيدات الضيوف في الوقت الفعلي',
      link: '/dashboard/events',
      color: 'bg-violet-50 text-violet-600',
      hoverColor: 'hover:bg-violet-600 hover:text-white',
    },
  ];
  const quickActions = [
    {
      title: 'إضافة موظف جديد',
      description: 'إضافة موظف للنظام',
      icon: UserPlus,
      color: 'bg-[#F08784]',
      href: '/register'
    },
    {
      title: 'إدارة الموظفين',
      description: 'عرض وإدارة جميع الموظفين',
      icon: Users,
      color: 'bg-emerald-500',
      href: '/dashboard/users'
    },
  
  ];

  return (
    <DashboardLayout>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6" dir="rtl">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <Card className="bg-gradient-to-br from-[#F08784]/5 via-white to-violet-50/30 rounded-3xl shadow-lg p-8 border-none">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#F08784] to-[#D97673] rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">لوحة تحكم المدير</h1>
                <p className="text-lg text-slate-600 mt-2 font-medium">مرحباً بك في لوحة التحكم الخاصة بالمدير العام</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">إجمالي الموظفين</p>
                    <p className="text-4xl font-black mt-2 text-slate-900">{stats?.totalEmployees || 0}</p>
                  </div>
                  <div className="p-3 bg-[#F08784]/10 rounded-xl">
                    <Users className="w-8 h-8 text-[#F08784]" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">إجمالي الفعاليات</p>
                    <p className="text-4xl font-black mt-2 text-slate-900">{stats?.totalEvents || 0}</p>
                  </div>
                  <div className="p-3 bg-violet-100 rounded-xl">
                    <Calendar className="w-8 h-8 text-violet-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">الفعاليات النشطة</p>
                    <p className="text-4xl font-black mt-2 text-slate-900">{stats?.activeEvents || 0}</p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <Activity className="w-8 h-8 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">إجمالي الضيوف</p>
                    <p className="text-4xl font-black mt-2 text-slate-900">{stats?.totalGuests || 0}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-4">إجراءات سريعة</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => router.push(action.href)}
                  className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 hover:shadow-lg hover:border-[#F08784]/30 transition-all transform hover:scale-105 text-right"
                >
                  <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center mb-4 shadow-md`}>
                    <action.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2 text-lg">{action.title}</h3>
                  <p className="text-sm text-slate-600">{action.description}</p>
                </button>
              ))}
            </div>
          </div>

          <Card className="border-slate-200 shadow-md rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-[#F08784]/5 border-b border-slate-100">
              <CardTitle className="text-2xl font-bold text-slate-900">ابدأ الآن</CardTitle>
              <CardDescription className="text-slate-600 text-base">خطوات بسيطة لإطلاق فعاليتك الأولى</CardDescription>
            </CardHeader>
            <CardContent className="pt-8 pb-8">
              <div className="space-y-2">
                {gettingStartedSteps.map((step) => (
                  <Link href={step.link} key={step.step}>
                    <div className="flex items-start gap-5 group p-4 rounded-2xl hover:bg-slate-50 transition-all duration-200 cursor-pointer">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${step.color} font-black text-lg ${step.hoverColor} transition-all duration-300 group-hover:scale-110 flex-shrink-0`}>
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 text-lg">{step.title}</h3>
                        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}