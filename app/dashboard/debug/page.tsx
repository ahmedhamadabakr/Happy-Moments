'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';

export default function DebugPage() {
  const { user, company, isAuthenticated } = useAuthStore();
  const [apiUser, setApiUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/profile')
      .then(res => res.json())
      .then(data => {
        console.log('API Response:', data);
        setApiUser(data);
      });
  }, []);

  return (
    <div className="p-8" dir="rtl">
      <h1 className="text-2xl font-bold mb-4">صفحة التشخيص</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <h2 className="text-xl font-bold mb-2">من Auth Store:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-left" dir="ltr">
          {JSON.stringify({ user, company, isAuthenticated }, null, 2)}
        </pre>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-2">من API:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-left" dir="ltr">
          {JSON.stringify(apiUser, null, 2)}
        </pre>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mt-4">
        <h2 className="text-xl font-bold mb-2">فحص الـ Role:</h2>
        <p>Role من Store: <strong>{user?.role}</strong></p>
        <p>Type: <strong>{typeof user?.role}</strong></p>
        <p>هل يساوي 'manager'؟ <strong>{user?.role === 'manager' ? 'نعم ✅' : 'لا ❌'}</strong></p>
        <p>هل يساوي 'employee'؟ <strong>{user?.role === 'employee' ? 'نعم ✅' : 'لا ❌'}</strong></p>
      </div>
    </div>
  );
}
