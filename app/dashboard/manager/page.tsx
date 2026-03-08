'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, Users, Calendar, TrendingUp, Activity, 
  UserPlus, BarChart3, Clock, CheckCircle 
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

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
    {
      title: 'التقارير والإحصائيات',
      description: 'عرض تقارير الأداء',
      icon: BarChart3,
      color: 'bg-violet-500',
      href: '/dashboard/events'
    }
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

        {/* Recent Activity */}
        <Card className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-slate-900">النشاط الأخير</h2>
            <div className="p-2 bg-slate-100 rounded-xl">
              <Clock className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          
          {stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.slice(0, 10).map((activity) => (
                <div key={activity._id} className="flex items-start gap-4 p-4 bg-gradient-to-r from-slate-50 to-white rounded-2xl border border-slate-200 hover:border-[#F08784]/30 hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#F08784] to-[#D97673] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">
                      {activity.userId?.firstName} {activity.userId?.lastName}
                    </p>
                    <p className="text-sm text-slate-600 mt-1 font-medium">
                      {getActivityDescription(activity)}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(activity.createdAt).toLocaleString('ar-SA')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">لا يوجد نشاط حديث</p>
            </div>
          )}
        </Card>
      </div>
    </div>
    </DashboardLayout>
  );
}

function getActivityDescription(activity: ActivityItem): string {
  const type = activity.activityType;
  const details = activity.details;
  
  switch (type) {
    case 'event_create':
      return `قام بإنشاء فعالية: ${details?.eventName || 'غير محدد'}`;
    case 'event_update':
      return `قام بتحديث فعالية: ${details?.eventName || 'غير محدد'}`;
    case 'event_delete':
      return `قام بحذف فعالية: ${details?.eventName || 'غير محدد'}`;
    case 'contact_create':
      return `قام بإضافة جهة اتصال جديدة`;
    case 'invitation_send':
      return `قام بإرسال دعوات لفعالية`;
    default:
      return 'نشاط في النظام';
  }
}
