'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Building2, Users, LogOut, ShieldCheck, Menu, X,
  ExternalLink, ChevronDown, UserCog, User, Loader2, Mail, MessageSquare,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

const nav = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/tenants', label: 'Tenants', icon: Building2 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const { toast } = useToast();
  const { user, isAuthenticated, clearAuth, updateUser } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Unread contact-enquiry count for the sidebar badge (polls every 30s).
  const { data: unread } = useQuery({
    queryKey: ['admin-unread-messages'],
    queryFn: async () => (await api.get('/contact/unread-count')).data.data as { count: number },
    enabled: isAuthenticated && user?.role === 'SUPER_ADMIN',
    refetchInterval: 30_000,
  });
  const unreadCount = unread?.count ?? 0;

  useEffect(() => {
    const persist = useAuthStore.persist;
    if (!persist) { setHydrated(true); return; }
    const unsub = persist.onFinishHydration(() => setHydrated(true));
    if (persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated || user?.role !== 'SUPER_ADMIN') router.replace('/admin-login');
  }, [hydrated, isAuthenticated, user, router]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const logout = () => {
    clearAuth();
    router.replace('/admin-login');
  };

  if (!hydrated || !isAuthenticated || user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
      </div>
    );
  }

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'A';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900">
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-gray-200 bg-white transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-600">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Adyapan Connect</p>
            <p className="text-[11px] text-gray-400">Super Admin</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => {
            const active = item.href === '/admin' ? path === '/admin' : path.startsWith(item.href);
            const showBadge = item.href === '/admin/messages' && unreadCount > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? 'bg-green-600 text-white' : 'text-gray-500 hover:bg-green-50 hover:text-green-700'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                {showBadge && (
                  <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${active ? 'bg-white text-green-700' : 'bg-red-500 text-white'}`}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-1 border-t border-gray-100 p-3">
          <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900">
            <ExternalLink className="h-4 w-4" /> Go to App
          </Link>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
          <button onClick={() => setOpen(!open)} className="text-gray-500 lg:hidden">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div className="hidden lg:block" />

          {/* Profile dropdown */}
          <div ref={menuRef} className="relative">
            <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-3 rounded-lg py-1 pl-3 pr-1 hover:bg-gray-50">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                <p className="text-[11px] text-gray-400">{user.email}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                {initials}
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                <div className="border-b border-gray-100 px-4 py-3">
                  <p className="text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                  <p className="truncate text-xs text-gray-400">{user.email}</p>
                  <span className="mt-1.5 inline-block rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                    SUPER ADMIN
                  </span>
                </div>
                <div className="py-1">
                  <Link href="/admin/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <User className="h-4 w-4 text-gray-400" /> View Profile
                  </Link>
                  <button
                    onClick={() => { setMenuOpen(false); setEditOpen(true); }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <UserCog className="h-4 w-4 text-gray-400" /> Edit Profile
                  </button>
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <ExternalLink className="h-4 w-4 text-gray-400" /> Go to App
                  </Link>
                </div>
                <button onClick={logout} className="flex w-full items-center gap-2.5 border-t border-gray-100 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
                  <LogOut className="h-4 w-4" /> Log out
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-auto bg-gray-50 p-4 sm:p-6">{children}</main>
      </div>

      {/* Edit profile modal */}
      {editOpen && (
        <EditProfileModal
          initial={{ firstName: user.firstName, lastName: user.lastName, phoneNumber: '' }}
          email={user.email}
          onClose={() => setEditOpen(false)}
          onSaved={(fn, ln) => {
            updateUser({ firstName: fn, lastName: ln });
            setEditOpen(false);
            toast({ title: 'Profile updated' });
          }}
        />
      )}
    </div>
  );
}

function EditProfileModal({
  initial,
  email,
  onClose,
  onSaved,
}: {
  initial: { firstName: string; lastName: string; phoneNumber: string };
  email: string;
  onClose: () => void;
  onSaved: (firstName: string, lastName: string) => void;
}) {
  const { toast } = useToast();
  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [phoneNumber, setPhoneNumber] = useState(initial.phoneNumber);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!firstName.trim()) return;
    setSaving(true);
    try {
      await api.put('/users/me', { firstName, lastName, phoneNumber: phoneNumber || undefined });
      onSaved(firstName, lastName);
    } catch (err: any) {
      toast({ title: 'Update failed', description: err.response?.data?.error?.message || 'Try again', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Edit Profile</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
          <Mail className="h-4 w-4" /> {email}
          <span className="ml-auto text-[11px] text-gray-400">Email can’t be changed</span>
        </div>

        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600">First name</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600">Last name</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600">Phone (optional)</label>
            <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+91..." className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20" />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={!firstName.trim() || saving} className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
