'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, X, CheckCircle, ArrowRight, Send, PartyPopper, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Slider } from '@/components/ui/slider';

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
    <Card className="border-slate-200 shadow-md rounded-3xl overflow-hidden bg-white">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-amber-50/20 border-b border-slate-100">
        <CardTitle className="text-2xl font-bold text-slate-900">خطوة 1: تفاصيل الفعالية</CardTitle>
        <CardDescription className="text-slate-600 text-base">املأ المعلومات الأساسية لفعاليتك</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Right Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-semibold">عنوان الفعالية</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="مثال: حفل إطلاق المنتج الجديد" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-semibold">وصف الفعالية (اختياري)</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="تفاصيل إضافية عن الفعالية..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="eventDate" className="font-semibold">تاريخ الفعالية</Label>
                    <Input id="eventDate" type="date" value={formData.eventDate} onChange={(e) => setFormData(p => ({ ...p, eventDate: e.target.value }))} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="eventTime" className="font-semibold">الوقت</Label>
                    <Input id="eventTime" type="time" value={formData.eventTime} onChange={(e) => setFormData(p => ({ ...p, eventTime: e.target.value }))} />
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="font-semibold">الموقع</Label>
              <Input id="location" value={formData.location} onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))} placeholder="مثال: فندق الريتز كارلتون" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="locationUrl" className="font-semibold">رابط الموقع (Google Maps)</Label>
              <Input id="locationUrl" value={formData.locationUrl} onChange={(e) => setFormData(p => ({ ...p, locationUrl: e.target.value }))} placeholder="https://maps.app.goo.gl/..." />
            </div>

          </div>

          {/* Left Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="font-semibold">صورة الدعوة (اختياري)</Label>
              <div className="p-4 border-2 border-dashed rounded-xl text-center cursor-pointer hover:border-amber-400 transition-colors relative" onClick={() => !imagePreview && document.getElementById('invitationImage')?.click()}>
                {imagePreview ? (
                  <div className="relative w-full">
                    <div className="relative max-h-[700px] overflow-auto rounded-lg bg-slate-50">
                      <img src={imagePreview} alt="Preview" className="w-full h-auto object-contain" />
                      <div 
                        className="absolute border-2 border-dashed border-red-500 bg-white/30 backdrop-blur-sm"
                        style={{
                          left: `${formData.qrX}%`,
                          top: `${formData.qrY}%`,
                          width: `${formData.qrSize}%`,
                          height: `${formData.qrSize}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <div className='text-red-500 font-bold text-xs bg-white/50 p-px rounded-sm absolute -top-5 right-0'>QR Preview</div>
                      </div>
                    </div>
                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 z-10" onClick={(e) => { e.stopPropagation(); setImagePreview(null); setInvitationImage(null); }}>
                      <X className="h-4 w-4"/>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2 text-slate-500 py-10">
                    <Upload className="w-10 h-10" />
                    <p>اسحب وأفلت الصورة هنا، أو انقر للاختيار</p>
                    <p className="text-xs">سيتم دمج QR Code على هذه الصورة</p>
                    <p className="text-xs text-amber-600 font-semibold mt-2">يُفضل استخدام صورة بالطول (Portrait)</p>
                  </div>
                )}
                <Input id="invitationImage" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>
            </div>
             {imagePreview && (
              <Card className="bg-slate-50/80">
                <CardContent className='p-4 space-y-4'>
                    <div>
                      <Label className='font-medium'>المحور الأفقي (X): {formData.qrX}%</Label>
                      <Slider value={[parseInt(formData.qrX)]} onValueChange={([val]) => setFormData(p => ({ ...p, qrX: String(val) }))} />
                    </div>
                     <div>
                      <Label className='font-medium'>المحور العامودي (Y): {formData.qrY}%</Label>
                      <Slider value={[parseInt(formData.qrY)]} onValueChange={([val]) => setFormData(p => ({ ...p, qrY: String(val) }))} />
                    </div>
                     <div>
                      <Label className='font-medium'>حجم الرمز: {formData.qrSize}%</Label>
                      <Slider value={[parseInt(formData.qrSize)]} onValueChange={([val]) => setFormData(p => ({ ...p, qrSize: String(val) }))} />
                    </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
                <Label className="font-semibold">ربط بعميل (اختياري)</Label>
                <Select 
                    onValueChange={(value) => {
                        const finalValue = value === 'no-client' ? '' : value;
                        setFormData(p => ({ ...p, clientId: finalValue }));
                    }}
                    value={formData.clientId || 'no-client'}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="no-client">بدون عميل</SelectItem>
                        {clients.map((c) => (
                            <SelectItem key={c._id} value={c._id}>{c.fullName}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 pt-1">إذا اخترت عميل، سيتم إنشاء دعوات لجهات الاتصال الخاصة به.</p>
            </div>
          </div>
        </div>

        {error && (
            <Alert variant="destructive">
                <X className="h-4 w-4" />
                <AlertTitle>خطأ</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        <div className="flex justify-end pt-4">
            <Button onClick={handleCreateEvent} disabled={loading || !formData.title || !formData.eventDate} loading={loading} size="lg">
                متابعة <ArrowRight className="mr-2 h-4 w-4"/>
            </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
     <Card className="border-slate-200 shadow-md rounded-3xl overflow-hidden bg-white text-center">
      <CardHeader>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-slate-900 mt-4">تم إنشاء الفعالية بنجاح!</CardTitle>
        <CardDescription className="text-slate-600 text-base">"{createdEvent?.title}" جاهزة الآن. ما هي خطوتك التالية؟</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
            {createdEvent?.clientId && (
                <Button variant="outline" size="lg" onClick={() => router.push(`/dashboard/events/${createdEvent._id}/send-invitations`)}>
                    <Send className="ml-2 h-4 w-4"/> إرسال الدعوات للضيوف
                </Button>
            )}
            <Button variant="outline" size="lg" onClick={() => router.push(`/dashboard/events/${createdEvent._id}/guests`)}>
                <Users className="ml-2 h-4 w-4"/> إضافة ضيوف يدويًا
            </Button>
        </div>
        <div className="pt-4">
            <Button size="lg" onClick={() => router.push(`/dashboard/events/${createdEvent._id}`)}>
                <PartyPopper className="ml-2 h-4 w-4"/> الذهاب إلى صفحة الفعالية
            </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        {step === 1 ? renderStep1() : renderStep2()}
      </div>
    </DashboardLayout>
  );
}
