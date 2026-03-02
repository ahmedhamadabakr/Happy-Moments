'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Keyboard, CheckCircle, XCircle, Users } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Check-In Scanner</h1>
        <div className="flex gap-2">
          <Button
            variant={mode === 'camera' ? 'default' : 'outline'}
            onClick={() => setMode('camera')}
          >
            <Camera className="h-4 w-4 mr-2" />
            Camera
          </Button>
          <Button
            variant={mode === 'manual' ? 'default' : 'outline'}
            onClick={() => setMode('manual')}
          >
            <Keyboard className="h-4 w-4 mr-2" />
            Manual
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold">{stats.checkedIn}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              {stats.total > 0 ? ((stats.checkedIn / stats.total) * 100).toFixed(1) : 0}%
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Scanner */}
      <Card>
        <CardHeader>
          <CardTitle>{mode === 'camera' ? 'QR Scanner' : 'Manual Entry'}</CardTitle>
        </CardHeader>
        <CardContent>
          {mode === 'camera' ? (
            <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
              <p className="text-white">Camera scanner will be implemented here</p>
              <p className="text-slate-400 text-sm mt-2">Use manual mode for now</p>
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <Input
                placeholder="Enter QR token or guest ID"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                disabled={isScanning}
                autoFocus
              />
              <Button type="submit" disabled={isScanning || !manualToken.trim()}>
                {isScanning ? 'Processing...' : 'Check In'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Recent Scans */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Scans (Last 50)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentScans.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No scans yet</p>
            ) : (
              recentScans.map((scan, index) => (
                <div
                  key={`${scan.id}-${index}`}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {scan.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">{scan.guestName}</p>
                      <p className="text-sm text-slate-600">
                        {scan.scanType === 'first' ? 'First check-in' : 'Repeated scan'}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-slate-500">
                    {new Date(scan.timestamp).toLocaleTimeString()}
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
