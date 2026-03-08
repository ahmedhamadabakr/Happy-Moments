'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Keyboard, CheckCircle, XCircle, Users, QrCode, BarChart2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CheckInScannerProps {
  eventId: string;
}

interface ScanResult {
  id: string;
  guestName: string;
  scanType: 'first' | 'repeated';
  timestamp: Date;
  success: boolean;
}

export default function CheckInScanner({ eventId }: CheckInScannerProps) {
  const [mode, setMode] = useState<'camera' | 'manual'>('camera');
  const [manualToken, setManualToken] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [stats, setStats] = useState({ total: 0, checkedIn: 0 });
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Load stats
    fetchStats();
    
    // Setup audio for feedback
    audioRef.current = new Audio('/sounds/beep.mp3');
  }, [eventId]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/v1/events/${eventId}/check-in/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleScan = async (qrToken: string) => {
    if (isScanning) return;
    
    setIsScanning(true);

    try {
      const response = await fetch(`/api/v1/events/${eventId}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken, scanMethod: mode === 'camera' ? 'qr' : 'manual' }),
      });

      const result = await response.json();

      if (response.ok) {
        // Play success sound
        audioRef.current?.play();

        // Add to recent scans
        setRecentScans((prev) => [
          {
            id: result.data.guestId,
            guestName: result.data.guestName,
            scanType: result.data.scanType,
            timestamp: new Date(),
            success: true,
          },
          ...prev.slice(0, 49),
        ]);

        // Update stats
        fetchStats();

        toast({
          title: result.data.scanType === 'first' ? 'Check-in Successful!' : 'Already Checked In',
          description: `${result.data.guestName} - ${result.data.scanType === 'first' ? 'First scan' : `Scan #${result.data.scanCount}`}`,
        });
      } else {
        toast({
          title: 'Check-in Failed',
          description: result.error || 'Invalid QR code',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process check-in',
        variant: 'destructive',
      });
    } finally {
      setIsScanning(false);
      setManualToken('');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualToken.trim()) {
      handleScan(manualToken.trim());
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card className="bg-gradient-to-br from-[#F08784]/5 via-white to-violet-50/30 rounded-3xl p-8 border-none shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#F08784] to-[#D97673] rounded-2xl flex items-center justify-center shadow-lg">
              <QrCode className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">سكانر تسجيل الدخول</h1>
              <p className="text-lg text-slate-600 mt-2 font-medium">امسح رمز QR أو أدخل الرمز يدوياً</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant={mode === 'camera' ? 'default' : 'outline'}
              onClick={() => setMode('camera')}
              className={mode === 'camera' 
                ? 'bg-[#F08784] hover:bg-[#D97673] text-white font-semibold shadow-md' 
                : 'bg-white hover:bg-[#F08784]/5 border-2 border-slate-300 hover:border-[#F08784] font-semibold'
              }
            >
              <Camera className="h-5 w-5 ml-2" />
              الكاميرا
            </Button>
            <Button
              variant={mode === 'manual' ? 'default' : 'outline'}
              onClick={() => setMode('manual')}
              className={mode === 'manual' 
                ? 'bg-[#F08784] hover:bg-[#D97673] text-white font-semibold shadow-md' 
                : 'bg-white hover:bg-[#F08784]/5 border-2 border-slate-300 hover:border-[#F08784] font-semibold'
              }
            >
              <Keyboard className="h-5 w-5 ml-2" />
              يدوي
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200 hover:border-[#F08784]/30 transition-all hover:shadow-lg bg-gradient-to-br from-white to-slate-50/50 rounded-3xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-700">إجمالي الضيوف</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#F08784]/10 rounded-xl">
                <Users className="h-6 w-6 text-[#F08784]" />
              </div>
              <span className="text-4xl font-black text-slate-900">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 hover:border-emerald-300 transition-all hover:shadow-lg bg-gradient-to-br from-white to-emerald-50/30 rounded-3xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-700">تم تسجيل الدخول</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <span className="text-4xl font-black text-slate-900">{stats.checkedIn}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 hover:border-violet-300 transition-all hover:shadow-lg bg-gradient-to-br from-white to-violet-50/30 rounded-3xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-700">نسبة الحضور</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-violet-100 rounded-xl">
                <BarChart2 className="h-6 w-6 text-violet-600" />
              </div>
              <span className="text-4xl font-black text-slate-900">
                {stats.total > 0 ? ((stats.checkedIn / stats.total) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scanner */}
      <Card className="border-slate-200 shadow-lg rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b">
          <CardTitle className="text-2xl text-slate-900 font-bold">
            {mode === 'camera' ? 'ماسح رمز QR' : 'الإدخال اليدوي'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {mode === 'camera' ? (
            <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex flex-col items-center justify-center shadow-inner border-2 border-slate-700">
              <QrCode className="w-20 h-20 text-[#F08784] mb-4" />
              <p className="text-white text-xl font-semibold mb-2">سيتم تفعيل الكاميرا قريباً</p>
              <p className="text-slate-400 text-base">استخدم الوضع اليدوي حالياً</p>
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">أدخل رمز QR أو معرف الضيف</label>
                <Input
                  placeholder="اكتب الرمز هنا..."
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  disabled={isScanning}
                  autoFocus
                  className="text-lg p-6 border-2 border-slate-300 focus:border-[#F08784] rounded-xl"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isScanning || !manualToken.trim()}
                className="w-full bg-[#F08784] hover:bg-[#D97673] text-white font-bold text-lg py-6 rounded-xl shadow-md"
              >
                {isScanning ? 'جاري المعالجة...' : 'تسجيل الدخول'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Recent Scans */}
      <Card className="border-slate-200 shadow-lg rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b">
          <CardTitle className="text-2xl text-slate-900 font-bold">آخر 50 عملية مسح</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {recentScans.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-10 h-10 text-slate-400" />
                </div>
                <p className="text-slate-500 text-lg font-medium">لا توجد عمليات مسح بعد</p>
              </div>
            ) : (
              recentScans.map((scan, index) => (
                <div
                  key={`${scan.id}-${index}`}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 hover:border-[#F08784]/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl ${scan.success ? 'bg-emerald-100' : 'bg-red-100'}`}>
                      {scan.success ? (
                        <CheckCircle className="h-6 w-6 text-emerald-600" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-lg">{scan.guestName}</p>
                      <p className="text-sm text-slate-600 font-medium">
                        {scan.scanType === 'first' ? '✓ أول تسجيل دخول' : '⚠ مسح متكرر'}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-slate-500 font-medium bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                    {new Date(scan.timestamp).toLocaleTimeString('ar-SA')}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
