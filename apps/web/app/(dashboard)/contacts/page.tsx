'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Search, Upload, Phone, Tag, X, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { DashboardPageScaffold } from '@/components/dashboard/page-scaffold';
import { Pagination } from '@/components/ui/pagination';

const PAGE_SIZE = 20;

type Contact = { id: string; name?: string; firstName?: string; lastName?: string; phoneNumber?: string; phone?: string; email?: string; tags?: { name: string }[] | string[] };

export default function ContactsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ firstName: '', lastName: '', phoneNumber: '', email: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['contacts', search, page],
    queryFn: async () => {
      const r = await api.get('/contacts', { params: { search: search || undefined, page, pageSize: PAGE_SIZE } });
      return r.data.data;
    },
    retry: false,
    placeholderData: { items: [], total: 0 },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: typeof form) => (await api.post('/contacts', payload)).data.data,
    onSuccess: () => {
      toast({ title: 'Contact added' });
      setShowAdd(false);
      setForm({ firstName: '', lastName: '', phoneNumber: '', email: '' });
      qc.invalidateQueries({ queryKey: ['contacts'] });
    },
    onError: (err: any) => toast({ title: 'Could not add contact', description: err.response?.data?.error?.message || 'Error', variant: 'destructive' }),
  });

  const filtered: Contact[] = data?.items || data?.contacts || (Array.isArray(data) ? data : []);
  const total: number = data?.total ?? filtered.length;

  return (
    <DashboardPageScaffold
      title="Contacts"
      description="Manage your WhatsApp audience"
      icon={Users}
      actions={
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Upload className="h-4 w-4" /> Import
          </button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-2 text-sm font-semibold text-white hover:bg-green-600">
            <Plus className="h-4 w-4" /> Add Contact
          </button>
        </div>
      }
    >
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-100 p-4">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search contacts..." className="w-full bg-transparent text-sm focus:outline-none" />
          </div>
          <span className="text-xs text-gray-400">{total} contacts</span>
        </div>

        {isLoading ? (
          <div className="p-10 text-center text-sm text-gray-400">Loading contacts...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-gray-900">No contacts yet</h3>
            <p className="mt-1 max-w-sm text-sm text-gray-500">Add your first contact to start messaging.</p>
            <button onClick={() => setShowAdd(true)} className="mt-5 flex items-center gap-1.5 rounded-lg bg-green-500 px-5 py-2 text-sm font-semibold text-white hover:bg-green-600">
              <Plus className="h-4 w-4" /> Add your first contact
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(c => {
              const name = c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unnamed';
              const phone = c.phoneNumber || c.phone || '—';
              const tags = (c.tags || []).map((t: any) => (typeof t === 'string' ? t : t.name));
              return (
                <div key={c.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                      {name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{name}</p>
                      <p className="flex items-center gap-1 text-xs text-gray-400"><Phone className="h-3 w-3" /> {phone}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {tags.slice(0, 3).map((t: string) => (
                      <span key={t} className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"><Tag className="h-2.5 w-2.5" /> {t}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
      </div>

      {/* Add contact modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Add Contact</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} placeholder="First name" className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
                <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} placeholder="Last name" className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
              </div>
              <input value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })} placeholder="Phone (e.g. +919812345678)" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email (optional)" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowAdd(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button
                onClick={() => createMutation.mutate(form)}
                disabled={!form.firstName || !form.phoneNumber || createMutation.isPending}
                className="flex items-center gap-1.5 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60"
              >
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Add Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardPageScaffold>
  );
}
