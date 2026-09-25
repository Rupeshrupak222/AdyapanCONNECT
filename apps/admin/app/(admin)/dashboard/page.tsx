'use client';
import { useQuery } from '@tanstack/react-query';
import { Building2, Users, MessageSquare, Megaphone, CreditCard, IndianRupee, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '@/lib/api';

type Stats = { tenants: number; users: number; messages: number; campaigns: number; activeSubscriptions: number };
type VolumeRow = { status: string; _count: number };

const statusColors: Record<string, string> = {
  DELIVERED: '#22c55e',
  READ: '#3b82f6',
  SENT: '#f59e0b',
  FAILED: '#ef4444',
  PENDING: '#a855f7',
  QUEUED: '#6b7280',
};

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => (await api.get('/admin/stats')).data.data as Stats,
  });

  const { data: revenue } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: async () => (await api.get('/admin/revenue')).data.data as { totalRevenue: number },
  });

  const { data: volume } = useQuery({
    queryKey: ['admin-volume'],
    queryFn: async () => (await api.get('/admin/messages/volume', { params: { days: 30 } })).data.data as VolumeRow[],
  });

  const cards = [
    { label: 'Tenants', value: stats?.tenants, icon: Building2, color: 'text-green-400 bg-green-500/10' },
    { label: 'Users', value: stats?.users, icon: Users, color: 'text-blue-400 bg-blue-500/10' },
    { label: 'Messages', value: stats?.messages, icon: MessageSquare, color: 'text-purple-400 bg-purple-500/10' },
    { label: 'Campaigns', value: stats?.campaigns, icon: Megaphone, color: 'text-amber-400 bg-amber-500/10' },
    { label: 'Active Subscriptions', value: stats?.activeSubscriptions, icon: CreditCard, color: 'text-pink-400 bg-pink-500/10' },
  ];

  const volumeData = (volume || []).map((v) => ({ name: v.status, value: v._count, color: statusColors[v.status] || '#6b7280' }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Platform Overview</h1>
        <p className="text-sm text-gray-400">Real-time metrics across all tenants</p>
      </div>

      {/* Revenue banner */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-800 bg-gradient-to-r from-green-900/40 to-emerald-900/20 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-600">
            <IndianRupee className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Total Revenue (paid invoices)</p>
            <p className="text-2xl font-bold text-white">₹{(revenue?.totalRevenue ?? 0).toLocaleString('en-IN')}</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-400">
          <TrendingUp className="h-3.5 w-3.5" /> Lifetime
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.color}`}>
              <c.icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-2xl font-bold text-white">
              {statsLoading ? '—' : (c.value ?? 0).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-gray-400">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Message volume chart */}
      <div className="mt-6 rounded-2xl border border-gray-800 bg-gray-900 p-5">
        <h2 className="mb-4 text-sm font-semibold text-white">Message Volume by Status (last 30 days)</h2>
        {volumeData.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">No message data yet.</div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData}>
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={{ stroke: '#374151' }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={{ stroke: '#374151' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff' }}
                  cursor={{ fill: '#ffffff08' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {volumeData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
