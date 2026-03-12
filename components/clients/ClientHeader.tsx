import { Users, UserPlus } from 'lucide-react';

interface ClientHeaderProps {
  onAddClick: () => void;
  count: number;
}

export const ClientHeader = ({ onAddClick, count }: ClientHeaderProps) => (
  <div className="bg-gradient-to-br from-[#F08784]/10 via-white to-violet-50/30 rounded-3xl p-8 border border-slate-100 shadow-sm">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-[#F08784] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#F08784]/20">
          <Users className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900">إدارة العملاء</h1>
          <p className="text-slate-600 mt-1 font-medium">لديك حالياً {count} عميل في النظام</p>
        </div>
      </div>
      <button
        onClick={onAddClick}
        className="flex items-center gap-2 px-6 py-3 bg-[#F08784] text-white rounded-xl hover:bg-[#D97673] transition-all shadow-lg hover:shadow-xl font-bold"
      >
        <UserPlus className="w-5 h-5" />
        إضافة عميل جديد
      </button>
    </div>
  </div>
);