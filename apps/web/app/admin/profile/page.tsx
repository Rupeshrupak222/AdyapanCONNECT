'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldCheck, Mail, Phone, Calendar, Clock, BadgeCheck, Building2,
  KeyRound, Loader2, Eye, EyeOff, Monitor, CheckCircle2,
} from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

type Me = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  status: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  tenantMemberships?: { tenant: { name: string; slug: string }; role: { name: string } }[];
};

type Session = { id: string; ipAddress?: string; userAgent?: string; createdAt: string; expiresAt: string };

export default function AdminProfilePage() {
  const { toast } = useToast();

  const { data: me, isLoading } = useQuery({
    queryKey: ['admin-me'],
    queryFn: async () => (await api.get('/users/me')).data.data as Me,
  });

  const { data: sessions } = useQuery({
    queryKey: ['admin-sessions'],
    queryFn: async () => (await api.get('/users/me/sessions')).data.data as Session[],
  });

  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAllSessions, setShowAllSessions] = useState(false);

  const changePassword = async () => {
    if (next.length < 8) { toast({ title: 'Password too short', description: 'At least 8 characters.', variant: 'destructive' }); return; }
    if (next !== confirm) { toast({ title: 'Passwords do not match', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      await api.post('/users/me/change-password', { currentPassword: cur, newPassword: next });
      toast({ title: 'Password changed successfully' });
      setCur(''); setNext(''); setConfirm('');
    } catch (err: any) {
      toast({ title: 'Could not change password', description: err.response?.data?.error?.message || 'Try again', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !me) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
      </div>
    );
  }

  const membership = me.tenantMemberships?.[0];
  const initials = `${me.firstName?.[0] || ''}${me.lastName?.[0] || ''}`.toUpperCase() || 'A';
  const fmt = (d?: string | null) => (d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—');

  const details = [
    { icon: Mail, label: 'Email', value: me.email },
    { icon: Phone, label: 'Phone', value: me.phoneNumber || '—' },
    { icon: ShieldCheck, label: 'Role', value: membership?.role?.name || 'SUPER_ADMIN' },
    { icon: Building2, label: 'Workspace', value: membership?.tenant?.name || '—' },
    { icon: Calendar, label: 'Joined', value: fmt(me.createdAt) },
    { icon: Clock, label: 'Last login', value: fmt(me.lastLoginAt) },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500">Your administrator account details</p>
      </div>

      {/* Header card */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-600 text-xl font-bold text-white">
          {initials}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-900">{me.firstName} {me.lastName}</h2>
          <p className="text-sm text-gray-500">{me.email}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">{membership?.role?.name || 'SUPER_ADMIN'}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${me.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{me.status}</span>
            {me.emailVerified && <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600"><BadgeCheck className="h-3 w-3" /> Verified</span>}
            {me.twoFactorEnabled && <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-semibold text-purple-600">2FA on</span>}
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="mb-6 grid gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:grid-cols-2">
        {details.map((d) => (
          <div key={d.label} className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
              <d.icon className="h-4 w-4 text-gray-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-gray-400">{d.label}</p>
              <p className="truncate text-sm font-medium text-gray-900">{d.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Change password */}
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-green-600" />
          <h2 className="text-sm font-semibold text-gray-900">Change Password</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="relative">
            <input type={show ? 'text' : 'password'} value={cur} onChange={(e) => setCur(e.target.value)} placeholder="Current password"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-9 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20" />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <input type={show ? 'text' : 'password'} value={next} onChange={(e) => setNext(e.target.value)} placeholder="New password"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20" />
          <input type={show ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20" />
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={changePassword} disabled={!cur || !next || !confirm || saving}
            className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Update Password
          </button>
        </div>
      </div>

      {/* Active sessions */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-green-600" />
            <h2 className="text-sm font-semibold text-gray-900">Active Sessions</h2>
          </div>
          <span className="text-xs text-gray-400">{sessions?.length ?? 0} total</span>
        </div>
        <div className="space-y-2">
          {(showAllSessions ? (sessions || []) : (sessions || []).slice(0, 6)).map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5">
              <div className="flex items-center gap-3 min-w-0">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                <div className="min-w-0">
                  <p className="truncate text-xs text-gray-700">{s.userAgent || 'Unknown device'}</p>
                  <p className="text-[11px] text-gray-400">{s.ipAddress || 'IP hidden'} · started {fmt(s.createdAt)}</p>
                </div>
              </div>
            </div>
          ))}
          {(sessions?.length ?? 0) === 0 && <p className="py-4 text-center text-sm text-gray-400">No active sessions.</p>}
        </div>
        {(sessions?.length ?? 0) > 6 && (
          <button
            onClick={() => setShowAllSessions((v) => !v)}
            className="mt-3 w-full rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            {showAllSessions ? 'Show less' : `Show all ${sessions?.length} sessions`}
          </button>
        )}
      </div>
    </div>
  );
}
