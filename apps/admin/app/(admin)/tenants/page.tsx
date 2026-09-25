'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Search, Ban, CheckCircle2, Loader2, Users, MessageSquare, Megaphone } from 'lucide-react';
import api from '@/lib/api';

type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: string;
  subscription?: { plan?: { name?: string } } | null;
  _count?: { members: number; contacts: number; campaigns: number };
};

const statuses = ['', 'ACTIVE', 'TRIAL', 'SUSPENDED'];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ACTIVE: 'bg-green-500/10 text-green-400',
    TRIAL: 'bg-amber-500/10 text-amber-400',
    SUSPENDED: 'bg-red-500/10 text-red-400',
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${map[status] || 'bg-gray-500/10 text-gray-400'}`}>{status}</span>;
}

export default function TenantsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tenants', search, status],
    queryFn: async () =>
      (await api.get('/admin/tenants', { params: { search: search || undefined, status: status || undefined, pageSize: 50 } })).data.data as {
        items: Tenant[];
        total: number;
      },
  });

  const suspend = useMutation({
    mutationFn: (id: string) => api.post(`/admin/tenants/${id}/suspend`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-tenants'] }),
  });
  const activate = useMutation({
    mutationFn: (id: string) => api.post(`/admin/tenants/${id}/activate`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-tenants'] }),
  });

  const tenants = data?.items || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Tenants</h1>
        <p className="text-sm text-gray-400">Manage all businesses on the platform</p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-800 bg-gray-900 px-3 py-2">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or slug..."
            className="w-full bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-1.5">
          {statuses.map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setStatus(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                status === s ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
          <h2 className="text-sm font-semibold text-white">All Tenants</h2>
          <span className="text-xs text-gray-500">{data?.total ?? 0} total</span>
        </div>
        {isLoading ? (
          <div className="p-10 text-center text-sm text-gray-500">Loading tenants...</div>
        ) : tenants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <Building2 className="h-8 w-8 text-gray-600" />
            <p className="mt-3 text-sm text-gray-400">No tenants match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left text-xs text-gray-500">
                  <th className="px-4 py-3 font-medium">Business</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Usage</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {tenants.map((t) => {
                  const busy = suspend.isPending || activate.isPending;
                  return (
                    <tr key={t.id} className="hover:bg-gray-800/40">
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{t.name}</p>
                        <p className="text-xs text-gray-500">{t.slug}</p>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                      <td className="px-4 py-3 text-gray-300">{t.subscription?.plan?.name || 'Free'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{t._count?.members ?? 0}</span>
                          <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{t._count?.contacts ?? 0}</span>
                          <span className="flex items-center gap-1"><Megaphone className="h-3 w-3" />{t._count?.campaigns ?? 0}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{new Date(t.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3 text-right">
                        {t.status === 'SUSPENDED' ? (
                          <button
                            onClick={() => activate.mutate(t.id)}
                            disabled={busy}
                            className="inline-flex items-center gap-1 rounded-lg bg-green-600/20 px-2.5 py-1.5 text-xs font-medium text-green-400 hover:bg-green-600/30 disabled:opacity-50"
                          >
                            {activate.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                            Activate
                          </button>
                        ) : (
                          <button
                            onClick={() => suspend.mutate(t.id)}
                            disabled={busy}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-600/20 px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-600/30 disabled:opacity-50"
                          >
                            {suspend.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
                            Suspend
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
