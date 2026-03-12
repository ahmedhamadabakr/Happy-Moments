'use client'
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Sparkles, Image as ImageIcon, ArrowRight, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type GalleryImage = {
    _id: string;
    title: string;
    category: string;
    imageUrl: string;
    publicId: string;
    createdAt?: string;
};

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

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.05,
        },
    },
};

const cardVariants = {
    hidden: { scale: 0.85, opacity: 0, y: 30 },
    visible: {
        scale: 1,
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 100,
            damping: 15,
        },
    },
    exit: {
        scale: 0.85,
        opacity: 0,
        transition: { duration: 0.2 }
    }
};

export default function GalleryPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [allImages, setAllImages] = useState<GalleryImage[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

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
                
                // تحويل الصور المجمعة إلى قائمة واحدة
                const grouped = data.data.grouped || {};
                const images: GalleryImage[] = [];
                Object.entries(grouped).forEach(([category, imgs]: [string, any]) => {
                    images.push(...imgs);
                });
                setAllImages(images);
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

    // الحصول على الفئات المتاحة
    const availableCategories = Array.from(new Set(allImages.map(img => img.category)));

    // فلترة الصور حسب الفئة المختارة
    const filteredImages = selectedCategory === 'all' 
        ? allImages 
        : allImages.filter(img => img.category === selectedCategory);

    const toggleFavorite = (id: string) => {
        setFavorites(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100" dir="rtl">
            {/* Navbar */}
            <header className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-slate-300 bg-slate-50/95 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <Image src="/logo2.png" alt="هابي مومنتس" width={120} height={40} className="object-contain" priority />
                </div>
                <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-[#F08784] transition-colors font-medium">
                    <span>العودة للرئيسية</span>
                    <ArrowRight size={20} />
                </Link>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-16">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-[#F08784]/10 text-[#F08784] px-5 py-2 rounded-full text-sm font-bold mb-6 animate-fade-in">
                        <Sparkles size={18} />
                        <span>معرض أعمالنا</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
                        معرض <span className="text-[#F08784]">الأعمال</span>
                    </h1>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                        استلهم من أجمل تصاميمنا لمناسباتك القادمة، تحول لمناسباتكم الخاصة إلى ذكريات رقمية خالدة تتسم بالأناقة والتميز
                    </p>
                </div>

                {/* Category Filters */}
                <div className="mb-12">
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                                selectedCategory === 'all'
                                    ? 'bg-gradient-to-r from-[#F08784] to-[#D97673] text-white shadow-lg scale-105'
                                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                        >
                            الكل
                        </button>
                        {availableCategories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                                    selectedCategory === category
                                        ? 'bg-gradient-to-r from-[#F08784] to-[#D97673] text-white shadow-lg scale-105'
                                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                }`}
                            >
                                {categoryLabels[category] || category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center gap-3 text-slate-600">
                            <div className="w-8 h-8 border-4 border-[#F08784] border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-lg font-medium">جاري تحميل الصور...</span>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-6 py-3 rounded-full">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && filteredImages.length === 0 && (
                    <div className="text-center py-20">
                        <div className="inline-flex flex-col items-center gap-4">
                            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
                                <ImageIcon size={40} className="text-slate-400" />
                            </div>
                            <p className="text-slate-600 text-xl font-medium">لا توجد صور في هذه الفئة</p>
                        </div>
                    </div>
                )}

                {/* Gallery Grid */}
                {!loading && !error && filteredImages.length > 0 && (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        key={selectedCategory}
                    >
                        <AnimatePresence mode="wait">
                            {filteredImages.map((img) => (
                                <motion.div
                                    key={img._id}
                                    variants={cardVariants}
                                    layout
                                    className="group relative w-full h-[500px] rounded-[2rem] overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-xl hover:shadow-2xl transition-all duration-700 cursor-pointer border-2 border-slate-200/50"
                                    whileHover={{ y: -12, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {/* الصورة */}
                                    <div className="absolute inset-0 p-6 flex items-center justify-center">
                                        <img
                                            src={img.imageUrl}
                                            alt={img.title}
                                            className="max-w-full max-h-full object-contain transition-all duration-700 group-hover:scale-110 drop-shadow-2xl"
                                        />
                                    </div>

                                    {/* تدرج لوني */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/98 via-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />

                                    {/* محتوى البطاقة */}
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

                                    {/* زر المفضلة */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFavorite(img._id);
                                        }}
                                        className="absolute top-5 left-5 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 z-20 hover:scale-110 shadow-lg"
                                    >
                                        <Heart 
                                            size={20} 
                                            className={`transition-all ${
                                                favorites.has(img._id) 
                                                    ? 'fill-[#F08784] text-[#F08784]' 
                                                    : 'text-slate-600'
                                            }`}
                                        />
                                    </button>

                                    {/* أيقونة زخرفية */}
                                    <div className="absolute top-5 right-5 w-12 h-12 bg-gradient-to-br from-[#F08784]/20 to-[#D97673]/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 z-10 border border-white/30">
                                        <Sparkles size={20} className="text-white drop-shadow-lg" />
                                    </div>

                                    {/* Border effect */}
                                    <div className="absolute inset-0 rounded-[2rem] border-2 border-[#F08784]/0 group-hover:border-[#F08784]/50 transition-all duration-700"></div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Stats Section */}
                {!loading && !error && filteredImages.length > 0 && (
                    <div className="mt-16 text-center">
                        <div className="inline-flex items-center gap-6 bg-white rounded-2xl px-8 py-5 shadow-lg border border-slate-200">
                            <div className="text-center">
                                <div className="text-3xl font-black text-[#F08784] mb-1">{filteredImages.length}</div>
                                <div className="text-sm text-slate-600 font-medium">تصميم</div>
                            </div>
                            <div className="w-px h-12 bg-slate-300"></div>
                            <div className="text-center">
                                <div className="text-3xl font-black text-[#F08784] mb-1">{availableCategories.length}</div>
                                <div className="text-sm text-slate-600 font-medium">فئة</div>
                            </div>
                            <div className="w-px h-12 bg-slate-300"></div>
                            <div className="text-center">
                                <div className="text-3xl font-black text-[#F08784] mb-1">{favorites.size}</div>
                                <div className="text-sm text-slate-600 font-medium">مفضلة</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="py-12 border-t border-slate-300 bg-slate-100 text-center text-slate-600 text-sm">
                <p>© {new Date().getFullYear()} هابي مومنتس. جميع الحقوق محفوظة - صنع بكل حب في الكويت 🇰🇼</p>
            </footer>

            {/* خلفية زخرفية */}
            <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-96 h-96 bg-[#F08784]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />
            </div>
        </main>
    );
}
