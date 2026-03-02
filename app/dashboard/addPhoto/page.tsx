'use client';
import { useState } from 'react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6" dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold text-[#1A2E26] mb-6 text-center">إضافة صورة جديدة للمعرض</h1>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* حقل الاسم */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم المناسبة</label>
            <input 
              name="title" 
              required 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C1A286] outline-none transition-all"
              placeholder="مثال: حفل تخرج جامعة..."
            />
          </div>

          {/* حقل النوع */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نوع المناسبة</label>
            <select name="category" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C1A286] outline-none">
              <option value="corporate">حفلات شركات</option>
              <option value="wedding">حفلات زفاف</option>
              <option value="graduation">تخرج</option>
              <option value="national">فعاليات وطنية</option>
            </select>
          </div>

          {/* حقل الصورة */}
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

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
              loading ? 'bg-gray-400' : 'bg-[#1A2E26] hover:bg-[#2a4a3d]'
            }`}
          >
            {loading ? 'جاري الرفع...' : 'حفظ ونشر'}
          </button>
        </form>
      </div>
    </div>
  );
}