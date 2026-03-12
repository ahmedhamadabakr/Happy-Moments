import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/shared/Modal';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: { id: string; name: string } | null;
  onFileChange: (file: File | null) => void;
  selectedFile: File | null;
  onUpload: () => void;
  loading: boolean;
  result: any;
}

export const UploadContactsModal = ({ isOpen, onClose, client, onFileChange, selectedFile, onUpload, loading, result }: UploadModalProps) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={client ? `رفع جهات الاتصال: ${client.name}` : 'رفع جهات الاتصال'}
    actions={
      <div className="flex gap-3 w-full">
        <button onClick={onClose} className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold">إغلاق</button>
        <button onClick={onUpload} disabled={loading || !selectedFile} className="flex-1 px-6 py-3 bg-[#F08784] text-white rounded-xl font-bold shadow-md disabled:opacity-50">
          {loading ? 'جاري الرفع...' : 'رفع الملف'}
        </button>
      </div>
    }
  >
    <div className="space-y-5">
      <div className="bg-blue-50 p-5 rounded-xl border-2 border-blue-100">
        <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" /> تنسيق الملف المطلوبة
        </h4>
        <p className="text-sm text-blue-800 mb-2">تأكد من وجود الأعمدة: firstName, lastName, phone, suffix, companion</p>
      </div>

      <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center relative hover:border-[#F08784] transition-all">
        <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => onFileChange(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
        <div className="flex flex-col items-center gap-3">
          <Upload className="w-10 h-10 text-[#F08784]" />
          <div className="text-base font-bold text-slate-700">{selectedFile ? selectedFile.name : "اضغط لاختيار ملف Excel"}</div>
        </div>
      </div>

      {result?.stats && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-xs font-bold">
          <div className="p-2 bg-white rounded border">تمت المعالجة: {result.stats.total}</div>
          <div className="p-2 bg-white rounded border text-green-600">تم الإنشاء: {result.stats.created}</div>
        </div>
      )}
    </div>
  </Modal>
);