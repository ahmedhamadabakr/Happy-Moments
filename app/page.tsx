'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Users, Zap, CheckCircle, LogInIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import EventGrid from '@/components/ui/EventGrid';

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white/50 backdrop-blur-sm sticky top-0 z-50"> <div className="flex items-center gap-2"> <Image src="/logo2.png" alt="Event Manager" width={96} height={96} priority /> </div> <div className="flex gap-3"> <Link href="/login"> <LogInIcon /> </Link> </div> </nav>

      {/* Hero */}
      <section className="text-center px-6 py-28">
        <h1 className="text-6xl font-bold text-slate-900 mb-6 leading-tight">
          Create Stunning <span className="text-blue-600">Invitations</span><br />
          Manage Guests Effortlessly
        </h1>

        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
          Everything you need to create, send, and track event invitations —
          all in one powerful platform.
        </p>

        <div className="flex justify-center gap-4">
          <Button size="lg" onClick={() => router.push('/register')}>
            Start Free <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline">
            View Demo
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24 bg-white">
        <EventGrid />
        <h2 className="text-4xl font-bold text-center mb-16">
          Powerful Features
        </h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">

          <FeatureCard
            icon={<Calendar className="h-6 w-6" />}
            title="Event Management"
            description="Create and manage unlimited events with real-time updates."
          />

          <FeatureCard
            icon={<Users className="h-6 w-6" />}
            title="Guest Management"
            description="Import contacts, track RSVPs, and segment guests easily."
          />

          <FeatureCard
            icon={<Zap className="h-6 w-6" />}
            title="Smart Invitations"
            description="Send via WhatsApp or Email with full analytics tracking."
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-24 bg-slate-50">
        <h2 className="text-4xl font-bold text-center mb-16">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto text-center">

          <Step title="Create Event" />
          <Step title="Add Guests" />
          <Step title="Send Invitations" />

        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-16 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Elevate Your Events?
          </h2>
          <Button size="lg" variant="secondary" onClick={() => router.push('/register')}>
            Create Free Account <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

    </main>
  );
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <div className="p-8 rounded-2xl shadow-sm hover:shadow-lg transition bg-gradient-to-br from-blue-50 to-white border">
      <div className="h-12 w-12 flex items-center justify-center bg-blue-600 text-white rounded-lg mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}

function Step({ title }: any) {
  return (
    <div className="p-6">
      <CheckCircle className="mx-auto h-10 w-10 text-blue-600 mb-4" />
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
  );
}