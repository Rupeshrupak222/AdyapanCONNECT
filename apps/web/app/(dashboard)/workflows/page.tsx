'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GitBranch, Plus, X, Loader2, Zap, Play, Pause, Trash2, MessageSquare, Clock, UserPlus, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DashboardPageScaffold } from '@/components/dashboard/page-scaffold';
import api from '@/lib/api';

type Flow = {
  id: string;
  name: string;
  description?: string;
  trigger?: string;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  nodes?: any[];
  edges?: any[];
};

const triggerOptions = [
  { label: 'New contact added', icon: UserPlus },
  { label: 'Keyword received', icon: MessageSquare },
  { label: 'Contact tagged', icon: Tag },
  { label: 'Scheduled time', icon: Clock },
];

export default function WorkflowsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [detail, setDetail] = useState<Flow | null>(null);
  const [form, setForm] = useState({ name: '', description: '', trigger: 'New contact added' });

  const { data, isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => (await api.get('/workflows')).data.data as Flow[],
    retry: false,
    placeholderData: [],
  });
  const flows: Flow[] = Array.isArray(data) ? data : [];

  const createMut = useMutation({
    mutationFn: async (payload: typeof form) => (await api.post('/workflows', {
      name: payload.name,
      description: payload.description || undefined,
      trigger: payload.trigger,
      nodes: [],
      edges: [],
    })).data.data,
    onSuccess: () => {
      toast({ title: 'Flow created', description: 'Saved as draft.' });
      setShowCreate(false);
      setForm({ name: '', description: '', trigger: 'New contact added' });
      qc.invalidateQueries({ queryKey: ['workflows'] });
    },
    onError: (e: any) => toast({ title: 'Could not create flow', description: e.response?.data?.error?.message || 'Error', variant: 'destructive' }),
  });

  const toggleMut = useMutation({
    mutationFn: async (f: Flow) => (await api.post(`/workflows/${f.id}/toggle`, { active: f.status !== 'ACTIVE' })).data.data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workflows'] }); setDetail(null); },
    onError: (e: any) => toast({ title: 'Action failed', description: e.response?.data?.error?.message || 'Error', variant: 'destructive' }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/workflows/${id}`)).data.data,
    onSuccess: () => { toast({ title: 'Flow deleted' }); setDetail(null); qc.invalidateQueries({ queryKey: ['workflows'] }); },
    onError: (e: any) => toast({ title: 'Delete failed', description: e.response?.data?.error?.message || 'Error', variant: 'destructive' }),
  });

  const activeCount = flows.filter(f => f.status === 'ACTIVE').length;

  return (
    <DashboardPageScaffold
      title="Flows"
      description="Automate conversations with no-code workflows"
      icon={GitBranch}
      actions={
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-2 text-sm font-semibold text-white hover:bg-green-600">
          <Plus className="h-4 w-4" /> Create Flow
        </button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: 'Active Flows', value: activeCount, icon: Zap, color: 'text-green-600 bg-green-50' },
          { label: 'Total Flows', value: flows.length, icon: GitBranch, color: 'text-blue-600 bg-blue-50' },
          { label: 'Drafts', value: flows.filter(f => f.status !== 'ACTIVE').length, icon: Clock, color: 'text-amber-600 bg-amber-50' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Flow list */}
      {isLoading ? (
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-400">Loading flows...</div>
      ) : flows.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50"><GitBranch className="h-6 w-6 text-green-600" /></div>
          <h3 className="mt-4 text-base font-semibold text-gray-900">No flows yet</h3>
          <p className="mt-1 max-w-sm text-sm text-gray-500">Create your first automation flow.</p>
          <button onClick={() => setShowCreate(true)} className="mt-5 flex items-center gap-1.5 rounded-lg bg-green-500 px-5 py-2 text-sm font-semibold text-white hover:bg-green-600">
            <Plus className="h-4 w-4" /> Create Flow
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {flows.map(f => (
            <div key={f.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                    <GitBranch className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{f.name}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${f.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {f.status === 'ACTIVE' ? 'Active' : 'Draft'}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">Trigger: {f.trigger || '—'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setDetail(f)} className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">View</button>
                  <button onClick={() => toggleMut.mutate(f)} disabled={toggleMut.isPending} className="flex items-center gap-1.5 rounded-lg bg-[#0b3d2e] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0f4d3a] disabled:opacity-50">
                    {f.status === 'ACTIVE' ? <><Pause className="h-3.5 w-3.5" /> Pause</> : <><Play className="h-3.5 w-3.5" /> Activate</>}
                  </button>
                </div>
              </div>
              {f.description && <p className="mt-3 text-sm text-gray-600">{f.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Create Flow</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 space-y-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Flow name" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description (optional)" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
              <p className="text-xs font-medium text-gray-500">Choose a trigger</p>
              <div className="grid grid-cols-2 gap-2">
                {triggerOptions.map(t => (
                  <button key={t.label} onClick={() => setForm({ ...form, trigger: t.label })}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors ${form.trigger === t.label ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    <t.icon className="h-4 w-4 shrink-0" /> {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={() => createMut.mutate(form)} disabled={!form.name || createMut.isPending} className="flex items-center gap-1.5 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60">
                {createMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Create Flow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDetail(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{detail.name}</h3>
                <p className="text-xs text-gray-400">Trigger: {detail.trigger || '—'}</p>
              </div>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500">Description</p>
              <p className="mt-1 text-sm text-gray-700">{detail.description || '—'}</p>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
              <Zap className="h-4 w-4" /> When: {detail.trigger || '—'}
            </div>
            <div className="mt-6 flex justify-between">
              <button onClick={() => deleteMut.mutate(detail.id)} disabled={deleteMut.isPending} className="flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
                {deleteMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete
              </button>
              <button onClick={() => toggleMut.mutate(detail)} className="flex items-center gap-1.5 rounded-lg bg-[#0b3d2e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f4d3a]">
                {detail.status === 'ACTIVE' ? <><Pause className="h-4 w-4" /> Pause Flow</> : <><Play className="h-4 w-4" /> Activate Flow</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardPageScaffold>
  );
}
