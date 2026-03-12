import { Copy, ExternalLink, Link as LinkIcon, Check } from 'lucide-react';
import { useState } from 'react';
import { Modal } from '@/components/shared/Modal';

interface ClientLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string | null;
  clientName?: string;
}

export const ClientLinkModal = ({ isOpen, onClose, url, clientName }: ClientLinkModalProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('فشل النسخ', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`رابط العميل: ${clientName || ''}`}
      actions={
        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-bold"
          >
            إغلاق
          </button>
          <button
            onClick={() => window.open(url!, '_blank')}
            disabled={!url}
            className="px-4 py-3 bg-[#1A2E26] text-white rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2 font-bold disabled:opacity-50"
          >
            <ExternalLink className="w-5 h-5" />
            فتح الرابط
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
          <LinkIcon className="w-5 h-5 text-blue-600 mt-0.5" />
          <p className="text-sm text-blue-800 leading-relaxed font-medium">
            هذا الرابط خاص بالعميل فقط، يرجى مشاركته معه ليتمكن من إدارة الدعوات والاطلاع على حالة الحضور والردود.
          </p>
        </div>

        <div className="relative group">
          <div className="w-full p-4 pr-4 pl-12 bg-slate-50 border-2 border-slate-200 rounded-2xl font-mono text-sm text-slate-600 break-all min-h-[60px] flex items-center shadow-inner">
            {url || 'جاري توليد الرابط...'}
          </div>
          <button
            onClick={handleCopy}
            className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
              copied ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 hover:text-[#F08784] shadow-sm border border-slate-200'
            }`}
            title="نسخ الرابط"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>

        {copied && (
          <p className="text-center text-emerald-600 text-sm font-bold animate-in fade-in zoom-in">
            تم نسخ الرابط بنجاح!
          </p>
        )}
      </div>
    </Modal>
  );
};