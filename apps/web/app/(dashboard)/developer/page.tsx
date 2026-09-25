'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Code2, Plus, X, Loader2, Copy, Trash2, KeyRound, BookOpen, ExternalLink, CheckCircle2, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DashboardPageScaffold } from '@/components/dashboard/page-scaffold';
import api from '@/lib/api';

type ApiKey = {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
  lastUsedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
};

export default function DeveloperPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);

  const { data: keysData, isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => (await api.get('/developer/api-keys')).data.data as ApiKey[],
    retry: false,
    placeholderData: [],
  });
  const keys: ApiKey[] = Array.isArray(keysData) ? keysData : [];

  const { data: usage } = useQuery({
    queryKey: ['api-usage'],
    queryFn: async () => (await api.get('/developer/usage', { params: { days: 30 } })).data.data as { statusCode: number; _count: number }[],
    retry: false,
    placeholderData: [],
  });
  const totalRequests = (usage || []).reduce((s, u) => s + (u._count || 0), 0);

  const createMut = useMutation({
    mutationFn: async (name: string) => (await api.post('/developer/api-keys', { name, permissions: ['*'] })).data.data as { key: string },
    onSuccess: (data) => {
      setNewKey(data.key);
      setKeyName('');
      qc.invalidateQueries({ queryKey: ['api-keys'] });
    },
    onError: (e: any) => toast({ title: 'Could not create key', description: e.response?.data?.error?.message || 'Error', variant: 'destructive' }),
  });

  const revokeMut = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/developer/api-keys/${id}`)).data.data,
    onSuccess: () => { toast({ title: 'API key revoked' }); qc.invalidateQueries({ queryKey: ['api-keys'] }); },
    onError: (e: any) => toast({ title: 'Revoke failed', description: e.response?.data?.error?.message || 'Error', variant: 'destructive' }),
  });

  const copy = (text: string) => { navigator.clipboard?.writeText(text); toast({ title: 'Copied to clipboard' }); };
  const closeKeyModal = () => { setShowKeyModal(false); setNewKey(null); setKeyName(''); };
  const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString('en-IN') : 'Never');

  return (
    <DashboardPageScaffold title="Developer" description="API keys, usage and documentation" icon={Code2}>
      {/* Usage summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: 'Active API Keys', value: keys.length, icon: KeyRound, color: 'text-green-600 bg-green-50' },
          { label: 'Requests (30d)', value: totalRequests.toLocaleString('en-IN'), icon: Activity, color: 'text-blue-600 bg-blue-50' },
          { label: 'Success (2xx)', value: (usage || []).filter(u => u.statusCode >= 200 && u.statusCode < 300).reduce((s, u) => s + u._count, 0).toLocaleString('en-IN'), icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.color}`}><s.icon className="h-4 w-4" /></div>
            <p className="mt-3 text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* API keys */}
      <div className="mt-6 rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-green-600" />
            <h3 className="text-sm font-semibold text-gray-900">API Keys</h3>
          </div>
          <button onClick={() => setShowKeyModal(true)} className="flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-600">
            <Plus className="h-3.5 w-3.5" /> Generate Key
          </button>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading keys...</div>
        ) : keys.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">No API keys yet. Generate one to start using the API.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {keys.map(k => (
              <div key={k.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">{k.name}</p>
                  <code className="mt-1 inline-block rounded bg-gray-50 px-2 py-1 text-xs text-gray-600">{k.keyPrefix}••••••••••••</code>
                  <p className="mt-1 text-[11px] text-gray-400">Created {fmt(k.createdAt)} · Last used {fmt(k.lastUsedAt)}</p>
                </div>
                <button onClick={() => revokeMut.mutate(k.id)} disabled={revokeMut.isPending} className="flex items-center gap-1.5 self-start rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 sm:self-auto">
                  <Trash2 className="h-3.5 w-3.5" /> Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Docs */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          { title: 'API Reference', desc: 'Full REST API docs with examples.', href: 'https://developers.facebook.com/docs/whatsapp' },
          { title: 'Quickstart Guide', desc: 'Send your first message in 5 minutes.', href: 'https://developers.facebook.com/docs/whatsapp/cloud-api/get-started' },
        ].map(d => (
          <a key={d.title} href={d.href} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:border-green-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50"><BookOpen className="h-5 w-5 text-green-600" /></div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{d.title}</p>
                <p className="text-xs text-gray-500">{d.desc}</p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400" />
          </a>
        ))}
      </div>

      {/* Generate key modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={closeKeyModal}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{newKey ? 'API Key Created' : 'Generate API Key'}</h3>
              <button onClick={closeKeyModal} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>

            {newKey ? (
              <>
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                  Copy this key now — it won&apos;t be shown again.
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                  <code className="flex-1 truncate text-xs text-gray-800">{newKey}</code>
                  <button onClick={() => copy(newKey)} className="flex items-center gap-1 rounded bg-green-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-600"><Copy className="h-3 w-3" /> Copy</button>
                </div>
                <div className="mt-5 flex justify-end">
                  <button onClick={closeKeyModal} className="rounded-lg bg-[#0b3d2e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f4d3a]">Done</button>
                </div>
              </>
            ) : (
              <>
                <input value={keyName} onChange={e => setKeyName(e.target.value)} placeholder="Key name (e.g. Production Key)" className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
                <div className="mt-5 flex justify-end gap-2">
                  <button onClick={closeKeyModal} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button onClick={() => createMut.mutate(keyName)} disabled={!keyName || createMut.isPending} className="flex items-center gap-1.5 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60">
                    {createMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Generate
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardPageScaffold>
  );
}
