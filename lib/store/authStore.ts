'use client';

import { create } from 'zustand';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'manager' | 'employee';
  phone?: string;
}

interface AuthState {
  user: User | null;
  // Using a single status field prevents impossible states (e.g., being both loading and authenticated).
  // 'loading': The initial state on app load, while we check the session.
  // 'authenticated': The user is confirmed to be logged in.
  // 'unauthenticated': The user is confirmed to be logged out.
  status: 'loading' | 'authenticated' | 'unauthenticated';
  error: string | null;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

// **THE FIX**: We are removing the `persist` middleware.
// This ensures the app ALWAYS starts with a clean 'loading' state on a full page load,
// forcing a fresh check with the server instead of relying on stale data from localStorage.
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: 'loading', // Always start in 'loading' to force an auth check.
  error: null,

  /**
   * Checks the user's session status by calling the backend.
   * This is the single source of truth for authentication.
   */
  checkAuth: async () => {
    // Avoid re-checking if the status is already determined.
    if (get().status !== 'loading') return;

    try {
      // As seen in your logs, the app uses /api/auth/health.
      const response = await fetch('/api/auth/health', {
        credentials: 'include',
        cache: 'no-store', // Ensure we always get the latest status from the server.
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          // The API confirmed an active session.
          set({ user: data.user, status: 'authenticated', error: null });
        } else {
          // The API responded, but indicated no active session.
          set({ user: null, status: 'unauthenticated', error: null });
        }
      } else {
        // The API returned a non-200 status (e.g., 401, 500).
        set({ user: null, status: 'unauthenticated', error: null });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // The fetch call itself failed (e.g., network error).
      set({ user: null, status: 'unauthenticated', error: 'Failed to check authentication status.' });
    }
  },

  /**
   * Logs the user out and clears the state.
   */
  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
    // Crucially, set status to 'unauthenticated' to trigger redirects correctly.
    set({ user: null, status: 'unauthenticated', error: null });
  },

  /**
   * Allows updating user data in the store, for example after a profile edit.
   */
  setUser: (user: User) => {
    if (get().status === 'authenticated') {
      set({ user });
    }
  },
}));
