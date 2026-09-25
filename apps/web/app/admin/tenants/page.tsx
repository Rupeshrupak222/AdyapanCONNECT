'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2, Search, Ban, CheckCircle2, Loader2, Users, MessageSquare, Megaphone,
  Eye, X, Contact, FileText, CreditCard, Wallet, Calendar, ShieldCheck,
} from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Pagination } from '@/components/admin/pagination';

const PAGE_SIZE = 20;

type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: string;
  subscription?: { plan?: { name?: string } } | null;
  _count?: { members: number; contacts: number; campaigns: number };
};

type TenantDetail = Tenant & {
  trialEndsAt?: string | null;
  timezone?: string;
  currency?: string;
  subscription?: { status?: string; currentPeriodEnd?: string; plan?: { name?: string; tier?: string; priceMonthly?: number } } | null;
  members?: { id: string; isActive: boolean; joinedAt: string; role: { name: string }; user: { id: string; firstName: string; lastName: string; email: string; status: string } }[];
  stats?: { messages: number; templates: number };
  wallet?: { balance: number; currency: string } | null;
};

const statuses = ['', 'ACTIVE', 'TRIAL', 'SUSPENDED'];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ACTIVE: 'bg-green-50 text-green-700',
    TRIAL: 'bg-amber-50 text-amber-700',
    SUSPENDED: 'bg-red-50 text-red-600',
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${map[status] || 'bg-gray-100 text-gray-500'}`}>{status}</span>;
}

export default function AdminTenantsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [viewId, setViewId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tenants', search, status, page],
    queryFn: async () =>
      (await api.get('/admin/tenants', { params: { search: search || undefined, status: status || undefined, page, pageSize: PAGE_SIZE } })).data.data as {
        items: Tenant[];
        total: number;
      },
  });

  const suspend = useMutation({
    mutationFn: (id: string) => api.post(`/admin/tenants/${id}/suspend`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tenants'] }); toast({ title: 'Tenant suspended' }); },
  });
  const activate = useMutation({
    mutationFn: (id: string) => api.post(`/admin/tenants/${id}/activate`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tenants'] }); toast({ title: 'Tenant activated' }); },
  });

  const tenants = data?.items || [];
  const busy = suspend.isPending || activate.isPending;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Tenants</h1>
        <p className="text-sm text-gray-500">Manage all businesses on the platform</p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or slug..."
            className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
          />
        </div>
        <div className="flex gap-1.5">
          {statuses.map((s) => (
            <button
              key={s || 'all'}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                status === s ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">All Tenants</h2>
          <span className="text-xs text-gray-400">{data?.total ?? 0} total</span>
        </div>
        {isLoading ? (
          <div className="p-10 text-center text-sm text-gray-400">Loading tenants...</div>
        ) : tenants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <Building2 className="h-8 w-8 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">No tenants match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-400">
                  <th className="px-4 py-3 font-medium">Business</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Usage</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.slug}</p>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-4 py-3 text-gray-600">{t.subscription?.plan?.name || 'Free'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{t._count?.members ?? 0}</span>
                        <span className="flex items-center gap-1"><Contact className="h-3 w-3" />{t._count?.contacts ?? 0}</span>
                        <span className="flex items-center gap-1"><Megaphone className="h-3 w-3" />{t._count?.campaigns ?? 0}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(t.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewId(t.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </button>
                        {t.status === 'SUSPENDED' ? (
                          <button
                            onClick={() => activate.mutate(t.id)}
                            disabled={busy}
                            className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
                          >
                            {activate.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />} Activate
                          </button>
                        ) : (
                          <button
                            onClick={() => suspend.mutate(t.id)}
                            disabled={busy}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                          >
                            {suspend.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />} Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={page} pageSize={PAGE_SIZE} total={data?.total ?? 0} onChange={setPage} />
      </div>

      {viewId && <TenantDetailModal id={viewId} onClose={() => setViewId(null)} />}
    </div>
  );
}

function TenantDetailModal({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: t, isLoading } = useQuery({
    queryKey: ['admin-tenant', id],
    queryFn: async () => (await api.get(`/admin/tenants/${id}`)).data.data as TenantDetail,
  });

  const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString('en-IN', { dateStyle: 'medium' } as any) : '—');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-100 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Tenant Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>

        {isLoading || !t ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-lg font-bold text-green-700">
                {t.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-base font-bold text-gray-900">{t.name}</p>
                <p className="text-sm text-gray-500">{t.slug}</p>
                <div className="mt-1"><StatusBadge status={t.status} /></div>
              </div>
            </div>

            {/* Usage stats */}
            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {[
                { icon: Users, label: 'Members', value: t._count?.members ?? 0 },
                { icon: Contact, label: 'Contacts', value: t._count?.contacts ?? 0 },
                { icon: Megaphone, label: 'Campaigns', value: t._count?.campaigns ?? 0 },
                { icon: MessageSquare, label: 'Messages', value: t.stats?.messages ?? 0 },
                { icon: FileText, label: 'Templates', value: t.stats?.templates ?? 0 },
                { icon: Wallet, label: 'Wallet', value: `${t.wallet?.currency || '₹'} ${t.wallet?.balance ?? 0}` },
              ].map((s) => (
                <div key={s.label} className="rounded-lg bg-gray-50 px-3 py-2.5">
                  <s.icon className="h-4 w-4 text-gray-400" />
                  <p className="mt-1.5 text-lg font-bold text-gray-900">{typeof s.value === 'number' ? s.value.toLocaleString('en-IN') : s.value}</p>
                  <p className="text-[11px] text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Subscription */}
            <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-400" />
                <p className="text-sm font-semibold text-gray-900">Subscription</p>
              </div>
              {t.subscription ? (
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 sm:grid-cols-4">
                  <div><p className="text-gray-400">Plan</p><p className="text-gray-900">{t.subscription.plan?.name || '—'}</p></div>
                  <div><p className="text-gray-400">Tier</p><p className="text-gray-900">{t.subscription.plan?.tier || '—'}</p></div>
                  <div><p className="text-gray-400">Status</p><p className="text-gray-900">{t.subscription.status || '—'}</p></div>
                  <div><p className="text-gray-400">Renews</p><p className="text-gray-900">{fmt(t.subscription.currentPeriodEnd)}</p></div>
                </div>
              ) : (
                <p className="text-xs text-gray-400">No paid subscription — on Free / Trial{t.trialEndsAt ? ` (trial ends ${fmt(t.trialEndsAt)})` : ''}.</p>
              )}
            </div>

            {/* Members */}
            <div className="mt-4">
              <div className="mb-2 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-gray-400" />
                <p className="text-sm font-semibold text-gray-900">Members ({t.members?.length ?? 0})</p>
              </div>
              <div className="space-y-2">
                {(t.members || []).map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                        {(m.user.firstName?.[0] || '') + (m.user.lastName?.[0] || '')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{m.user.firstName} {m.user.lastName}</p>
                        <p className="text-[11px] text-gray-400">{m.user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">{m.role.name}</span>
                      <p className="mt-1 flex items-center justify-end gap-1 text-[11px] text-gray-400"><Calendar className="h-3 w-3" />{fmt(m.joinedAt)}</p>
                    </div>
                  </div>
                ))}
                {(t.members?.length ?? 0) === 0 && <p className="py-3 text-center text-sm text-gray-400">No members.</p>}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
