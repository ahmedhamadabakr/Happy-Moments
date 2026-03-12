'use client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Image as ImageIcon, Upload, Edit, Trash2, Grid, Plus, X } from 'lucide-react';

interface Photo {
  _id: string;
  title: string;
  category: string;
  imageUrl: string;
  publicId: string;
  createdAt: string;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const res = await fetch('/api/upload_photo');
      const data = await res.json();
      if (data.success) {
        setPhotos(data.data);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    if (file) formData.append('file', file);

    try {
      const res = await fetch('/api/upload_photo', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        alert('تم رفع الصورة بنجاح!');
        (e.target as HTMLFormElement).reset();
        setFile(null);
        fetchPhotos();
      } else {
        let message = 'فشل الرفع';
        try {
          const data = await res.json();
          message = data?.error || data?.message || message;
        } catch {
          // ignore
        }
        alert(message);
      }
    } catch (err) {
      alert('فشل الرفع');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;

    try {
      const res = await fetch('/api/upload_photo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingPhoto?._id, title, category }),
      });

      if (res.ok) {
        alert('تم تعديل الصورة بنجاح!');
        setEditingPhoto(null);
        fetchPhotos();
      } else {
        const data = await res.json();
        alert(data?.error || 'فشل التعديل');
      }
    } catch (err) {
      alert('فشل التعديل');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الصورة؟')) return;

    try {
      const res = await fetch(`/api/upload_photo?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('تم حذف الصورة بنجاح!');
        fetchPhotos();
      } else {
        const data = await res.json();
        alert(data?.error || 'فشل الحذف');
      }
    } catch (err) {
      alert('فشل الحذف');
    }
  };

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

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <Card className="bg-gradient-to-br from-[#F08784]/5 via-white to-violet-50/30 rounded-3xl p-8 border-none shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#F08784] to-[#D97673] rounded-2xl flex items-center justify-center shadow-lg">
                <ImageIcon className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">إدارة الصور</h1>
                <p className="text-lg text-slate-600 mt-2 font-medium">إضافة وتعديل صور المعرض</p>
              </div>
            </div>
            <Button
              onClick={() => setShowGallery(!showGallery)}
              className={showGallery 
                ? "bg-[#F08784] hover:bg-[#D97673] text-white font-semibold shadow-md" 
                : "bg-white hover:bg-[#F08784]/5 border-2 border-slate-300 hover:border-[#F08784] text-slate-900 font-semibold shadow-sm"
              }
            >
              {showGallery ? (
                <>
                  <Plus className="ml-2 h-5 w-5" />
                  إضافة صورة جديدة
                </>
              ) : (
                <>
                  <Grid className="ml-2 h-5 w-5" />
                  عرض المعرض
                </>
              )}
            </Button>
          </div>
        </Card>

        {!showGallery ? (
          <Card className="border-slate-200 shadow-lg rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b">
              <CardTitle className="text-2xl font-bold text-slate-900">
                {editingPhoto ? 'تعديل صورة' : 'إضافة صورة جديدة للمعرض'}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-8">
              <form onSubmit={editingPhoto ? handleEdit : handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-bold text-slate-700">اسم المناسبة</Label>
                  <Input
                    id="title"
                    name="title"
                    required
                    defaultValue={editingPhoto?.title}
                    className="text-lg p-6 border-2 border-slate-300 focus:border-[#F08784] rounded-xl"
                    placeholder="مثال: حفل تخرج جامعة..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-base font-bold text-slate-700">نوع المناسبة</Label>
                  <select
                    id="category"
                    name="category"
                    defaultValue={editingPhoto?.category}
                    className="w-full text-lg p-6 border-2 border-slate-300 focus:border-[#F08784] rounded-xl outline-none focus:ring-2 focus:ring-[#F08784]/20"
                  >
                    <option value="engagement">عقد قران</option>
                    <option value="betrothal">خطوبة</option>
                    <option value="wedding">زفاف</option>
                    <option value="birth">ولادة</option>
                    <option value="birth_reception">استقبال ولادة</option>
                    <option value="graduation">تخرج</option>
                    <option value="dazza">دزة</option>
                    <option value="men_invitation">دعوات رجال</option>
                    <option value="ghabqa">غبقة</option>
                    <option value="ramadan_congratulation">تهنئة رمضان</option>
                    <option value="eid_congratulation">تهنئة بالعيد</option>
                    <option value="qarqiean">قرقيعان</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>

                {!editingPhoto && (
                  <div className="space-y-2">
                    <Label className="text-base font-bold text-slate-700">الصورة</Label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-[#F08784] hover:bg-[#F08784]/5 transition-all cursor-pointer relative bg-gradient-to-br from-white to-slate-50/50">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        required
                      />
                      <Upload className="w-12 h-12 text-[#F08784] mx-auto mb-3" />
                      <div className="text-slate-700 font-medium">
                        {file ? (
                          <span className="text-emerald-600 font-bold text-lg">{file.name}</span>
                        ) : (
                          <span className="text-lg">اضغط هنا لاختيار صورة</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-6 text-lg rounded-xl font-bold bg-[#F08784] hover:bg-[#D97673] text-white shadow-md"
                  >
                    {loading ? 'جاري الحفظ...' : (editingPhoto ? 'حفظ التعديل' : 'حفظ ونشر')}
                  </Button>

                  {editingPhoto && (
                    <Button
                      type="button"
                      onClick={() => setEditingPhoto(null)}
                      variant="outline"
                      className="px-8 py-6 text-lg border-2 border-slate-300 hover:bg-slate-50 font-semibold rounded-xl"
                    >
                      <X className="ml-2 h-5 w-5" />
                      إلغاء
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.length === 0 ? (
              <Card className="col-span-full border-slate-200 rounded-3xl">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-10 h-10 text-slate-400" />
                  </div>
                  <p className="text-slate-500 text-lg font-medium">لا توجد صور في المعرض</p>
                </CardContent>
              </Card>
            ) : (
              photos.map((photo) => (
                <Card key={photo._id} className="border-slate-200 hover:border-[#F08784]/30 hover:shadow-xl transition-all rounded-3xl overflow-hidden group">
                  <div className="relative overflow-hidden">
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <CardContent className="p-5 bg-gradient-to-br from-white to-slate-50/50">
                    <h3 className="font-bold text-xl mb-2 text-slate-900">{photo.title}</h3>
                    <p className="text-[#F08784] font-semibold text-sm mb-4 bg-[#F08784]/10 inline-block px-3 py-1 rounded-full">
                      {categoryLabels[photo.category]}
                    </p>
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => {
                          setEditingPhoto(photo);
                          setShowGallery(false);
                        }}
                        variant="outline"
                        className="flex-1 border-2 border-slate-300 hover:border-[#F08784] hover:bg-[#F08784]/5 hover:text-[#F08784] font-semibold rounded-xl"
                      >
                        <Edit className="ml-2 h-4 w-4" />
                        تعديل
                      </Button>
                      <Button
                        onClick={() => handleDelete(photo._id)}
                        variant="outline"
                        className="flex-1 border-2 border-red-300 hover:border-red-500 hover:bg-red-50 hover:text-red-600 font-semibold rounded-xl"
                      >
                        <Trash2 className="ml-2 h-4 w-4" />
                        حذف
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}