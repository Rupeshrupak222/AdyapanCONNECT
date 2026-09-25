'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Blocks, Plus, X, Loader2, Bot, Trash2, Play, Pause, GitBranch } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DashboardPageScaffold } from '@/components/dashboard/page-scaffold';
import api from '@/lib/api';

type Chatbot = {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  flows?: { id: string; name: string; isDefault: boolean; version: number }[];
};

export default function ChatbotsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['chatbots'],
    queryFn: async () => (await api.get('/chatbots')).data.data as Chatbot[],
    retry: false,
    placeholderData: [],
  });
  const bots: Chatbot[] = Array.isArray(data) ? data : [];

  const createMut = useMutation({
    mutationFn: async (payload: typeof form) => (await api.post('/chatbots', {
      name: payload.name,
      description: payload.description || undefined,
    })).data.data,
    onSuccess: () => {
      toast({ title: 'Chatbot created' });
      setShowCreate(false);
      setForm({ name: '', description: '' });
      qc.invalidateQueries({ queryKey: ['chatbots'] });
    },
    onError: (e: any) => toast({ title: 'Could not create chatbot', description: e.response?.data?.error?.message || 'Error', variant: 'destructive' }),
  });

  const toggleMut = useMutation({
    mutationFn: async (b: Chatbot) => (await api.put(`/chatbots/${b.id}`, { isActive: !b.isActive })).data.data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chatbots'] }),
    onError: (e: any) => toast({ title: 'Action failed', description: e.response?.data?.error?.message || 'Error', variant: 'destructive' }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/chatbots/${id}`)).data.data,
    onSuccess: () => { toast({ title: 'Chatbot deleted' }); qc.invalidateQueries({ queryKey: ['chatbots'] }); },
    onError: (e: any) => toast({ title: 'Delete failed', description: e.response?.data?.error?.message || 'Error', variant: 'destructive' }),
  });

  return (
    <DashboardPageScaffold
      title="Chatbots"
      description="Build no-code chatbots to auto-reply on WhatsApp"
      icon={Blocks}
      actions={
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-2 text-sm font-semibold text-white hover:bg-green-600">
          <Plus className="h-4 w-4" /> New Chatbot
        </button>
      }
    >
      {isLoading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-400">Loading chatbots...</div>
      ) : bots.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50"><Blocks className="h-6 w-6 text-green-600" /></div>
          <h3 className="mt-4 text-base font-semibold text-gray-900">No chatbots yet</h3>
          <p className="mt-1 max-w-sm text-sm text-gray-500">Create a chatbot to automatically respond to incoming messages.</p>
          <button onClick={() => setShowCreate(true)} className="mt-5 flex items-center gap-1.5 rounded-lg bg-green-500 px-5 py-2 text-sm font-semibold text-white hover:bg-green-600">
            <Plus className="h-4 w-4" /> New Chatbot
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {bots.map(b => (
            <div key={b.id} className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50"><Bot className="h-5 w-5 text-green-600" /></div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{b.name}</p>
                    <p className="flex items-center gap-1 text-xs text-gray-400"><GitBranch className="h-3 w-3" /> {b.flows?.length ?? 0} flow(s)</p>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {b.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="mt-3 line-clamp-2 flex-1 text-sm text-gray-600">{b.description || 'No description'}</p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => toggleMut.mutate(b)} disabled={toggleMut.isPending} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-300 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                  {b.isActive ? <><Pause className="h-3.5 w-3.5" /> Pause</> : <><Play className="h-3.5 w-3.5" /> Activate</>}
                </button>
                <button onClick={() => deleteMut.mutate(b.id)} disabled={deleteMut.isPending} className="flex items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">
                  {deleteMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">New Chatbot</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 space-y-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Chatbot name" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What does this chatbot do?" rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={() => createMut.mutate(form)} disabled={!form.name || createMut.isPending} className="flex items-center gap-1.5 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60">
                {createMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Create Chatbot
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardPageScaffold>
  );
}
