'use client'
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Sparkles, Image as ImageIcon } from 'lucide-react';

type GalleryImage = {
    _id: string;
    title: string;
    category: string;
    imageUrl: string;
    publicId: string;
    createdAt?: string;
};

// إعدادات الحركة للحاوية الرئيسية (Stagger children)
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1,
        },
    },
};

// إعدادات الحركة لكل عنصر (Card)
const cardVariants = {
    hidden: { scale: 0.8, opacity: 0, y: 20 },
    visible: {
        scale: 1,
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 120,
            damping: 12,
        },
    },
};

export default function EventGrid() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [grouped, setGrouped] = useState<Record<string, GalleryImage[]>>({});

    // ترجمة أسماء الفئات
    const categoryLabels: Record<string, string> = {
        engagement: 'عقد قران',
        betrothal: 'خطوبة',
        wedding: 'زفاف',
        birth: 'ولادة',
        birth_reception: 'استقبال ولادة',
        graduation: 'تخرج',
        dazza: 'دزة',
        men_invitation: 'دعوات رجال',
        ghabqa: 'غبقة',
        ramadan_congratulation: 'تهنئة رمضان',
        eid_congratulation: 'تهنئة بالعيد',
        qarqiean: 'قرقيعان',
        other: 'أخرى',
    };

    useEffect(() => {
        let mounted = true;
        const run = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch('/api/photos', { cache: 'no-store' });
                const data = await res.json();
                if (!res.ok || !data?.success) {
                    throw new Error(data?.error || 'فشل تحميل الصور');
                }
                if (!mounted) return;
                setGrouped(data.data.grouped || {});
            } catch (e: any) {
                if (!mounted) return;
                setError(e?.message || 'فشل تحميل الصور');
            } finally {
                if (!mounted) return;
                setLoading(false);
            }
        };

        run();
        return () => {
            mounted = false;
        };
    }, []);

    const categoryEntries = useMemo(() => Object.entries(grouped), [grouped]);

    return (
        <div className="relative py-16 px-4 md:px-8" dir="rtl">
            {/* عنوان المعرض بتصميم عصري */}
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 bg-[#F08784]/10 text-[#F08784] px-5 py-2 rounded-full text-sm font-bold mb-6">
                    <Sparkles size={18} />
                    <span>معرض أعمالنا</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                    تصاميم <span className="text-[#F08784]">مميزة</span> لكل مناسبة
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    استعرض مجموعة من أجمل تصاميمنا التي صممناها بحب لعملائنا
                </p>
            </div>

            {loading ? (
                <div className="max-w-7xl mx-auto text-center py-20">
                    <div className="inline-flex items-center gap-3 text-slate-600">
                        <div className="w-6 h-6 border-3 border-[#F08784] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-lg">جاري تحميل الصور...</span>
                    </div>
                </div>
            ) : error ? (
                <div className="max-w-7xl mx-auto text-center py-20">
                    <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-6 py-3 rounded-full">
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                </div>
            ) : categoryEntries.length === 0 ? (
                <div className="max-w-7xl mx-auto text-center py-20">
                    <div className="inline-flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                            <ImageIcon size={32} className="text-slate-400" />
                        </div>
                        <p className="text-slate-600 text-lg">لا توجد صور بعد</p>
                    </div>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto space-y-20">
                    {categoryEntries.map(([category, images]) => (
                        <section key={category} className="relative">
                            {/* عنوان الفئة */}
                            <div className="mb-10 flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-1.5 h-10 bg-gradient-to-b from-[#F08784] to-[#D97673] rounded-full shadow-md"></div>
                                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                                        {categoryLabels[category] || category}
                                    </h2>
                                </div>
                                <span className="bg-gradient-to-r from-[#F08784]/10 to-[#D97673]/10 text-[#F08784] px-5 py-2.5 rounded-full text-sm font-bold shadow-sm border border-[#F08784]/20">
                                    {images.length} تصميم
                                </span>
                            </div>

                            {/* Container with scroll buttons */}
                            <div className="relative group/slider">
                                {/* Right Arrow */}
                                <button
                                    onClick={() => {
                                        const container = document.getElementById(`scroll-${category}`);
                                        if (container) container.scrollBy({ left: 450, behavior: 'smooth' });
                                    }}
                                    className="absolute -right-6 top-1/2 -translate-y-1/2 z-30 bg-gradient-to-br from-[#F08784] to-[#D97673] hover:from-[#D97673] hover:to-[#C86562] text-white shadow-2xl rounded-full p-5 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_30px_rgba(240,135,132,0.5)]"
                                    aria-label="التالي"
                                >
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>

                                {/* Left Arrow */}
                                <button
                                    onClick={() => {
                                        const container = document.getElementById(`scroll-${category}`);
                                        if (container) container.scrollBy({ left: -450, behavior: 'smooth' });
                                    }}
                                    className="absolute -left-6 top-1/2 -translate-y-1/2 z-30 bg-gradient-to-br from-[#F08784] to-[#D97673] hover:from-[#D97673] hover:to-[#C86562] text-white shadow-2xl rounded-full p-5 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_30px_rgba(240,135,132,0.5)]"
                                    aria-label="السابق"
                                >
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                {/* شبكة الصور - Horizontal Scroll */}
                                <motion.div
                                    id={`scroll-${category}`}
                                    className="flex gap-8 overflow-x-auto pb-8 px-4 scrollbar-hide scroll-smooth snap-x snap-mandatory"
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: "-100px" }}
                                    variants={containerVariants}
                                >
                                    {images.map((img) => (
                                        <motion.div
                                            key={img._id}
                                            variants={cardVariants}
                                            className="group relative flex-shrink-0 w-80 h-[480px] rounded-[2rem] overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-xl hover:shadow-2xl transition-all duration-700 cursor-pointer snap-center border-2 border-slate-200/50"
                                            whileHover={{ y: -12, scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                        >
                                            {/* الصورة */}
                                            <div className="absolute inset-0 p-4 flex items-center justify-center">
                                                <img
                                                    src={img.imageUrl}
                                                    alt={img.title}
                                                    className="max-w-full max-h-full object-contain transition-all duration-700 group-hover:scale-110 drop-shadow-2xl"
                                                />
                                            </div>

                                            {/* تدرج لوني أنيق */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/98 via-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />

                                            {/* محتوى البطاقة */}
                                            <div className="absolute inset-0 flex flex-col justify-end p-7 z-10 opacity-0 group-hover:opacity-100 transition-all duration-700">
                                                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                                                    {/* عنوان التصميم */}
                                                    <h3 className="text-white text-2xl font-black mb-3 drop-shadow-2xl leading-tight">
                                                        {img.title}
                                                    </h3>
                                                    
                                                    {/* شريط زخرفي */}
                                                    <div className="w-20 h-1.5 bg-gradient-to-r from-[#F08784] to-[#D97673] rounded-full mb-4 shadow-lg"></div>
                                                    
                                                    {/* نوع المناسبة */}
                                                    <span className="inline-block bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold">
                                                        {categoryLabels[category] || category}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* أيقونة زخرفية في الزاوية */}
                                            <div className="absolute top-5 right-5 w-12 h-12 bg-gradient-to-br from-[#F08784]/20 to-[#D97673]/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 z-10 border border-white/30">
                                                <Sparkles size={20} className="text-white drop-shadow-lg" />
                                            </div>

                                            {/* Border effect on hover */}
                                            <div className="absolute inset-0 rounded-[2rem] border-2 border-[#F08784]/0 group-hover:border-[#F08784]/50 transition-all duration-700"></div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </div>
                        </section>
                    ))}
                </div>
            )}

            {/* خلفية زخرفية */}
            <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-72 h-72 bg-[#F08784]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />
            </div>
        </div>
    );
}
