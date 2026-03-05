'use client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useState, useEffect } from 'react';

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

  return (
    <DashboardLayout>

      <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#1A2E26]">إدارة الصور</h1>
            <button
              onClick={() => setShowGallery(!showGallery)}
              className="px-4 py-2 bg-[#C1A286] text-white rounded-lg hover:bg-[#a08060] transition-colors"
            >
              {showGallery ? 'إضافة صورة جديدة' : 'عرض المعرض'}
            </button>
          </div>

          {!showGallery ? (
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
              <h2 className="text-2xl font-bold text-[#1A2E26] mb-6 text-center">
                {editingPhoto ? 'تعديل صورة' : 'إضافة صورة جديدة للمعرض'}
              </h2>

              <form onSubmit={editingPhoto ? handleEdit : handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم المناسبة</label>
                  <input
                    name="title"
                    required
                    defaultValue={editingPhoto?.title}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C1A286] outline-none transition-all"
                    placeholder="مثال: حفل تخرج جامعة..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نوع المناسبة</label>
                  <select
                    name="category"
                    defaultValue={editingPhoto?.category}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C1A286] outline-none"
                  >
                    <option value="corporate">حفلات شركات</option>
                    <option value="wedding">حفلات زفاف</option>
                    <option value="graduation">تخرج</option>
                    <option value="national">فعاليات وطنية</option>
                  </select>
                </div>

                {!editingPhoto && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#C1A286] transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      required
                    />
                    <div className="text-gray-500">
                      {file ? <span className="text-green-600 font-semibold">{file.name}</span> : "اضغط هنا لاختيار صورة"}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 py-3 rounded-lg font-bold text-white transition-all ${loading ? 'bg-gray-400' : 'bg-[#1A2E26] hover:bg-[#2a4a3d]'
                      }`}
                  >
                    {loading ? 'جاري الحفظ...' : (editingPhoto ? 'حفظ التعديل' : 'حفظ ونشر')}
                  </button>

                  {editingPhoto && (
                    <button
                      type="button"
                      onClick={() => setEditingPhoto(null)}
                      className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      إلغاء
                    </button>
                  )}
                </div>
              </form>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo) => (
                <div key={photo._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{photo.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {photo.category === 'corporate' && 'حفلات شركات'}
                      {photo.category === 'wedding' && 'حفلات زفاف'}
                      {photo.category === 'graduation' && 'تخرج'}
                      {photo.category === 'national' && 'فعاليات وطنية'}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingPhoto(photo);
                          setShowGallery(false);
                        }}
                        className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(photo._id)}
                        className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );

}