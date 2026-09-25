'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquare, Search, Mail, Phone, Building2, X, Loader2, Eye,
  CheckCircle2, Archive, CornerUpLeft, Clock,
} from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Pagination } from '@/components/ui/pagination';

const PAGE_SIZE = 20;

type Enquiry = {
  id: string;
  firstName: string;
  lastName?: string | null;
  email: string;
  phone?: string | null;
  company?: string | null;
  message: string;
  source?: string | null;
  status: 'NEW' | 'READ' | 'RESPONDED' | 'ARCHIVED';
  createdAt: string;
};

const statuses = ['', 'NEW', 'READ', 'RESPONDED', 'ARCHIVED'];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    NEW: 'bg-red-50 text-red-600',
    READ: 'bg-blue-50 text-blue-600',
    RESPONDED: 'bg-green-50 text-green-700',
    ARCHIVED: 'bg-gray-100 text-gray-500',
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${map[status] || 'bg-gray-100 text-gray-500'}`}>{status}</span>;
}

export default function AdminMessagesPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [view, setView] = useState<Enquiry | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-messages', search, status, page],
    queryFn: async () =>
      (await api.get('/contact', { params: { search: search || undefined, status: status || undefined, page, pageSize: PAGE_SIZE } })).data.data as {
        items: Enquiry[];
        total: number;
      },
  });

  const setStatusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.post(`/contact/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-messages'] });
      qc.invalidateQueries({ queryKey: ['admin-unread-messages'] });
    },
    onError: (e: any) => toast({ title: 'Action failed', description: e.response?.data?.error?.message || 'Try again', variant: 'destructive' }),
  });

  const openView = (m: Enquiry) => {
    setView(m);
    // Auto-mark NEW as READ when opened.
    if (m.status === 'NEW') setStatusMut.mutate({ id: m.id, status: 'READ' });
  };

  const items = data?.items || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        <p className="text-sm text-gray-500">Enquiries submitted from the website contact form</p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email or message..."
            className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
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

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">All Enquiries</h2>
          <span className="text-xs text-gray-400">{data?.total ?? 0} total</span>
        </div>
        {isLoading ? (
          <div className="p-10 text-center text-sm text-gray-400">Loading messages...</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <MessageSquare className="h-8 w-8 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">No messages match your filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {items.map((m) => (
              <div key={m.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 ${m.status === 'NEW' ? 'bg-green-50/40' : ''}`}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                  {(m.firstName?.[0] || '') + (m.lastName?.[0] || '')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{m.firstName} {m.lastName}</p>
                    <StatusBadge status={m.status} />
                  </div>
                  <p className="text-xs text-gray-400">{m.email}</p>
                  <p className="mt-1 line-clamp-1 text-sm text-gray-600">{m.message}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="text-[11px] text-gray-400">{new Date(m.createdAt).toLocaleDateString('en-IN')}</span>
                  <button
                    onClick={() => openView(m)}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Eye className="h-3.5 w-3.5" /> View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Pagination page={page} pageSize={PAGE_SIZE} total={data?.total ?? 0} onChange={setPage} />
      </div>

      {/* Detail modal */}
      {view && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setView(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100 text-sm font-bold text-green-700">
                  {(view.firstName?.[0] || '') + (view.lastName?.[0] || '')}
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900">{view.firstName} {view.lastName}</p>
                  <div className="mt-0.5"><StatusBadge status={view.status} /></div>
                </div>
              </div>
              <button onClick={() => setView(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              <a href={`mailto:${view.email}`} className="flex items-center gap-2.5 rounded-lg bg-gray-50 px-3 py-2.5 hover:bg-gray-100">
                <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                <div className="min-w-0"><p className="text-[10px] uppercase tracking-wide text-gray-400">Email</p><p className="truncate text-sm text-gray-900">{view.email}</p></div>
              </a>
              <div className="flex items-center gap-2.5 rounded-lg bg-gray-50 px-3 py-2.5">
                <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                <div className="min-w-0"><p className="text-[10px] uppercase tracking-wide text-gray-400">Phone</p><p className="truncate text-sm text-gray-900">{view.phone || '—'}</p></div>
              </div>
              <div className="flex items-center gap-2.5 rounded-lg bg-gray-50 px-3 py-2.5">
                <Building2 className="h-4 w-4 shrink-0 text-gray-400" />
                <div className="min-w-0"><p className="text-[10px] uppercase tracking-wide text-gray-400">Company</p><p className="truncate text-sm text-gray-900">{view.company || '—'}</p></div>
              </div>
              <div className="flex items-center gap-2.5 rounded-lg bg-gray-50 px-3 py-2.5">
                <Clock className="h-4 w-4 shrink-0 text-gray-400" />
                <div className="min-w-0"><p className="text-[10px] uppercase tracking-wide text-gray-400">Received</p><p className="truncate text-sm text-gray-900">{new Date(view.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p></div>
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-1.5 text-xs font-medium text-gray-500">Message</p>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700 whitespace-pre-wrap">{view.message}</div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <a href={`mailto:${view.email}?subject=Re: your enquiry`} className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
                <CornerUpLeft className="h-4 w-4" /> Reply by email
              </a>
              <button
                onClick={() => { setStatusMut.mutate({ id: view.id, status: 'RESPONDED' }); setView({ ...view, status: 'RESPONDED' }); }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
              >
                <CheckCircle2 className="h-4 w-4" /> Mark responded
              </button>
              <button
                onClick={() => { setStatusMut.mutate({ id: view.id, status: 'ARCHIVED' }); setView(null); }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                <Archive className="h-4 w-4" /> Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
