import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Eye, CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'لوحة التحكم | إدارة الفعاليات',
  description: 'لوحة تحكم إدارة الفعاليات الخاصة بك',
};

export default function DashboardPage() {
  const stats = [
    {
      title: 'إجمالي الفعاليات',
      value: '0',
      description: 'الفعاليات المنشأة هذا الشهر',
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'إجمالي جهات الاتصال',
      value: '0',
      description: 'جهات الاتصال في قاعدة بياناتك',
      icon: Users,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'الدعوات المرسلة',
      value: '0',
      description: 'الدعوات المرسلة هذا الشهر',
      icon: Eye,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'الضيوف المؤكدون',
      value: '0',
      description: 'الضيوف الذين أكدوا الحضور',
      icon: CheckCircle,
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6" dir="rtl">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">مرحباً بك في مدير الفعاليات</h1>
            <p className="mt-2 text-slate-600">إدارة فعالياتك وضيوفك بفعالية</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <div className={`rounded-lg p-2 ${stat.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-slate-600 pt-1">{stat.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>ابدأ</CardTitle>
              <CardDescription>إعداد منصة إدارة الفعاليات الخاصة بك</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">أنشئ أول فعالية لك</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      اذهب إلى قسم الفعاليات لإنشاء فعالية جديدة وبدء إدارتها
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">استيراد أو إضافة جهات اتصال</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      ارفع قائمة جهات الاتصال الخاصة بك أو أضف الضيوف يدوياً لدعوتهم إلى الفعاليات
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">إرسال الدعوات</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      أرسل دعوات شخصية عبر البريد الإلكتروني أو الواتساب
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">تتبع الردود</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      راقب الحضور وإدارة تأكيدات الضيوف في الوقت الفعلي
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
