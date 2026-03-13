'use client';

import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, XCircle, Info } from 'lucide-react';
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

export const UploadContactsModal = ({ 
  isOpen, 
  onClose, 
  client, 
  onFileChange, 
  selectedFile, 
  onUpload, 
  loading, 
  result 
}: UploadModalProps) => {

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={client ? `رفع جهات الاتصال: ${client.name}` : 'رفع جهات الاتصال'}
      actions={
        <div className="flex gap-3 w-full">
          <button 
            onClick={onClose} 
            className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold border border-slate-200 hover:bg-slate-200 transition-colors"
          >
            إغلاق
          </button>
          <button 
            onClick={onUpload} 
            disabled={loading || !selectedFile} 
            className="flex-1 px-6 py-3 bg-[#F08784] text-white rounded-xl font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#d97673] transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري المعالجة...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                رفع ومعالجة الملف
              </>
            )}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* قسم التعليمات والجدول التوضيحي */}
        <div className="bg-blue-50/50 p-5 rounded-2xl border-2 border-blue-100">
          <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2 text-base">
            <FileSpreadsheet className="w-5 h-5" /> تنسيق الملف المطلوب
          </h4>
          <p className="text-sm text-blue-800 mb-4 font-medium">
            يجب أن يحتوي ملف Excel على العناوين التالية (Row 1):
          </p>
          <div className="overflow-x-auto rounded-lg border border-blue-200 bg-white">
            <table className="w-full text-[10px] sm:text-xs text-center border-collapse">
              <thead>
                <tr className="bg-blue-100 text-blue-900 font-bold">
                  <th className="p-2 border border-blue-200">firstName</th>
                  <th className="p-2 border border-blue-200">lastName</th>
                  <th className="p-2 border border-blue-200">phone</th>
                  <th className="p-2 border border-blue-200">suffix</th>
                  <th className="p-2 border border-blue-200">companion</th>
                </tr>
              </thead>
              <tbody className="text-slate-500">
                <tr>
                  <td className="p-2 border border-blue-50 font-mono">احمد</td>
                  <td className="p-2 border border-blue-50 font-mono">محمد</td>
                  <td className="p-2 border border-blue-50 font-mono">0123...</td>
                  <td className="p-2 border border-blue-50 font-mono">المحترم</td>
                  <td className="p-2 border border-blue-50 font-mono">2</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-start gap-2 text-[11px] text-blue-700 bg-blue-100/50 p-2 rounded-lg">
            <Info className="w-4 h-4 shrink-0" />
            <p>ملاحظة: سيتم إضافة مفتاح الدولة تلقائياً للأرقام المحلية، وسيتم تجاهل الأرقام غير الصحيحة.</p>
          </div>
        </div>

        {/* منطقة اختيار الملف */}
        <div className={`border-2 border-dashed rounded-2xl p-10 text-center relative transition-all group ${selectedFile ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-300 hover:border-[#F08784] hover:bg-[#F08784]/5'}`}>
          <input 
            type="file" 
            accept=".xlsx,.xls,.csv" 
            onChange={(e) => onFileChange(e.target.files?.[0] || null)} 
            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
          />
          <div className="flex flex-col items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${selectedFile ? 'bg-emerald-100' : 'bg-[#F08784]/10 group-hover:bg-[#F08784]/20'}`}>
              {selectedFile ? <CheckCircle2 className="w-8 h-8 text-emerald-600" /> : <Upload className="w-8 h-8 text-[#F08784]" />}
            </div>
            <div>
              <div className={`text-lg font-bold ${selectedFile ? 'text-emerald-700' : 'text-slate-700'}`}>
                {selectedFile ? selectedFile.name : "اسحب ملف Excel هنا أو اضغط للاختيار"}
              </div>
              <p className="text-sm text-slate-500 mt-1">يدعم ملفات XLSX, XLS, CSV فقط</p>
            </div>
          </div>
        </div>

        {/* عرض النتائج والإحصائيات */}
        {result?.stats && (
          <div className="bg-white p-5 rounded-2xl border-2 border-slate-100 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <h5 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
               ملخص العملية
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-black uppercase tracking-wider">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span className="block text-slate-400 mb-1">الإجمالي</span>
                <span className="text-lg text-slate-900">{result.stats.total}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                <span className="block text-emerald-400 mb-1">جديد</span>
                <span className="text-lg text-emerald-700">{result.stats.created}</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-center">
                <span className="block text-blue-400 mb-1">تم تحديثه</span>
                <span className="text-lg text-blue-700">{result.stats.updated}</span>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-center">
                <span className="block text-rose-400 mb-1">أخطاء</span>
                <span className="text-lg text-rose-700">{result.stats.errors}</span>
              </div>
            </div>
          </div>
        )}

        {/* عرض الأخطاء إن وجدت */}
        {result?.errors && result.errors.length > 0 && (
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 max-h-[150px] overflow-y-auto">
            <h6 className="text-rose-800 font-bold text-sm mb-2 flex items-center gap-2">
              <XCircle className="w-4 h-4" /> تفاصيل الأخطاء:
            </h6>
            <ul className="space-y-1">
              {result.errors.map((err: any, idx: number) => (
                <li key={idx} className="text-[11px] text-rose-600 bg-white/50 p-2 rounded border border-rose-50">
                  <span className="font-bold">{err.name || 'سطر غير معروف'}:</span> {err.error}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
};