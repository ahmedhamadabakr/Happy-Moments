import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import CheckInScanner from '@/components/checkin/CheckInScanner';

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export default async function CheckInPage({ params }: PageProps) {
  const { eventId } = await params;

  return (
    <DashboardLayout>
      <CheckInScanner eventId={eventId} />
    </DashboardLayout>
  );
}

export const metadata = {
  title: 'Check-In Scanner',
  description: 'Scan QR codes for event check-in',
};
