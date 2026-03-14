import { Input } from '@/components/ui/input';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from 'lucide-react';

export const EventFilters = ({ searchQuery, setSearchQuery, activeTab }: any) => (
  <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8">
    <div className="relative w-full lg:max-w-md">
      <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
      <Input
        placeholder="ابحث باسم الفعالية..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="rounded-xl pr-12 py-6 bg-slate-50"
      />
    </div>
    <TabsList className="bg-slate-100 p-1 rounded-xl">
      <TabsTrigger value="active" className="px-8 py-3">الفعاليات النشطة</TabsTrigger>
      <TabsTrigger value="closed" className="px-8 py-3">الفعاليات المنتهية</TabsTrigger>
    </TabsList>
  </div>
);