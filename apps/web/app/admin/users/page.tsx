'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, UserCheck, Clock, Phone, Eye, Ban, CheckCircle2, Loader2, X, Mail, Calendar, ShieldCheck, Building2 } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Pagination } from '@/components/admin/pagination';

type AdminUserRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  phoneNumber: string | null;
};

type UserDetail = AdminUserRow & {
  displayName?: string | null;
  emailVerifiedAt?: string | null;
  twoFactorEnabled?: boolean;
  source?: string | null;
  loginAttempts?: number;
  tenantMemberships?: { isActive: boolean; joinedAt: string; tenant: { id: string; name: string; slug: string; status: string }; role: { name: string } }[];
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ACTIVE: 'bg-green-50 text-green-700',
    PENDING: 'bg-amber-50 text-amber-700',
    SUSPENDED: 'bg-red-50 text-red-600',
    INACTIVE: 'bg-gray-100 text-gray-500',
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${map[status] || 'bg-gray-100 text-gray-500'}`}>{status}</span>;
}

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewId, setViewId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, page],
    queryFn: async () =>
      (await api.get('/admin/users', { params: { search: search || undefined, page, pageSize: PAGE_SIZE } })).data.data as {
        items: AdminUserRow[];
        total: number;
      },
  });

  const suspend = useMutation({
    mutationFn: (id: string) => api.post(`/admin/users/${id}/suspend`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast({ title: 'User suspended' }); },
    onError: (e: any) => toast({ title: 'Action failed', description: e.response?.data?.error?.message || 'Try again', variant: 'destructive' }),
  });
  const activate = useMutation({
    mutationFn: (id: string) => api.post(`/admin/users/${id}/activate`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast({ title: 'User activated' }); },
    onError: (e: any) => toast({ title: 'Action failed', description: e.response?.data?.error?.message || 'Try again', variant: 'destructive' }),
  });

  const users = data?.items || [];
  const busy = suspend.isPending || activate.isPending;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500">All registered users across the platform</p>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
        <Search className="h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or email..."
          className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">All Users</h2>
          <span className="text-xs text-gray-400">{data?.total ?? 0} total</span>
        </div>
        {isLoading ? (
          <div className="p-10 text-center text-sm text-gray-400">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <Users className="h-8 w-8 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">No users match your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-400">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Verified</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                          {(u.firstName?.[0] || '') + (u.lastName?.[0] || '')}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                    <td className="px-4 py-3">
                      {u.emailVerified
                        ? <span className="inline-flex items-center gap-1 text-xs text-green-600"><UserCheck className="h-3.5 w-3.5" /> Verified</span>
                        : <span className="inline-flex items-center gap-1 text-xs text-amber-600"><Clock className="h-3.5 w-3.5" /> Pending</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {u.phoneNumber ? <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{u.phoneNumber}</span> : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewId(u.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </button>
                        {u.status === 'SUSPENDED' ? (
                          <button
                            onClick={() => activate.mutate(u.id)}
                            disabled={busy}
                            className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
                          >
                            {activate.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />} Activate
                          </button>
                        ) : (
                          <button
                            onClick={() => suspend.mutate(u.id)}
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

      {viewId && <UserDetailModal id={viewId} onClose={() => setViewId(null)} />}
    </div>
  );
}

function UserDetailModal({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['admin-user', id],
    queryFn: async () => (await api.get(`/admin/users/${id}`)).data.data as UserDetail,
  });

  const fmt = (d?: string | null) => (d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—');
  const membership = user?.tenantMemberships?.[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>

        {isLoading || !user ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-lg font-bold text-blue-700">
                {(user.firstName?.[0] || '') + (user.lastName?.[0] || '')}
              </div>
              <div>
                <p className="text-base font-bold text-gray-900">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <StatusBadge status={user.status} />
                  {user.emailVerified && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">Verified</span>}
                  {user.twoFactorEnabled && <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-600">2FA</span>}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {[
                { icon: Phone, label: 'Phone', value: user.phoneNumber || '—' },
                { icon: ShieldCheck, label: 'Role', value: membership?.role?.name || '—' },
                { icon: Building2, label: 'Workspace', value: membership?.tenant?.name || '—' },
                { icon: Mail, label: 'Signup source', value: user.source || '—' },
                { icon: Calendar, label: 'Joined', value: fmt(user.createdAt) },
                { icon: Clock, label: 'Last login', value: fmt(user.lastLoginAt) },
              ].map((d) => (
                <div key={d.label} className="flex items-center gap-2.5 rounded-lg bg-gray-50 px-3 py-2.5">
                  <d.icon className="h-4 w-4 shrink-0 text-gray-400" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wide text-gray-400">{d.label}</p>
                    <p className="truncate text-sm text-gray-900">{d.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {membership?.tenant && (
              <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 text-xs text-gray-500">
                Member of <span className="font-medium text-gray-900">{membership.tenant.name}</span> ({membership.tenant.slug}) · workspace status {membership.tenant.status}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
