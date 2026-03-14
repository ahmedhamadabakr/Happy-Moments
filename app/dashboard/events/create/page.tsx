'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, X, CheckCircle, ArrowRight, Send, PartyPopper, Users, Info, Check, ChevronsUpDown, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Slider } from '@/components/ui/slider';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ClientOption {
  _id: string;
  fullName: string;
}

export default function CreateEventPage() {
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [openClientPopover, setOpenClientPopover] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');

  const [invitationImage, setInvitationImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    description: '',
    eventDate: '',
    eventTime: '',
    location: '',
    locationUrl: '',
    qrX: '50',
    qrY: '50',
    qrSize: '30',
  });

  const [createdEvent, setCreatedEvent] = useState<any | null>(null);
  const router = useRouter();

  async function loadClients() {
    try {
      const res = await fetch('/api/v1/clients');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'فشل جلب العملاء');
      setClients(json.clients.map((c: any) => ({ _id: c._id, fullName: c.fullName })));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطأ غير معروف');
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInvitationImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setInvitationImage(null);
      setImagePreview(null);
    }
  };

  async function handleCreateEvent() {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const fd = new FormData();
      const { qrSize, ...remaning } = formData;

      Object.entries(remaning).forEach(([key, value]) => {
        fd.append(key, value);
      });

      fd.append('qrWidth', qrSize)
      fd.append('qrHeight', qrSize)

      if (invitationImage) {
        fd.append('invitationImage', invitationImage);
      }

      const apiUrl = formData.clientId 
        ? '/api/v1/events/create-from-client' 
        : '/api/v1/events';
      
      const res = await fetch(apiUrl, {
        method: 'POST',
        body: fd,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'فشل في إنشاء الفعالية');
      }

      setCreatedEvent(json.event);
      setSuccessMessage(json.message || 'تم إنشاء الفعالية بنجاح!');
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطأ غير معروف');
    } finally {
      setLoading(false);
    }
  }

  const renderStep1 = () => (
    <Card className="border-slate-200 shadow-lg rounded-3xl overflow-hidden bg-white">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b">
        <CardTitle className="text-2xl font-bold text-slate-900">خطوة 1: تفاصيل الفعالية</CardTitle>
        <CardDescription className="text-slate-600 text-base font-medium">املأ المعلومات الأساسية لفعاليتك</CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Right Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-bold text-slate-700 text-base">عنوان الفعالية</Label>
              <Input 
                id="title" 
                value={formData.title} 
                onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} 
                placeholder="مثال: حفل إطلاق المنتج الجديد" 
                className="text-lg p-6 border-2 border-slate-300 focus:border-[#F08784] rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-bold text-slate-700 text-base">وصف الفعالية (اختياري)</Label>
              <Textarea 
                id="description" 
                value={formData.description} 
                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} 
                placeholder="تفاصيل إضافية عن الفعالية..." 
                className="text-lg p-4 border-2 border-slate-300 focus:border-[#F08784] rounded-xl min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="eventDate" className="font-bold text-slate-700 text-base">تاريخ الفعالية</Label>
                    <Input 
                      id="eventDate" 
                      type="date" 
                      value={formData.eventDate} 
                      onChange={(e) => setFormData(p => ({ ...p, eventDate: e.target.value }))} 
                      className="text-lg p-6 border-2 border-slate-300 focus:border-[#F08784] rounded-xl"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="eventTime" className="font-bold text-slate-700 text-base">الوقت</Label>
                    <Input 
                      id="eventTime" 
                      type="time" 
                      value={formData.eventTime} 
                      onChange={(e) => setFormData(p => ({ ...p, eventTime: e.target.value }))} 
                      className="text-lg p-6 border-2 border-slate-300 focus:border-[#F08784] rounded-xl"
                    />
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="font-bold text-slate-700 text-base">الموقع</Label>
              <Input 
                id="location" 
                value={formData.location} 
                onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))} 
                placeholder="مثال: فندق الريتز كارلتون" 
                className="text-lg p-6 border-2 border-slate-300 focus:border-[#F08784] rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="locationUrl" className="font-bold text-slate-700 text-base">رابط الموقع (Google Maps)</Label>
              <Input 
                id="locationUrl" 
                value={formData.locationUrl} 
                onChange={(e) => setFormData(p => ({ ...p, locationUrl: e.target.value }))} 
                placeholder="https://maps.app.goo.gl/..." 
                className="text-lg p-6 border-2 border-slate-300 focus:border-[#F08784] rounded-xl"
              />
            </div>

          </div>

          {/* Left Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700 text-base">صورة الدعوة (اختياري)</Label>
              <div className="p-6 border-2 border-dashed border-slate-300 rounded-xl text-center cursor-pointer hover:border-[#F08784] hover:bg-[#F08784]/5 transition-all relative bg-gradient-to-br from-white to-slate-50/50" onClick={() => !imagePreview && document.getElementById('invitationImage')?.click()}>
                {imagePreview ? (
                  <div className="relative w-full">
                    <div className="relative max-h-[700px] overflow-auto rounded-lg bg-slate-50 border-2 border-slate-300">
                      <Image src={imagePreview} alt="Preview" className="w-full h-auto object-contain" width={300} height={280} />
                      <div 
                        className="absolute border-2 border-dashed border-red-500 bg-white/30 backdrop-blur-sm"
                        style={{
                          left: `${formData.qrX}%`,
                          top: `${formData.qrY}%`,
                          width: `${formData.qrSize}%`,
                          aspectRatio: '1',
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <div className='text-red-500 font-bold text-xs bg-white/50 p-px rounded-sm absolute -top-5 right-0'>QR Preview</div>
                      </div>
                    </div>
                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8 z-10 shadow-lg" onClick={(e) => { e.stopPropagation(); setImagePreview(null); setInvitationImage(null); }}>
                      <X className="h-5 w-5"/>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-3 text-slate-600 py-12">
                    <Upload className="w-12 h-12 text-amber-500" />
                    <p className="font-semibold text-lg">اسحب وأفلت الصورة هنا، أو انقر للاختيار</p>
                    <p className="text-sm">سيتم دمج QR Code على هذه الصورة</p>
                    <p className="text-sm text-amber-600 font-bold mt-2 bg-amber-100 px-4 py-2 rounded-full">يُفضل استخدام صورة بالطول (Portrait)</p>
                  </div>
                )}
                <Input id="invitationImage" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>
            </div>
             {imagePreview && (
              <Card className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-md rounded-xl">
                <CardContent className='p-6 space-y-5'>
                    <div>
                      <Label className='font-bold text-slate-700 mb-2 block'>المحور الأفقي (X): {formData.qrX}%</Label>
                      <Slider value={[parseInt(formData.qrX)]} onValueChange={([val]) => setFormData(p => ({ ...p, qrX: String(val) }))} className="cursor-pointer" />
                    </div>
                     <div>
                      <Label className='font-bold text-slate-700 mb-2 block'>المحور العامودي (Y): {formData.qrY}%</Label>
                      <Slider value={[parseInt(formData.qrY)]} onValueChange={([val]) => setFormData(p => ({ ...p, qrY: String(val) }))} className="cursor-pointer" />
                    </div>
                     <div>
                      <Label className='font-bold text-slate-700 mb-2 block'>حجم الرمز: {formData.qrSize}%</Label>
                      <Slider value={[parseInt(formData.qrSize)]} onValueChange={([val]) => setFormData(p => ({ ...p, qrSize: String(val) }))} className="cursor-pointer" />
                    </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3 p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
  <div className="flex items-center justify-between">
    <Label className="font-bold text-slate-800 text-lg flex items-center gap-2">
      <Users className="w-5 h-5 text-[#F08784]" />
      ربط بعميل
    </Label>
    {formData.clientId && (
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-xs text-rose-500 hover:text-rose-600 h-7"
        onClick={() => setFormData(p => ({ ...p, clientId: '' }))}
      >
        إلغاء الاختيار
      </Button>
    )}
  </div>
  <Popover open={openClientPopover} onOpenChange={setOpenClientPopover}>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={openClientPopover}
        className="h-14 w-full justify-between text-lg border-2 border-slate-200 focus:ring-offset-0 focus:ring-2 focus:ring-[#F08784]/20 focus:border-[#F08784] rounded-2xl transition-all bg-slate-50/50 hover:bg-white font-normal px-3"
      >
        {formData.clientId
          ? clients.find((client) => client._id === formData.clientId)?.fullName
          : "اختر العميل المستهدف"}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
      <div className="flex items-center border-b px-3" dir="rtl">
        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        <input
          className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="ابحث عن عميل..."
          onChange={(e) => setClientSearchTerm(e.target.value)}
          value={clientSearchTerm}
        />
      </div>
      <div className="max-h-[300px] overflow-y-auto p-1" dir="rtl">
        {clients
          .filter((client) => client.fullName.toLowerCase().includes(clientSearchTerm.toLowerCase()))
          .map((client) => (
            <div
              key={client._id}
              className={cn(
                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                formData.clientId === client._id && "bg-accent"
              )}
              onClick={() => {
                setFormData(p => ({ ...p, clientId: client._id }));
                setOpenClientPopover(false);
              }}
            >
              <Check className={cn("ml-2 h-4 w-4", formData.clientId === client._id ? "opacity-100" : "opacity-0")} />
              <div className="flex flex-col">
                <span className="font-semibold">{client.fullName}</span>
              </div>
            </div>
          ))}
        {clients.filter((client) => client.fullName.toLowerCase().includes(clientSearchTerm.toLowerCase())).length === 0 && (
          <div className="py-6 text-center text-sm text-muted-foreground">لا يوجد نتائج</div>
        )}
      </div>
    </PopoverContent>
  </Popover>

  <div className="flex items-start gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
    <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
    <p className="text-sm text-blue-700 leading-relaxed">
      عند اختيار عميل محدد، سيقوم النظام تلقائياً بإنشاء دعوات لجميع <span className="font-bold">جهات الاتصال</span> المسجلة تحت اسمه.
    </p>
  </div>
</div>
          </div>
        </div>

        {error && (
            <Alert variant="destructive" className="rounded-xl border-2 border-red-200 bg-red-50">
                <X className="h-5 w-5" />
                <AlertTitle className="font-bold">خطأ</AlertTitle>
                <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
        )}

        <div className="flex justify-end pt-6 border-t border-slate-200">
            <Button 
              onClick={handleCreateEvent} 
              disabled={loading || !formData.title || !formData.eventDate} 
              loading={loading} 
              size="lg"
              className="bg-[#F08784] hover:bg-[#D97673] text-white font-bold text-lg px-8 py-6 rounded-xl shadow-md"
            >
                متابعة <ArrowRight className="mr-2 h-5 w-5"/>
            </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => {
    const clientName = formData.clientId 
      ? clients.find(c => c._id === formData.clientId)?.fullName 
      : null;

    return (
      <Card className="border-2 border-green-200 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-br from-white to-green-50/20 text-center">
      <CardHeader className="pt-12 pb-6">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-xl">
            <CheckCircle className="h-14 w-14 text-white" />
        </div>
        <CardTitle className="text-3xl font-bold text-slate-900 mt-6">تم إنشاء الفعالية بنجاح!</CardTitle>
        <CardDescription className="text-slate-600 text-lg font-medium mt-3">فعالية "{createdEvent?.title}" جاهزة الآن.</CardDescription>
        {clientName && (
          <p className="text-slate-500 text-md mt-2">تم ربطها بالعميل: <span className="font-bold text-slate-700">{clientName}</span></p>
        )}
      </CardHeader>
      <CardContent className="p-8 space-y-6">
      
        <div className="pt-4">
            <Button 
              size="lg" 
              onClick={() => router.push(`/dashboard/events`)}
              className="bg-[#F08784] hover:bg-[#D97673] text-white font-bold text-lg px-10 py-6 rounded-xl shadow-md"
            >
                <PartyPopper className="ml-2 h-5 w-5"/> الذهاب إلى صفحة الفعاليات
            </Button>
        </div>
      </CardContent>
    </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <Card className="bg-gradient-to-br from-[#F08784]/5 via-white to-violet-50/30 rounded-3xl p-8 border-none shadow-lg">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#F08784] to-[#D97673] rounded-2xl flex items-center justify-center shadow-lg">
              <PartyPopper className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">إنشاء فعالية جديدة</h1>
              <p className="text-lg text-slate-600 mt-2 font-medium">أضف تفاصيل الفعالية وابدأ في إدارة الضيوف</p>
            </div>
          </div>
        </Card>

        {step === 1 ? renderStep1() : renderStep2()}
      </div>
    </DashboardLayout>
  );
}
