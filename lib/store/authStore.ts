'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user';
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
        
        // If we already have a user in state, consider them authenticated initially
        if (currentState.user && currentState.isAuthenticated) {
          set({ isLoading: false });
          
          // Verify in background without blocking UI
          fetch('/api/auth/profile', {
            credentials: 'include',
          })
            .then(async (response) => {
              if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                  set({
                    user: data.data.user,
                    company: data.data.user.company,
                    isAuthenticated: true,
                  });
                }
              } else {
                // Only logout if token is actually invalid
                if (response.status === 401) {
                  set({ user: null, company: null, isAuthenticated: false });
                }
              }
            })
            .catch(() => {
              // Keep user logged in on network errors
            });
          
          return;
        }
        
        // No user in state, check with API
        set({ isLoading: true });
        try {
          const response = await fetch('/api/auth/profile', {
            credentials: 'include',
          });
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              set({
                user: data.data.user,
                company: data.data.user.company,
                isAuthenticated: true,
              });
            }
          } else {
            set({ user: null, company: null, isAuthenticated: false });
          }
        } catch (error) {
          set({ user: null, company: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
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
