'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Users, Zap } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
            EM
          </div>
          <span className="text-xl font-bold text-slate-900">Event Manager</span>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push('/login')}>
            Sign In
          </Button>
          <Button onClick={() => router.push('/register')}>
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 sm:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-6">
            Smart Event <span className="text-blue-600">Invitation</span> & <span className="text-purple-600">Guest Management</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Streamline your event planning with powerful invitation management, contact organization, and real-time RSVP tracking.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => router.push('/register')} className="gap-2">
              Start Free <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/login')}>
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">
            Powerful Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200">
              <div className="h-12 w-12 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Event Management</h3>
              <p className="text-slate-600">
                Create, organize, and manage multiple events with ease. Track all details in one place.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200">
              <div className="h-12 w-12 rounded-lg bg-purple-600 text-white flex items-center justify-center mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Contact Management</h3>
              <p className="text-slate-600">
                Import, organize, and segment contacts. Upload CSV files or add guests manually.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200">
              <div className="h-12 w-12 rounded-lg bg-orange-600 text-white flex items-center justify-center mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Smart Invitations</h3>
              <p className="text-slate-600">
                Send personalized invitations via email or WhatsApp. Track opens and responses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Events?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of event organizers who trust Event Manager
          </p>
          <Button size="lg" variant="secondary" onClick={() => router.push('/register')} className="gap-2">
            Create Free Account <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/50 py-8 px-6">
        <div className="max-w-6xl mx-auto text-center text-slate-600 text-sm">
          <p>&copy; 2025 Event Manager. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
