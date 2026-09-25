export type AdminUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantSlug?: string;
};

const KEYS = {
  access: 'admin_accessToken',
  refresh: 'admin_refreshToken',
  user: 'admin_user',
};

export function saveSession(accessToken: string, refreshToken: string, user: AdminUser) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.access, accessToken);
  localStorage.setItem(KEYS.refresh, refreshToken);
  localStorage.setItem(KEYS.user, JSON.stringify(user));
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEYS.access);
  localStorage.removeItem(KEYS.refresh);
  localStorage.removeItem(KEYS.user);
}

export function getUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(KEYS.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function isAuthed(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(KEYS.access) && getUser()?.role === 'SUPER_ADMIN';
}
