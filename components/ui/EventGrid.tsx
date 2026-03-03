'use client'
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

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
            staggerChildren: 0.2, // الفارق الزمني بين ظهور كل عنصر وآخر
        },
    },
};

// إعدادات الحركة لكل عنصر (Card)
const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: 'spring', // نوع حركة مرن وطبيعي
            stiffness: 100,
            damping: 15,
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
        <div className="min-h-screen bg-gray-50 px-4 md:px-8" dir="rtl">
            {/* عنوان اختياري للمعرض */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-[#1A2E26] mb-2">معرض الصور</h1>
                <div className="w-24 h-1 bg-[#C1A286] mx-auto rounded-full"></div>
            </div>

            {loading ? (
                <div className="max-w-7xl mx-auto text-center text-gray-600">جاري تحميل الصور...</div>
            ) : error ? (
                <div className="max-w-7xl mx-auto text-center text-red-600">{error}</div>
            ) : categoryEntries.length === 0 ? (
                <div className="max-w-7xl mx-auto text-center text-gray-600">لا توجد صور بعد.</div>
            ) : (
                <div className="max-w-7xl mx-auto space-y-10">
                    {categoryEntries.map(([category, images]) => (
                        <section key={category}>
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-2xl font-extrabold text-[#1A2E26]">{category}</h2>
                                <span className="text-sm text-gray-500">{images.length} صورة</span>
                            </div>

                            <motion.div
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                                initial="hidden"
                                animate="visible"
                                variants={containerVariants}
                            >
                                {images.map((img) => (
                                    <motion.div
                                        key={img._id}
                                        variants={cardVariants}
                                        className="group relative h-96 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
                                        whileHover={{ y: -10 }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#1A2E26]/90 via-[#1A2E26]/40 to-transparent z-10 opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

                                        <img
                                            src={img.imageUrl}
                                            alt={img.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />

                                        <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-center transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                            <span className="inline-block bg-white/10 backdrop-blur-sm text-white px-6 py-2 rounded-full text-lg font-semibold border border-white/20 tracking-wide antialiased">
                                                {img.title}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}