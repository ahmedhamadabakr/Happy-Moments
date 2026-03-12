import { useMemo } from 'react';
import { Search, Phone, Mail, Calendar, Upload, Users, Trash2, FilePenLine } from 'lucide-react';
import { DataTable, Column } from '@/components/shared/DataTable';

interface ClientTableProps {
  data: any[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onUploadClick: (client: any) => void;
  onRowClick: (client: any) => void;
  onDeleteClick: (client: any) => void;
  onEditClick: (client: any) => void;
}

export const ClientTable = ({ data, loading, searchTerm, onSearchChange, onUploadClick, onRowClick, onDeleteClick, onEditClick }: ClientTableProps) => {
  const columns = useMemo(() => [
    { 
      key: 'fullName', 
      label: 'اسم العميل',
      render: (value: any) => <div className="font-bold text-slate-900">{value || '-'}</div>,
    },
    {
      key: 'phone',
      label: 'رقم الهاتف',
      render: (value: any) => <div className="flex items-center gap-2" dir="ltr"><Phone className="w-3.5 h-3.5 text-slate-400" />{value || '-'}</div>,
    },
    {
      key: 'email',
      label: 'البريد الإلكتروني',
      render: (value: any) => <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" />{value || '-'}</div>,
    },
    {
      key: 'isActive',
      label: 'الحالة',
      render: (value: any) => (
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {value ? 'نشط' : 'غير نشط'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'تاريخ الإنشاء',
      render: (value: any) => (
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Calendar className="w-3.5 h-3.5" />
          {value ? new Date(value).toLocaleDateString('ar-SA') : '-'}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'إجراءات',
      render: (_: any, row: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onUploadClick(row); }}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#F08784]/10 text-[#F08784] rounded-xl hover:bg-[#F08784]/20 transition-colors text-sm font-medium"
          >
            <Upload className="w-4 h-4" /> رفع جهات اتصال
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEditClick(row); }}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500/20 transition-colors text-sm font-medium"
          >
            <FilePenLine className="w-4 h-4" /> تعديل
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDeleteClick(row); }}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" /> حذف
          </button>
        </div>
      ),
    },
  ], [onUploadClick, onDeleteClick, onEditClick]);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-[#F08784]" /> قائمة العملاء
        </h2>
        <div className="relative w-full sm:w-80">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="ابحث باسم العميل أو الهاتف..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pr-10 pl-4 py-3 text-sm border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-[#F08784]/10 focus:border-[#F08784] outline-none transition-all"
          />
        </div>
      </div>
      <div className="p-2">
        <DataTable columns={columns} data={data} loading={loading} emptyMessage="لم يتم العثور على أي عملاء" onRowClick={onRowClick} />
      </div>
    </div>
  );
};