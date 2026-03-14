import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Eye, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'لوحة التحكم | إدارة الفعاليات',
  description: 'لوحة تحكم إدارة الفعاليات الخاصة بك',
};
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
export default function DashboardPage() {

  

  return (
    // The protection is now handled by DashboardLayout
    <DashboardLayout>
      <div className="space-y-8" dir="rtl">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-[#F08784]/5 via-white to-violet-50/30 rounded-3xl p-8 border border-slate-100 shadow-sm">
          <h1 className="text-4xl font-black text-slate-900">مرحباً بك في مدير الفعاليات 👋</h1>
          <p className="mt-3 text-lg text-slate-600">إدارة فعالياتك وضيوفك بفعالية واحترافية</p>
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
        {/* Getting Started Card */}

      </div>
    </DashboardLayout>
  );
}
