'use client';

import { create } from 'zustand';

export interface User {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  role: 'manager' | 'employee';
  phone?: string;
}

interface AuthState {
  user: User | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  error: string | null;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'loading',
  error: null,

  checkAuth: async () => {
    try {
      const response = await fetch('/api/auth/health', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) {
        set({
          user: null,
          status: 'unauthenticated',
          error: null,
        });
        return;
      }

      const data = await response.json();

      if (data.success && data.user) {
        set({
          user: data.user,
          status: 'authenticated',
          error: null,
        });
      } else {
        set({
          user: null,
          status: 'unauthenticated',
          error: null,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);

      set({
        user: null,
        status: 'unauthenticated',
        error: 'Failed to check authentication status.',
      });
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    }

    set({
      user: null,
      status: 'unauthenticated',
      error: null,
    });
  },

  setUser: (user: User) => {
    set({ user });
  },
}));