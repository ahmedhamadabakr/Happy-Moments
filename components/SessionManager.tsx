'use client';

import { useEffect } from 'react';

interface SessionManagerProps {
  children: React.ReactNode;
}

export default function SessionManager({ children }: SessionManagerProps) {
  useEffect(() => {
    // Check session every 10 minutes (reduced frequency)
    const checkSession = async () => {
      try {
        // Use a simple health check endpoint instead of full profile
        const response = await fetch('/api/auth/health', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (!response.ok) {
          // Session expired, redirect to login
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Session check failed:', error);
        // Don't redirect on network errors, only on auth failures
      }
    };

    // Don't check immediately on mount to avoid initial loop
    const initialCheckTimeout = setTimeout(() => {
      checkSession();
    }, 30000); // Wait 30 seconds after initial load

    // Set up periodic check
    const interval = setInterval(checkSession, 10 * 60 * 1000); // 10 minutes

    // Check session when tab becomes visible again (but debounce it)
    let visibilityTimeout: NodeJS.Timeout;
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Debounce visibility checks to avoid rapid calls
        clearTimeout(visibilityTimeout);
        visibilityTimeout = setTimeout(checkSession, 1000); // Wait 1 second after tab becomes visible
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(initialCheckTimeout);
      clearInterval(interval);
      clearTimeout(visibilityTimeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return <>{children}</>;
}
