'use client';
import { useQuery } from '@tanstack/react-query';
import { History, MessageSquare, Send, CheckCheck, Eye, XCircle, Users, TrendingUp, Megaphone } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { DashboardPageScaffold } from '@/components/dashboard/page-scaffold';
import api from '@/lib/api';

type Dashboard = {
  totalMessages: number; messagesSent: number; messagesDelivered: number; messagesRead: number; messagesFailed: number;
  deliveryRate: string; readRate: string; activeConversations: number; openLeads: number; campaignsCompleted: number;
};
type TrendRow = { date: string; sent: number; delivered: number; read: number; failed: number; received: number };
type CampaignRow = { id: string; name: string; sentCount: number; deliveredCount: number; readCount: number; deliveryRate: string; readRate: string; completedAt: string };

export default function HistoryPage() {
  const { data: dash, isLoading } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: async () => (await api.get('/analytics/dashboard')).data.data as Dashboard,
    retry: false,
  });

  const { data: trend } = useQuery({
    queryKey: ['analytics-trend'],
    queryFn: async () => (await api.get('/analytics/messages/trend', { params: { days: 30 } })).data.data as TrendRow[],
    retry: false,
    placeholderData: [],
  });

  const { data: campaignsData } = useQuery({
    queryKey: ['analytics-campaigns'],
    queryFn: async () => (await api.get('/analytics/campaigns', { params: { pageSize: 10 } })).data.data,
    retry: false,
    placeholderData: { data: [], items: [] },
  });
  const campaigns: CampaignRow[] = campaignsData?.data || campaignsData?.items || [];

  const cards = [
    { label: 'Total Messages', value: dash?.totalMessages, icon: MessageSquare, color: 'text-green-600 bg-green-50' },
    { label: 'Sent', value: dash?.messagesSent, icon: Send, color: 'text-blue-600 bg-blue-50' },
    { label: 'Delivered', value: dash?.messagesDelivered, icon: CheckCheck, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Read', value: dash?.messagesRead, icon: Eye, color: 'text-purple-600 bg-purple-50' },
    { label: 'Failed', value: dash?.messagesFailed, icon: XCircle, color: 'text-red-600 bg-red-50' },
    { label: 'Active Chats', value: dash?.activeConversations, icon: Users, color: 'text-amber-600 bg-amber-50' },
  ];

  const trendData = (trend || []).map(t => ({ ...t, label: t.date?.slice(5) }));

  return (
    <DashboardPageScaffold title="History & Analytics" description="Your messaging and campaign performance" icon={History}>
      {/* Rate cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-green-100 bg-gradient-to-r from-green-50 to-emerald-50 p-5">
          <div className="flex items-center gap-2 text-xs text-gray-500"><TrendingUp className="h-4 w-4 text-green-600" /> Delivery Rate</div>
          <p className="mt-1 text-3xl font-bold text-gray-900">{dash?.deliveryRate ?? '0'}%</p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
          <div className="flex items-center gap-2 text-xs text-gray-500"><Eye className="h-4 w-4 text-blue-600" /> Read Rate</div>
          <p className="mt-1 text-3xl font-bold text-gray-900">{dash?.readRate ?? '0'}%</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map(c => (
          <div key={c.label} className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${c.color}`}><c.icon className="h-4 w-4" /></div>
            <p className="mt-2 text-lg font-bold text-gray-900">{isLoading ? '—' : (c.value ?? 0).toLocaleString('en-IN')}</p>
            <p className="text-[11px] text-gray-400">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Trend chart */}
      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Message Activity (last 30 days)</h2>
        {trendData.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">No message activity yet. Data appears once you start messaging.</div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={{ stroke: '#e5e7eb' }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={{ stroke: '#e5e7eb' }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }} />
                <Line type="monotone" dataKey="sent" stroke="#3b82f6" strokeWidth={2} dot={false} name="Sent" />
                <Line type="monotone" dataKey="delivered" stroke="#16a34a" strokeWidth={2} dot={false} name="Delivered" />
                <Line type="monotone" dataKey="read" stroke="#a855f7" strokeWidth={2} dot={false} name="Read" />
                <Line type="monotone" dataKey="received" stroke="#f59e0b" strokeWidth={2} dot={false} name="Received" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Completed campaigns */}
      <div className="mt-6 rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
          <Megaphone className="h-4 w-4 text-green-600" />
          <h2 className="text-sm font-semibold text-gray-900">Completed Campaigns</h2>
        </div>
        {campaigns.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">No completed campaigns yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-400">
                  <th className="px-4 py-3 font-medium">Campaign</th>
                  <th className="px-4 py-3 font-medium">Sent</th>
                  <th className="px-4 py-3 font-medium">Delivered</th>
                  <th className="px-4 py-3 font-medium">Read</th>
                  <th className="px-4 py-3 font-medium">Delivery %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {campaigns.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600">{(c.sentCount ?? 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-gray-600">{(c.deliveredCount ?? 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-gray-600">{(c.readCount ?? 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">{c.deliveryRate ?? '0'}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardPageScaffold>
  );
}
