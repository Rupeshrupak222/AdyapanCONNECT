'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Briefcase, Plus, X, Loader2, IndianRupee, User } from 'lucide-react';
import { DashboardPageScaffold } from '@/components/dashboard/page-scaffold';
import { useToast } from '@/hooks/use-toast';
import { Pagination } from '@/components/ui/pagination';
import api from '@/lib/api';

const PAGE_SIZE = 20;

type Lead = {
  id: string;
  title?: string;
  status?: string;
  value?: number;
  source?: string;
  createdAt: string;
  contact?: { firstName?: string; lastName?: string; phoneNumber?: string } | null;
  owner?: { firstName?: string; lastName?: string } | null;
};

const STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'CONVERTED', 'LOST'];

type ContactOption = { id: string; firstName?: string; lastName?: string; name?: string; phoneNumber?: string };

function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, string> = {
    NEW: 'bg-blue-50 text-blue-600',
    CONTACTED: 'bg-amber-50 text-amber-700',
    QUALIFIED: 'bg-purple-50 text-purple-600',
    UNQUALIFIED: 'bg-gray-100 text-gray-500',
    CONVERTED: 'bg-green-50 text-green-700',
    LOST: 'bg-red-50 text-red-600',
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${map[status || ''] || 'bg-gray-100 text-gray-500'}`}>{status || 'NEW'}</span>;
}

export default function CrmPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', value: '', source: '', status: 'NEW', contactId: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['crm-leads', page, statusFilter],
    queryFn: async () => (await api.get('/crm/leads', { params: { page, pageSize: PAGE_SIZE, status: statusFilter || undefined } })).data.data,
    retry: false,
    placeholderData: { data: [], meta: { total: 0 } },
  });

  // Leads must be attached to a contact — load them for the picker.
  const { data: contactsData } = useQuery({
    queryKey: ['crm-contacts-picker'],
    queryFn: async () => (await api.get('/contacts', { params: { pageSize: 100 } })).data.data,
    retry: false,
    enabled: showAdd,
    placeholderData: { items: [] },
  });
  const contactOptions: ContactOption[] = contactsData?.items || contactsData?.contacts || [];

  // buildPaginatedResponse -> { data, meta } inside the interceptor's data
  const leads: Lead[] = data?.data || data?.items || [];
  const total: number = data?.meta?.total ?? data?.total ?? leads.length;

  const createMut = useMutation({
    mutationFn: async (payload: typeof form) => (await api.post('/crm/leads', {
      title: payload.title,
      contactId: payload.contactId,
      status: payload.status,
      value: payload.value ? Number(payload.value) : undefined,
      source: payload.source || undefined,
    })).data.data,
    onSuccess: () => {
      toast({ title: 'Lead added' });
      setShowAdd(false);
      setForm({ title: '', value: '', source: '', status: 'NEW', contactId: '' });
      qc.invalidateQueries({ queryKey: ['crm-leads'] });
    },
    onError: (e: any) => toast({ title: 'Could not add lead', description: e.response?.data?.error?.message || 'Error', variant: 'destructive' }),
  });

  return (
    <DashboardPageScaffold
      title="CRM"
      description="Track leads across your sales pipeline"
      icon={Briefcase}
      actions={
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-2 text-sm font-semibold text-white hover:bg-green-600">
          <Plus className="h-4 w-4" /> Add Lead
        </button>
      }
    >
      {/* Status filter */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        <button onClick={() => { setStatusFilter(''); setPage(1); }} className={`rounded-full px-3 py-1.5 text-xs font-medium ${statusFilter === '' ? 'bg-green-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>All</button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`rounded-full px-3 py-1.5 text-xs font-medium ${statusFilter === s ? 'bg-green-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>{s}</button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Leads</h2>
          <span className="text-xs text-gray-400">{total} total</span>
        </div>
        {isLoading ? (
          <div className="p-10 text-center text-sm text-gray-400">Loading leads...</div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50"><Briefcase className="h-6 w-6 text-green-600" /></div>
            <h3 className="mt-4 text-base font-semibold text-gray-900">No leads yet</h3>
            <p className="mt-1 max-w-sm text-sm text-gray-500">Add your first lead to start tracking your pipeline.</p>
            <button onClick={() => setShowAdd(true)} className="mt-5 flex items-center gap-1.5 rounded-lg bg-green-500 px-5 py-2 text-sm font-semibold text-white hover:bg-green-600"><Plus className="h-4 w-4" /> Add Lead</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-400">
                  <th className="px-4 py-3 font-medium">Lead</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Value</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{l.title || 'Untitled lead'}</p>
                      {l.contact && <p className="flex items-center gap-1 text-xs text-gray-400"><User className="h-3 w-3" /> {l.contact.firstName} {l.contact.lastName}</p>}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                    <td className="px-4 py-3 font-medium text-gray-700">{l.value ? `₹${l.value.toLocaleString('en-IN')}` : '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{l.source || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(l.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
      </div>

      {/* Add lead modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Add Lead</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 space-y-3">
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Lead title (e.g. Website enquiry)" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
              <div>
                <select value={form.contactId} onChange={e => setForm({ ...form, contactId: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-green-500 focus:outline-none">
                  <option value="">Select a contact…</option>
                  {contactOptions.map(c => {
                    const label = (c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.phoneNumber || 'Unnamed');
                    return <option key={c.id} value={c.id}>{label}</option>;
                  })}
                </select>
                {contactOptions.length === 0 && <p className="mt-1 text-[11px] text-amber-600">No contacts found. Add a contact first in the Contacts page.</p>}
              </div>
              <div className="flex items-center rounded-lg border border-gray-300 px-3 focus-within:border-green-500">
                <IndianRupee className="h-4 w-4 text-gray-400" />
                <input value={form.value} onChange={e => setForm({ ...form, value: e.target.value.replace(/[^0-9]/g, '') })} placeholder="Deal value (optional)" className="w-full bg-transparent px-2 py-2 text-sm focus:outline-none" />
              </div>
              <input value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} placeholder="Source (e.g. WhatsApp, Referral)" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowAdd(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={() => createMut.mutate(form)} disabled={!form.title || !form.contactId || createMut.isPending} className="flex items-center gap-1.5 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60">
                {createMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Add Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardPageScaffold>
  );
}
