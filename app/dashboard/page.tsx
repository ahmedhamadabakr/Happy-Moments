import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Eye, CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'Dashboard | Event Management',
  description: 'Your event management dashboard',
};

export default function DashboardPage() {
  const stats = [
    {
      title: 'Total Events',
      value: '0',
      description: 'Events created this month',
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Total Contacts',
      value: '0',
      description: 'Contacts in your database',
      icon: Users,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Invitations Sent',
      value: '0',
      description: 'Invitations sent this month',
      icon: Eye,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Confirmed Guests',
      value: '0',
      description: 'Guests who confirmed attendance',
      icon: CheckCircle,
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome to Event Manager</h1>
            <p className="mt-2 text-slate-600">Manage your events and guests effectively</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <div className={`rounded-lg p-2 ${stat.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-slate-600 pt-1">{stat.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Set up your event management platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Create Your First Event</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Go to the Events section to create a new event and start managing it
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Import or Add Contacts</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Upload your contact list or manually add guests to invite to events
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Send Invitations</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Send personalized invitations via email or WhatsApp
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Track Responses</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Monitor RSVPs and manage guest confirmations in real-time
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
