'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Zap, CheckCircle, LogInIcon, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import EventGrid from '@/components/ui/EventGrid';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = ['/herosection1.png', '/herosection2.png', '/herosection3.png'];
  
  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const whatsappNumber = '01012345678'; 
  const whatsappMessage = 'مرحباً، أريد الاستفسار عن خدمات هابي مومنتس';
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <main className="min-h-screen bg-slate-100 selection:bg-[#F08784]/20" dir="rtl">
      
      {/* Navbar - تحسين الشكل ليكون أكثر عصرية */}
      <header className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-slate-300 bg-slate-50/95 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Image src="/logo2.png" alt="هابي مومنتس - Happy Moments" width={120} height={40} className="object-contain" priority />
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="flex items-center gap-2 text-slate-600 hover:text-[#F08784] transition-colors font-medium">
            <span>تسجيل دخول</span>
            <LogInIcon size={20} />
          </Link>
          <Button onClick={() => window.open(whatsappLink, '_blank')} className="bg-[#F08784] hover:bg-[#D97673] text-white rounded-full px-6">
            ابدأ الآن
          </Button>
        </div>
      </header>

      {/* Hero Section - تحسين توزيع العناصر والـ SEO */}
      <section className="relative overflow-hidden pt-20 pb-28 px-6 text-center bg-slate-100">
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

         {/* Hero Images Slider */}
          <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] overflow-hidden py-16">
            <div className="relative max-w-5xl mx-auto">
              {/* Slider Container */}
              <div className="relative w-[92%] mx-auto rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                <div className="relative aspect-[7/3]">
                  {slides.map((slide, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-700 ${
                        index === currentSlide ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <Image 
                        src={slide} 
                        alt={`صورة ${index + 1} - هابي مومنتس`}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      />
                    </div>
                  ))}
                </div>

                {/* Navigation Buttons */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-200/90 hover:bg-slate-300 text-slate-800 rounded-full p-3 shadow-lg transition-all hover:scale-110"
                  aria-label="الصورة السابقة"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-200/90 hover:bg-slate-300 text-slate-800 rounded-full p-3 shadow-lg transition-all hover:scale-110"
                  aria-label="الصورة التالية"
                >
                  <ChevronRight size={24} />
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentSlide 
                          ? 'bg-[#F08784] w-8' 
                          : 'bg-slate-300/80 hover:bg-slate-400'
                      }`}
                      aria-label={`انتقل إلى الصورة ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* خلفية جمالية */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 opacity-20 pointer-events-none">
            <div className="absolute top-20 left-10 w-64 h-64 bg-[#F08784] rounded-full blur-[120px]" />
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-300 rounded-full blur-[120px]" />
        </div>
      </section>

   {/* About Section - براندينج الشركة */}
      <section className=" px-6 bg-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-6 flex items-center justify-center gap-2">
            <Sparkles className="text-[#F08784]" /> نبذة عن هابي مومنتس
          </h1>
          <p className="text-2xl text-slate-600 leading-loose text-center">
            <strong className="text-slate-900">هابي مومنتس (Happy Moments)</strong> هي شركة كويتية متخصصة في تصميم دعوات التهنئة الإلكترونية بأسلوب عصري وأنيق. نقدم تصاميم مميزة لمختلف المناسبات مثل الأعراس، التخرج، والولادات، لنخلّد أجمل لحظاتكم بأسلوب رقمي راقي وسهل المشاركة.
          </p>
        </div>
      </section>

      {/* Features & Steps Section - Combined */}
      <section className="px-6 py-24 bg-slate-100">
        <div className="max-w-6xl mx-auto">
          
          <EventGrid />

          {/* عنوان القسم */}
          <div className="text-center mb-16 mt-20">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              خدماتنا <span className="text-[#F08784]">المميزة</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              كل ما تحتاجه لإدارة فعالياتك باحترافية وسهولة
            </p>
          </div>

          {/* Features Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-32">
            <FeatureCard
              icon={<Calendar className="h-8 w-8" />}
              title="إدارة الفعاليات"
              description="أنشئ وأدر عدد لا محدود من الفعاليات مع تحديثات فورية ومباشرة."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="إدارة الضيوف"
              description="استيراد جهات الاتصال، تتبع الحضور، وتقسيم الضيوف بكل سهولة وسلاسة."
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              title="دعوات ذكية"
              description="أرسل عبر الواتساب أو الإيميل مع تحليلات دقيقة لمن فتح الدعوة."
            />
          </div>
        </div>  
      </section>
          
      {/* Final CTA */}
      <section className="px-6  bg-slate-100">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">هل أنت مستعد لرفع مستوى فعالياتك؟</h2>
            <p className="text-slate-400 mb-10 text-lg">انضم إلى آلاف المستخدمين الذين يثقون بـ هابي مومنتس</p>
            <Button size="lg" className="bg-[#F08784] hover:bg-[#D97673] text-white text-xl px-12 py-8 rounded-2xl transition-all hover:scale-105" onClick={() => window.open(whatsappLink, '_blank')}>
              ابدأ تجربتك المجانية الآن
            </Button>
          </div>
          {/* لمسة فنية في الخلفية */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F08784]/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 border-t border-slate-300 bg-slate-100 text-center text-slate-600 text-sm">
        <p>© {new Date().getFullYear()} هابي مومنتس. جميع الحقوق محفوظة - صنع بكل حب في الكويت 🇰🇼</p>
      </footer>
    </main>
  );
}

// مكونات فرعية محسنة
function FeatureCard({ icon, title, description }: any) {
  return (
    <article className="relative p-10 rounded-3xl transition-all duration-300 bg-white hover:shadow-xl group text-center">
      {/* الأيقونة */}
      <div className="h-20 w-20 flex items-center justify-center bg-[#F08784]/10 text-[#F08784] rounded-2xl mb-6 mx-auto group-hover:bg-[#F08784]/20 transition-colors">
        {icon}
      </div>
      
      <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
      <p className="text-slate-600 leading-relaxed text-sm">{description}</p>
      
    </article>
  );
}

function Step({ number, title, desc }: any) {
  return (
    <div className="relative p-10 bg-white rounded-3xl transition-all duration-300 hover:shadow-xl group text-center">
      {/* الأيقونة */}
      <div className="h-20 w-20 flex items-center justify-center bg-[#F08784]/10 text-[#F08784] rounded-2xl mb-6 mx-auto text-2xl font-black group-hover:bg-[#F08784]/20 transition-colors">
        {number}
      </div>
      
      <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
      <p className="text-slate-600 leading-relaxed text-sm">{desc}</p>
      
      {/* زر Learn More */}
      <button className="mt-6 text-[#F08784] text-sm font-semibold hover:text-[#D97673] transition-colors">
        اعرف أكثر →
      </button>
    </div>
  );
}