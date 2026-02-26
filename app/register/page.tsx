import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Create Account | Event Management',
  description: 'Create your event management account and get started',
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Event Manager</h1>
          <p className="mt-2 text-slate-600">Smart Event Invitation & Guest Management</p>
        </div>
        <RegisterForm />
      </div>
    </main>
  );
}
