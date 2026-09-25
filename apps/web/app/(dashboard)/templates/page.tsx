'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Plus, X, Loader2, FileText } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { DashboardPageScaffold } from '@/components/dashboard/page-scaffold';
import { Pagination } from '@/components/ui/pagination';

const CATEGORIES = ['MARKETING', 'UTILITY', 'AUTHENTICATION'];
const PAGE_SIZE = 20;

export default function TemplatesPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ name: '', category: 'MARKETING', language: 'en', body: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['templates', page],
    queryFn: async () => (await api.get('/templates', { params: { page, pageSize: PAGE_SIZE } })).data.data,
    retry: false,
    placeholderData: { items: [], total: 0 },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: typeof form) => {
      // ensure a connected (sandbox) number exists so template create has a valid FK
      try { await api.post('/whatsapp/sandbox'); } catch { /* ignore if already exists */ }
      return (await api.post('/templates', payload)).data.data;
    },
    onSuccess: () => {
      toast({ title: 'Template created', description: 'Saved as draft.' });
      setShowAdd(false);
      setForm({ name: '', category: 'MARKETING', language: 'en', body: '' });
      qc.invalidateQueries({ queryKey: ['templates'] });
    },
    onError: (err: any) => toast({ title: 'Could not create template', description: err.response?.data?.error?.message || 'Error', variant: 'destructive' }),
  });

  const submitMutation = useMutation({
    mutationFn: async (id: string) => (await api.post(`/templates/${id}/submit`)).data.data,
    onSuccess: () => {
      toast({ title: 'Submitted to Meta', description: 'Template sent for WhatsApp approval.' });
      qc.invalidateQueries({ queryKey: ['templates'] });
    },
    onError: (err: any) => toast({ title: 'Submit failed', description: err.response?.data?.error?.message || 'Connect a real WhatsApp number first.', variant: 'destructive' }),
  });

  const items = data?.items || [];
  const total: number = data?.total ?? items.length;

  const statusColor = (s: string) => ({
    APPROVED: 'bg-green-100 text-green-700', DRAFT: 'bg-gray-100 text-gray-600',
    SUBMITTED: 'bg-blue-100 text-blue-700', PENDING: 'bg-amber-100 text-amber-700',
    REJECTED: 'bg-red-100 text-red-700',
  }[s] || 'bg-gray-100 text-gray-600');

  return (
    <DashboardPageScaffold
      title="Message Templates"
      description="Create and manage WhatsApp message templates"
      icon={Mail}
      actions={
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-2 text-sm font-semibold text-white hover:bg-green-600">
          <Plus className="h-4 w-4" /> New Template
        </button>
      }
    >
      {isLoading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-400">Loading...</div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50"><FileText className="h-6 w-6 text-green-600" /></div>
          <h3 className="mt-4 text-base font-semibold text-gray-900">No templates yet</h3>
          <p className="mt-1 max-w-sm text-sm text-gray-500">Create a template to send structured WhatsApp messages.</p>
          <button onClick={() => setShowAdd(true)} className="mt-5 flex items-center gap-1.5 rounded-lg bg-green-500 px-5 py-2 text-sm font-semibold text-white hover:bg-green-600"><Plus className="h-4 w-4" /> New Template</button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((t: any) => (
              <div key={t.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">{t.name}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(t.status)}`}>{t.status}</span>
                </div>
                <div className="mt-1 flex gap-2 text-xs text-gray-400">
                  <span>{t.category}</span><span>·</span><span>{t.language}</span>
                </div>
                <p className="mt-3 line-clamp-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">{t.body}</p>
                {['DRAFT', 'REJECTED'].includes(t.status) && (
                  <button
                    onClick={() => submitMutation.mutate(t.id)}
                    disabled={submitMutation.isPending}
                    className="mt-3 w-full rounded-lg bg-green-500 py-2 text-xs font-semibold text-white hover:bg-green-600 disabled:opacity-60"
                  >
                    Submit for approval
                  </button>
                )}
                {t.status === 'REJECTED' && t.rejectionReason && (
                  <p className="mt-2 text-[11px] text-red-500">Reason: {t.rejectionReason}</p>
                )}
              </div>
            ))}
          </div>
          {total > PAGE_SIZE && (
            <div className="mt-4 rounded-2xl border border-gray-100 bg-white">
              <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
            </div>
          )}
        </>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">New Template</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 space-y-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })} placeholder="template_name (lowercase, no spaces)" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none">
                  <option value="en">English</option><option value="hi">Hindi</option><option value="en_US">English (US)</option>
                </select>
              </div>
              <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} rows={4} placeholder="Message body. Use {{1}}, {{2}} for variables." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowAdd(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={() => createMutation.mutate(form)} disabled={!form.name || !form.body || createMutation.isPending} className="flex items-center gap-1.5 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60">
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Template
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardPageScaffold>
  );
}
