import { Users, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

interface ClientStatsProps {
  total: number;
  activeCount: number;
  loading?: boolean;
}

export const ClientStats = ({ total, activeCount, loading }: ClientStatsProps) => {
  const stats = [
    {
      label: 'إجمالي العملاء',
      value: total,
      icon: <Users className="w-6 h-6 text-blue-500" />,
      bgColor: 'bg-blue-50',
    },
    {
      label: 'عملاء نشطون',
      value: activeCount,
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'غير نشط',
      value: total - activeCount,
      icon: <XCircle className="w-6 h-6 text-rose-500" />,
      bgColor: 'bg-rose-50',
    },
    {
      label: 'معدل التفاعل',
      value: total > 0 ? `${Math.round((activeCount / total) * 100)}%` : '0%',
      icon: <TrendingUp className="w-6 h-6 text-violet-500" />,
      bgColor: 'bg-violet-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className={`p-6 rounded-3xl border border-slate-100 shadow-sm bg-white flex items-center justify-between group hover:shadow-md transition-all`}
        >
          <div>
            <p className="text-slate-500 text-sm font-bold mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900">
              {loading ? <span className="inline-block w-8 h-6 bg-slate-100 animate-pulse rounded" /> : stat.value}
            </p>
          </div>
          <div className={`w-12 h-12 ${stat.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  );
};