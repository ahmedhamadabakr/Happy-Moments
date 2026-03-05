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
            type: 'spring',
            stiffness: 120,
            damping: 12,
        },
    },
};

export default function EventGrid() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [grouped, setGrouped] = useState<Record<string, GalleryImage[]>>({});

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
                            <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-8 bg-[#F08784] rounded-full"></div>
                                    <h2 className="text-3xl font-bold text-slate-900">{category}</h2>
                                </div>
                                <span className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-semibold">
                                    {images.length} تصميم
                                </span>
                            </div>

                            {/* شبكة الصور */}
                            <motion.div
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-100px" }}
                                variants={containerVariants}
                            >
                                {images.map((img) => (
                                    <motion.div
                                        key={img._id}
                                        variants={cardVariants}
                                        className="group relative h-80 rounded-3xl overflow-hidden bg-white shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer"
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {/* الصورة */}
                                        <div className="absolute inset-0 overflow-hidden">
                                            <img
                                                src={img.imageUrl}
                                                alt={img.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        </div>

                                        {/* تدرج لوني أنيق */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/50 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

                                        {/* محتوى البطاقة */}
                                        <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
                                            <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                                {/* عنوان التصميم */}
                                                <h3 className="text-white text-xl font-bold mb-2 drop-shadow-lg">
                                                    {img.title}
                                                </h3>
                                                
                                                {/* شريط زخرفي */}
                                                <div className="w-16 h-1 bg-[#F08784] rounded-full mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                
                                                {/* نص إضافي يظهر عند التمرير */}
                                                <p className="text-white/80 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                                    اضغط للمشاهدة
                                                </p>
                                            </div>
                                        </div>

                                        {/* أيقونة زخرفية في الزاوية */}
                                        <div className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
                                            <Sparkles size={18} className="text-white" />
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
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