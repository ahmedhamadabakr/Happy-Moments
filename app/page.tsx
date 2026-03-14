'use client';

import { Button } from '@/components/ui/button';
import { Calendar, Users, Zap, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import EventGrid from '@/components/ui/EventGrid';
import { useState, useEffect } from 'react';

export default function HomePage() {
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

  const whatsappNumber = '96565594787';
  const whatsappMessage = 'مرحباً، أريد الاستفسار عن خدمات هابي مومنتس؟';
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
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
            صمم <span className="text-[#F08784] dark:text-[#F08784]">دعوات</span> تبيّض الوجه <br />
            <span className="text-slate-700 text-4xl md:text-5xl font-bold">وإدارة ضيوفك.. بضغطة زر</span>
          </h1>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            كل اللي تحتاجه عشان تصمم وتدز وتتابع دعوات مناسباتك — بمكان واحد يريحك ويجمع لك كل التفاصيل بأسلوب راقي.
          </p>

          {/* Hero Images Slider */}
          <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] overflow-hidden py-16">
            <div className="relative max-w-5xl mx-auto">
              {/* Slider Container */}
              <div className="relative w-[99%] mx-auto rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                <div className="relative aspect-[16/10]">
                  {slides.map((slide, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-700 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
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
                      className={`w-3 h-3 rounded-full transition-all touch-manipulation ${index === currentSlide
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
      <section id="about" className=" px-6 bg-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-slate-800 mb-6 flex items-center justify-center gap-2">
            <Sparkles className="text-[#F08784]" /> نبذة عن هابي مومنتس
          </h2>
          <p className="text-2xl text-slate-600 leading-loose text-center">
            <strong className="text-slate-900">هابي مومنتس (Happy Moments)</strong> هي شركة كويتية متخصصة في تصميم دعوات التهنئة الإلكترونية بأسلوب عصري وأنيق. نقدم تصاميم مميزة لمختلف المناسبات مثل الأعراس، التخرج، والولادات، لنخلّد أجمل لحظاتكم بأسلوب رقمي راقي وسهل المشاركة.
          </p>
        </div>
      </section>

      {/* Features & Steps Section - Combined */}
      <section id="services" className="px-6 py-24 bg-slate-100">
        <div className="max-w-6xl mx-auto">

          <EventGrid />

          {/* عنوان القسم */}
          <div className="text-center mb-16 mt-20">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              خدماتنا <span className="text-[#F08784] dark:text-[#F08784]">المميزة</span>
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

      {/* Footer */}
      <footer className="py-12 border-t border-slate-300 bg-slate-100 mt-10" dir="rtl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 mb-10">
            {/* معلومات الشركة */}
            <div>
              <div className="mb-6">
                <Image src="/logo2.png" alt="هابي مومنتس" width={140} height={50} className="object-contain" />
              </div>
              <p className="text-slate-600 leading-relaxed">
                نخلّد أجمل لحظاتكم بتصاميم دعوات إلكترونية راقية وعصرية، نصمم بحب لكل مناسباتكم الخاصة
              </p>
            </div>

            {/* روابط سريعة */}
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-[#F08784] to-[#D97673] rounded-full"></div>
                روابط سريعة
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="/" className="text-slate-600 hover:text-[#F08784] transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full group-hover:bg-[#F08784] transition-colors"></span>
                    الرئيسية
                  </a>
                </li>
                <li>
                  <a href="/#about" className="text-slate-600 hover:text-[#F08784] transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full group-hover:bg-[#F08784] transition-colors"></span>
                    نبذة عنا
                  </a>
                </li>
                <li>
                  <a href="/gallery" className="text-slate-600 hover:text-[#F08784] transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full group-hover:bg-[#F08784] transition-colors"></span>
                    معرض الأعمال
                  </a>
                </li>
              </ul>
            </div>

            {/* تواصل معنا */}
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-[#F08784] to-[#D97673] rounded-full"></div>
                تواصل معنا
              </h3>
              {/* أيقونات التواصل */}
              <div className="flex items-center gap-4">
                <a
                  href="https://www.instagram.com/happy.moments.q8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 bg-white hover:bg-gradient-to-br hover:from-[#F08784] hover:to-[#D97673] rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg group border-2 border-slate-200"
                  aria-label="انستجرام"
                >
                  <svg className="w-6 h-6 text-slate-700 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href="https://wa.me/96565594787?text=مرحباً، أريد الاستفسار عن خدمات هابي مومنتس؟"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 bg-white hover:bg-gradient-to-br hover:from-[#25D366] hover:to-[#128C7E] rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg group border-2 border-slate-200"
                  aria-label="واتساب"
                >
                  <svg className="w-6 h-6 text-slate-700 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* خط فاصل */}
          <div className="border-t border-slate-300 pt-8">
            <div className="text-center text-sm text-slate-600">
              <p>© {new Date().getFullYear()} هابي مومنتس. جميع الحقوق محفوظة 🇰🇼</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

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