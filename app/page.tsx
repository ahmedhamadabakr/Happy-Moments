'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Users, Zap, CheckCircle, LogInIcon, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import EventGrid from '@/components/ui/EventGrid';

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-50/50 selection:bg-[#F08784]/20" dir="rtl">
      
      {/* Navbar - تحسين الشكل ليكون أكثر عصرية */}
      <header className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Image src="/logo2.png" alt="هابي مومنتس - Happy Moments" width={120} height={40} className="object-contain" priority />
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="flex items-center gap-2 text-slate-600 hover:text-[#F08784] transition-colors font-medium">
            <span>تسجيل دخول</span>
            <LogInIcon size={20} />
          </Link>
          <Button onClick={() => router.push('/register')} className="bg-[#F08784] hover:bg-[#D97673] text-white rounded-full px-6">
            ابدأ الآن
          </Button>
        </div>
      </header>

      {/* Hero Section - تحسين توزيع العناصر والـ SEO */}
      <section className="relative overflow-hidden pt-20 pb-28 px-6 text-center">
        <div className="max-w-4xl mx-auto relative z-10">
          <span className="inline-block py-1 px-4 rounded-full bg-[#F08784]/10 text-[#F08784] text-sm font-bold mb-6 animate-fade-in">
              بوابتكم لأجمل اللحظات
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 leading-[1.2]">
            صمم <span className="text-[#F08784]">دعوات</span> تبيّض الوجه <br />
            <span className="text-slate-700 text-4xl md:text-5xl font-bold">وإدارة ضيوفك.. بضغطة زر</span>
          </h1>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            كل اللي تحتاجه عشان تصمم وتدز وتتابع دعوات مناسباتك — بمكان واحد يريحك ويجمع لك كل التفاصيل بأسلوب راقي.
          </p>

          {/* Hero Image - إضافة تأثير الظل والبرواز */}
          <div className="relative max-w-3xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-8 border-white group">
            <Image 
              src="/herosection.jpg" 
              alt="واجهة تطبيق هابي مومنتس لتصميم الدعوات" 
              width={800} 
              height={500} 
              className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </div>
        
        {/* خلفية جمالية */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 opacity-20 pointer-events-none">
            <div className="absolute top-20 left-10 w-64 h-64 bg-[#F08784] rounded-full blur-[120px]" />
            <div className="absolute bottom-20 right-10 w-64 h-64 bg-blue-300 rounded-full blur-[120px]" />
        </div>
      </section>

      {/* About Section - براندينج الشركة */}
      <section className="py-20  px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-6 flex items-center justify-center gap-2">
            <Sparkles className="text-[#F08784]" /> نبذة عن هابي مومنتس
          </h1>
          <p className="text-2xl text-slate-600 leading-loose">
            <strong className="text-slate-900">هابي مومنتس (Happy Moments)</strong> هي شركة كويتية متخصصة في تصميم دعوات التهنئة الإلكترونية بأسلوب عصري وأنيق. نقدم تصاميم مميزة لمختلف المناسبات مثل الأعراس، التخرج، والولادات، لنخلّد أجمل لحظاتكم بأسلوب رقمي راقي وسهل المشاركة.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          
          <EventGrid />

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <FeatureCard
              icon={<Calendar className="h-6 w-6" />}
              title="إدارة الفعاليات"
              description="أنشئ وأدر عدد لا محدود من الفعاليات مع تحديثات فورية ومباشرة."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="إدارة الضيوف"
              description="استيراد جهات الاتصال، تتبع الحضور، وتقسيم الضيوف بكل سهولة وسلاسة."
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="دعوات ذكية"
              description="أرسل عبر الواتساب أو الإيميل مع تحليلات دقيقة لمن فتح الدعوة."
            />
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="px-6 py-24 bg-white">
        <h2 className="text-4xl font-bold text-center mb-16">خطوات بسيطة.. وبدون عبالة</h2>
        <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto text-center relative">
          <Step number="1" title="أنشئ فعاليتك" desc="اختر التصميم اللي يناسب ذوقك ومناسبتك" />
          <Step number="2" title="أضف ضيوفك" desc="ارفع قائمة الأسماء بضغطة زر واحدة" />
          <Step number="3" title="أرسل وتابع" desc="دز الدعوات وتابع الحضور أول بأول" />
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">هل أنت مستعد لرفع مستوى فعالياتك؟</h2>
            <p className="text-slate-400 mb-10 text-lg">انضم إلى آلاف المستخدمين الذين يثقون بـ هابي مومنتس</p>
            <Button size="lg" className="bg-[#F08784] hover:bg-[#D97673] text-white text-xl px-12 py-8 rounded-2xl transition-all hover:scale-105" onClick={() => router.push('/register')}>
              ابدأ تجربتك المجانية الآن
            </Button>
          </div>
          {/* لمسة فنية في الخلفية */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F08784]/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 border-t border-slate-100 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} هابي مومنتس. جميع الحقوق محفوظة - صنع بكل حب في الكويت 🇰🇼</p>
      </footer>
    </main>
  );
}

// مكونات فرعية محسنة
function FeatureCard({ icon, title, description }: any) {
  return (
    <article className="p-8 rounded-3xl transition-all duration-300 bg-white border border-slate-100 hover:border-[#F08784]/30 hover:shadow-xl group">
      <div className="h-14 w-14 flex items-center justify-center bg-[#F08784]/10 text-[#F08784] rounded-2xl mb-6 group-hover:bg-[#F08784] group-hover:text-white transition-colors">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3 text-slate-800">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </article>
  );
}

function Step({ number, title, desc }: any) {
  return (
    <div className="relative p-6">
      <div className="text-6xl font-black text-slate-100 absolute top-0 left-1/2 -translate-x-1/2 -z-10">{number}</div>
      <CheckCircle className="mx-auto h-12 w-12 text-[#F08784] mb-4" />
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-slate-500">{desc}</p>
    </div>
  );
}