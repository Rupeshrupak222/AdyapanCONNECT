'use client';
import { useQuery } from '@tanstack/react-query';
import {
  Building2, Users, MessageSquare, Megaphone, CreditCard, IndianRupee, TrendingUp, TrendingDown,
  Crown, UserCheck, Clock, BadgeCheck, Contact, FileText, ArrowUpRight,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '@/lib/api';

type Overview = {
  totals: { tenants: number; users: number; messages: number; campaigns: number; contacts: number; templates: number; paidSubscriptions: number; trialingSubscriptions: number; premiumTenants: number };
  tenantStatus: { active: number; trial: number; suspended: number };
  userStatus: { active: number; pending: number; verified: number };
  growth: { messages: { current: number; previous: number; changePct: number }; users: { current: number; previous: number; changePct: number }; newTenants30: number };
  revenue: { total: number; last30Days: number };
  messageStatus: { status: string; count: number }[];
  planBreakdown: { planId: string; planName: string; tier: string; count: number }[];
  recentTenants: { id: string; name: string; slug: string; status: string; createdAt: string; _count?: { members: number } }[];
  recentUsers: { id: string; firstName: string; lastName: string; email: string; status: string; emailVerified: boolean; createdAt: string }[];
};

const statusColors: Record<string, string> = {
  DELIVERED: '#16a34a', READ: '#3b82f6', SENT: '#f59e0b', FAILED: '#ef4444', QUEUED: '#9ca3af',
};

function Delta({ pct }: { pct: number }) {
  const up = pct >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${up ? 'text-green-600' : 'text-red-500'}`}>
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {Math.abs(pct)}%
    </span>
  );
}

export default function AdminOverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: async () => (await api.get('/admin/overview')).data.data as Overview,
  });

  const n = (v?: number) => (v ?? 0).toLocaleString('en-IN');

  const primaryCards = [
    { label: 'Total Tenants', value: data?.totals.tenants, icon: Building2, color: 'text-green-600 bg-green-50', sub: `${data?.tenantStatus.active ?? 0} active · ${data?.tenantStatus.trial ?? 0} trial` },
    { label: 'Total Users', value: data?.totals.users, icon: Users, color: 'text-blue-600 bg-blue-50', delta: data?.growth.users.changePct },
    { label: 'Messages', value: data?.totals.messages, icon: MessageSquare, color: 'text-purple-600 bg-purple-50', delta: data?.growth.messages.changePct },
    { label: 'Premium (Paid)', value: data?.totals.premiumTenants, icon: Crown, color: 'text-amber-600 bg-amber-50', sub: `${data?.totals.trialingSubscriptions ?? 0} on trial` },
  ];

  const secondaryCards = [
    { label: 'Campaigns', value: data?.totals.campaigns, icon: Megaphone },
    { label: 'Contacts', value: data?.totals.contacts, icon: Contact },
    { label: 'Templates', value: data?.totals.templates, icon: FileText },
    { label: 'Active Subs', value: data?.totals.paidSubscriptions, icon: CreditCard },
    { label: 'Verified Users', value: data?.userStatus.verified, icon: BadgeCheck },
    { label: 'Pending Users', value: data?.userStatus.pending, icon: Clock },
  ];

  const volumeData = (data?.messageStatus || []).map((v) => ({ name: v.status, value: v.count, color: statusColors[v.status] || '#9ca3af' }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-sm text-gray-500">Full real-time metrics across all tenants</p>
      </div>

      {/* Revenue */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-2xl border border-green-100 bg-gradient-to-r from-green-50 to-emerald-50 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-600">
              <IndianRupee className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{n(data?.revenue.total)}</p>
            </div>
          </div>
          <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">Lifetime</span>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <ArrowUpRight className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Revenue (last 30 days)</p>
              <p className="text-2xl font-bold text-gray-900">₹{n(data?.revenue.last30Days)}</p>
            </div>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">+{data?.growth.newTenants30 ?? 0} new tenants</span>
        </div>
      </div>

      {/* Primary stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {primaryCards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.color}`}>
                <c.icon className="h-5 w-5" />
              </div>
              {typeof c.delta === 'number' && <Delta pct={c.delta} />}
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{isLoading ? '—' : n(c.value)}</p>
            <p className="text-xs text-gray-500">{c.label}</p>
            {c.sub && <p className="mt-1 text-[11px] text-gray-400">{c.sub}</p>}
          </div>
        ))}
      </div>

      {/* Secondary metrics */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {secondaryCards.map((c) => (
          <div key={c.label} className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
            <c.icon className="h-4 w-4 text-gray-400" />
            <p className="mt-2 text-lg font-bold text-gray-900">{isLoading ? '—' : n(c.value)}</p>
            <p className="text-[11px] text-gray-500">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Message volume */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Messages by Status</h2>
          {volumeData.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">No message data yet.</div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeData}>
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={{ stroke: '#e5e7eb' }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={{ stroke: '#e5e7eb' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, color: '#111827' }} cursor={{ fill: '#00000008' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {volumeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Plan breakdown */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Subscriptions by Plan</h2>
          {(data?.planBreakdown?.length ?? 0) === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">No active subscriptions yet.</div>
          ) : (
            <div className="space-y-3">
              {data!.planBreakdown.map((p) => (
                <div key={p.planId} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.planName}</p>
                    <p className="text-[11px] text-gray-400">{p.tier}</p>
                  </div>
                  <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">{p.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Recent tenants */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Recent Tenants</h2>
          <div className="space-y-2">
            {(data?.recentTenants || []).map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-xs font-bold text-green-700">
                    {t.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.name}</p>
                    <p className="text-[11px] text-gray-400">{t._count?.members ?? 0} members · {t.status}</p>
                  </div>
                </div>
                <span className="text-[11px] text-gray-400">{new Date(t.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
            ))}
            {(data?.recentTenants?.length ?? 0) === 0 && <p className="py-6 text-center text-sm text-gray-400">No tenants yet.</p>}
          </div>
        </div>

        {/* Recent users */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Recent Signups</h2>
          <div className="space-y-2">
            {(data?.recentUsers || []).map((u) => (
              <div key={u.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    {(u.firstName?.[0] || '') + (u.lastName?.[0] || '')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{u.firstName} {u.lastName}</p>
                    <p className="text-[11px] text-gray-400">{u.email}</p>
                  </div>
                </div>
                {u.emailVerified
                  ? <UserCheck className="h-4 w-4 text-green-600" />
                  : <Clock className="h-4 w-4 text-amber-500" />}
              </div>
            ))}
            {(data?.recentUsers?.length ?? 0) === 0 && <p className="py-6 text-center text-sm text-gray-400">No users yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
