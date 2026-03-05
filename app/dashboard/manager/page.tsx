'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, Users, Calendar, TrendingUp, Activity, 
  UserPlus, Settings, BarChart3, Clock, CheckCircle 
} from 'lucide-react';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C1A286] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{!authorized ? 'جاري التحقق من الصلاحيات...' : 'جاري تحميل البيانات...'}</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'إضافة موظف جديد',
      description: 'إضافة موظف للنظام',
      icon: UserPlus,
      color: 'bg-blue-500',
      href: '/register'
    },
    {
      title: 'إدارة الموظفين',
      description: 'عرض وإدارة جميع الموظفين',
      icon: Users,
      color: 'bg-green-500',
      href: '/dashboard/users'
    },
    {
      title: 'إعدادات النظام',
      description: 'إدارة إعدادات الشركة',
      icon: Settings,
      color: 'bg-purple-500',
      href: '/dashboard/settings'
    },
    {
      title: 'التقارير والإحصائيات',
      description: 'عرض تقارير الأداء',
      icon: BarChart3,
      color: 'bg-orange-500',
      href: '/dashboard/events'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1A2E26] to-[#2a4a3d] rounded-xl shadow-lg p-8 mb-6 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">لوحة تحكم المدير</h1>
              <p className="text-white/80 mt-1">مرحباً بك في لوحة التحكم الخاصة بالمدير العام</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">إجمالي الموظفين</p>
                  <p className="text-3xl font-bold mt-1">{stats?.totalEmployees || 0}</p>
                </div>
                <Users className="w-8 h-8 text-white/50" />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">إجمالي الفعاليات</p>
                  <p className="text-3xl font-bold mt-1">{stats?.totalEvents || 0}</p>
                </div>
                <Calendar className="w-8 h-8 text-white/50" />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">الفعاليات النشطة</p>
                  <p className="text-3xl font-bold mt-1">{stats?.activeEvents || 0}</p>
                </div>
                <Activity className="w-8 h-8 text-white/50" />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">إجمالي الضيوف</p>
                  <p className="text-3xl font-bold mt-1">{stats?.totalGuests || 0}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-white/50" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#1A2E26] mb-4">إجراءات سريعة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => router.push(action.href)}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all transform hover:scale-105 text-right"
              >
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#1A2E26]">النشاط الأخير</h2>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          
          {stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivity.slice(0, 10).map((activity) => (
                <div key={activity._id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-[#C1A286] rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.userId?.firstName} {activity.userId?.lastName}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {getActivityDescription(activity)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(activity.createdAt).toLocaleString('ar-SA')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">لا يوجد نشاط حديث</p>
            </div>
          )}
        </div>
      </div>
    </div>
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
