import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: string;
  tenantId?: string;
  tenantSlug?: string;
  tenantName?: string;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  tenantSlug: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string, tenantSlug?: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      tenantSlug: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken, tenantSlug) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          if (tenantSlug) localStorage.setItem('tenantSlug', tenantSlug);
        }
        set({ user, accessToken, refreshToken, tenantSlug: tenantSlug || null, isAuthenticated: true });
      },

      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('tenantSlug');
        }
        set({ user: null, accessToken: null, refreshToken: null, tenantSlug: null, isAuthenticated: false });
      },

      updateUser: (partial) =>
        set((state) => ({ user: state.user ? { ...state.user, ...partial } : null })),
    }),
    {
      name: 'adyapan-auth',
      // Persist everything needed to stay logged in across refreshes.
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        tenantSlug: s.tenantSlug,
        isAuthenticated: s.isAuthenticated,
      }),
      // After rehydration, keep the raw localStorage token keys (used by the axios
      // client) in sync, and derive isAuthenticated defensively from the tokens.
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const hasToken = !!state.accessToken && !!state.user;
        state.isAuthenticated = hasToken;
        if (typeof window !== 'undefined' && hasToken) {
          if (state.accessToken) localStorage.setItem('accessToken', state.accessToken);
          if (state.refreshToken) localStorage.setItem('refreshToken', state.refreshToken);
          if (state.tenantSlug) localStorage.setItem('tenantSlug', state.tenantSlug);
        }
      },
    },
  ),
);
