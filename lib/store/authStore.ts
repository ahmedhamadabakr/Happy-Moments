'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'manager' | 'employee' | 'client';
  phone?: string;
  company?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Company {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  company: Company | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setCompany: (company: Company | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      company: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setCompany: (company) => set({ company }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
          console.error('Logout error:', error);
        }
        set({ user: null, company: null, isAuthenticated: false });
      },

      checkAuth: async () => {
        const currentState = get();
        
        // Always check with API first
        set({ isLoading: true });
        
        try {
          const response = await fetch('/api/auth/profile', {
            credentials: 'include',
            cache: 'no-store',
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              set({
                user: data.data.user,
                company: data.data.user.company,
                isAuthenticated: true,
                isLoading: false,
              });
              return;
            }
          }
          
          // If API call fails, clear auth state
          set({ 
            user: null, 
            company: null, 
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
          console.error('Auth check error:', error);
          set({ 
            user: null, 
            company: null, 
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        company: state.company,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
