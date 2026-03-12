'use client'
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type GalleryImage = {
    _id: string;
    title: string;
    category: string;
    imageUrl: string;
    publicId: string;
    createdAt?: string;
};

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
    const [randomImages, setRandomImages] = useState<GalleryImage[]>([]);

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
                const res = await fetch('/api/photos', { cache: 'no-store' });
                const data = await res.json();
                if (!res.ok || !data?.success) {
                    return;
                }
                if (!mounted) return;
                
                const grouped = data.data.grouped || {};
                const allImages: GalleryImage[] = [];
                Object.entries(grouped).forEach(([category, imgs]: [string, any]) => {
                    allImages.push(...imgs);
                });

                const shuffled = allImages.sort(() => 0.5 - Math.random());
                const selected = shuffled.slice(0, 4);
                setRandomImages(selected);
            } catch (e: any) {
                // ignore
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

    if (loading || randomImages.length === 0) {
        return null;
    }

    return (
        <div className="relative py-16 px-4 md:px-8" dir="rtl">
            <motion.div
                className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={containerVariants}
            >
                {randomImages.map((img) => (
                    <motion.div
                        key={img._id}
                        variants={cardVariants}
                        className="group relative w-full h-[480px] rounded-[2rem] overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-xl hover:shadow-2xl transition-all duration-700 cursor-pointer border-2 border-slate-200/50"
                        whileHover={{ y: -12, scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <div className="absolute inset-0 p-4 flex items-center justify-center">
                            <img
                                src={img.imageUrl}
                                alt={img.title}
                                className="max-w-full max-h-full object-contain transition-all duration-700 group-hover:scale-110 drop-shadow-2xl"
                            />
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/98 via-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />

                        <div className="absolute inset-0 flex flex-col justify-end p-7 z-10 opacity-0 group-hover:opacity-100 transition-all duration-700">
                            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                                <h3 className="text-white text-2xl font-black mb-3 drop-shadow-2xl leading-tight">
                                    {img.title}
                                </h3>
                                <div className="w-20 h-1.5 bg-gradient-to-r from-[#F08784] to-[#D97673] rounded-full mb-4 shadow-lg"></div>
                                <span className="inline-block bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold">
                                    {categoryLabels[img.category] || img.category}
                                </span>
                            </div>
                        </div>

                        <div className="absolute inset-0 rounded-[2rem] border-2 border-[#F08784]/0 group-hover:border-[#F08784]/50 transition-all duration-700"></div>
                    </motion.div>
                ))}
            </motion.div>

            <div className="text-center">
                <Link 
                    href="/gallery" 
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F08784] to-[#D97673] hover:from-[#D97673] hover:to-[#C86562] text-white px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                    <span>مشاهدة المزيد</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
            </div>
        </div>
    );
}
