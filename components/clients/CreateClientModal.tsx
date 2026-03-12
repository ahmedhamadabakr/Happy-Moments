import { AlertCircle } from 'lucide-react';
import { Modal } from '@/components/shared/Modal';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: { fullName: string; email: string; phone: string };
  setFormData: (data: any) => void;
  onSave: () => void;
  loading: boolean;
  errors: Record<string, string>;
  title?: string;
  saveButtonText?: string;
}

export const CreateClientModal = ({ 
  isOpen, 
  onClose, 
  formData, 
  setFormData, 
  onSave, 
  loading, 
  errors,
  title = "إضافة عميل جديد",
  saveButtonText = "حفظ العميل"
}: CreateClientModalProps) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    actions={
      <div className="flex gap-3 w-full">
        <button
          onClick={onClose}
          className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-semibold border-2 border-slate-200"
        >
          إلغاء
        </button>
        <button
          onClick={onSave}
          disabled={loading}
          className={`flex-1 px-6 py-3 bg-[#F08784] text-white rounded-xl hover:bg-[#D97673] transition-colors font-bold shadow-md ${loading ? 'opacity-70' : ''}`}
        >
          {loading ? 'جاري الحفظ...' : saveButtonText}
        </button>
      </div>
    }
  >
    <div className="space-y-5">
      <div>
        <label className="block text-base font-bold text-slate-700 mb-2">اسم العميل <span className="text-red-500">*</span></label>
        <input
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          className={`w-full px-5 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#F08784]/20 outline-none transition-all text-lg ${errors.fullName ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:border-[#F08784]'}`}
          placeholder="مثال: احمد حمادة"
        />
        {errors.fullName && <p className="text-red-600 text-sm mt-2 font-medium flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.fullName}</p>}
      </div>

      <div>
        <label className="block text-base font-bold text-slate-700 mb-2">البريد الإلكتروني (اختياري)</label>
        <input
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-5 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-[#F08784]/20 focus:border-[#F08784] outline-none transition-all text-lg"
          placeholder="example@mail.com"
        />
      </div>

      <div>
        <label className="block text-base font-bold text-slate-700 mb-2">رقم الهاتف (اختياري)</label>
        <input
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-5 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-[#F08784]/20 focus:border-[#F08784] outline-none transition-all text-lg"
          placeholder="010xxxxxxx"
          dir="ltr"
        />
      </div>
    </div>
  </Modal>
);