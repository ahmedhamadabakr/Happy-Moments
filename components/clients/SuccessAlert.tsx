import { CheckCircle2, Copy } from 'lucide-react';

export const SuccessAlert = ({ url }: { url: string | null }) => {
  if (!url) return null;

  return (
    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        <h3 className="font-bold text-emerald-800 text-lg">تم إنشاء العميل بنجاح!</h3>
      </div>
      <p className="text-emerald-700 mb-4 font-medium">رابط صفحة العميل الجديد:</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1 rounded-xl border border-emerald-100 bg-white px-4 py-3 font-mono text-sm text-slate-600 break-all shadow-inner">
          {url}
        </div>
        <button
          onClick={() => navigator.clipboard.writeText(url)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-md font-bold shrink-0"
        >
          <Copy className="w-5 h-5" /> نسخ
        </button>
      </div>
    </div>
  );
};