'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bot, Plus, X, Loader2, Play, Pause, Zap, MessageSquare, Settings2, Trash2, Send, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DashboardPageScaffold } from '@/components/dashboard/page-scaffold';
import api from '@/lib/api';

type Agent = {
  id: string;
  name: string;
  description?: string;
  systemPrompt?: string;
  model: string;
  temperature?: number;
  isActive: boolean;
  fallbackMessage?: string;
  humanHandoffEnabled?: boolean;
};

export default function AiAgentsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [detail, setDetail] = useState<Agent | null>(null);
  const [form, setForm] = useState({ name: '', description: '', model: 'gpt-4-turbo-preview', systemPrompt: '', fallbackMessage: '' });
  const [chat, setChat] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [testMsg, setTestMsg] = useState('');

  const testMut = useMutation({
    mutationFn: async ({ id, message }: { id: string; message: string }) => (await api.post(`/ai/agents/${id}/test`, { message })).data.data as { reply: string },
    onSuccess: (data) => setChat(prev => [...prev, { role: 'assistant', text: data.reply }]),
    onError: (e: any) => {
      setChat(prev => [...prev, { role: 'assistant', text: `⚠️ ${e.response?.data?.error?.message || 'AI request failed'}` }]);
    },
  });

  const sendTest = () => {
    if (!testMsg.trim() || !detail) return;
    const msg = testMsg.trim();
    setChat(prev => [...prev, { role: 'user', text: msg }]);
    setTestMsg('');
    testMut.mutate({ id: detail.id, message: msg });
  };

  const openDetail = (a: Agent) => { setDetail(a); setChat([]); setTestMsg(''); };

  const { data, isLoading } = useQuery({
    queryKey: ['ai-agents'],
    queryFn: async () => (await api.get('/ai/agents')).data.data as Agent[],
    retry: false,
    placeholderData: [],
  });
  const agents: Agent[] = Array.isArray(data) ? data : [];

  const createMut = useMutation({
    mutationFn: async (payload: typeof form) => (await api.post('/ai/agents', {
      name: payload.name,
      description: payload.description || undefined,
      model: payload.model,
      systemPrompt: payload.systemPrompt || undefined,
      fallbackMessage: payload.fallbackMessage || undefined,
    })).data.data,
    onSuccess: () => {
      toast({ title: 'AI Agent created' });
      setShowCreate(false);
      setForm({ name: '', description: '', model: 'gpt-4-turbo-preview', systemPrompt: '', fallbackMessage: '' });
      qc.invalidateQueries({ queryKey: ['ai-agents'] });
    },
    onError: (e: any) => toast({ title: 'Could not create agent', description: e.response?.data?.error?.message || 'Error', variant: 'destructive' }),
  });

  const toggleMut = useMutation({
    mutationFn: async (a: Agent) => (await api.put(`/ai/agents/${a.id}`, { isActive: !a.isActive })).data.data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ai-agents'] }); },
    onError: (e: any) => toast({ title: 'Action failed', description: e.response?.data?.error?.message || 'Error', variant: 'destructive' }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/ai/agents/${id}`)).data.data,
    onSuccess: () => { toast({ title: 'Agent deleted' }); setDetail(null); qc.invalidateQueries({ queryKey: ['ai-agents'] }); },
    onError: (e: any) => toast({ title: 'Delete failed', description: e.response?.data?.error?.message || 'Error', variant: 'destructive' }),
  });

  const activeCount = agents.filter(a => a.isActive).length;

  return (
    <DashboardPageScaffold
      title="AI Agent"
      description="Deploy AI agents that handle chats for you"
      icon={Bot}
      actions={
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-2 text-sm font-semibold text-white hover:bg-green-600">
          <Plus className="h-4 w-4" /> Create Agent
        </button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Agents', value: agents.length, icon: Bot, color: 'text-green-600 bg-green-50' },
          { label: 'Active Agents', value: activeCount, icon: Zap, color: 'text-blue-600 bg-blue-50' },
          { label: 'Paused', value: agents.length - activeCount, icon: Pause, color: 'text-amber-600 bg-amber-50' },
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

      {/* Agent list */}
      {isLoading ? (
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-400">Loading agents...</div>
      ) : agents.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50"><Bot className="h-6 w-6 text-green-600" /></div>
          <h3 className="mt-4 text-base font-semibold text-gray-900">No agents yet</h3>
          <p className="mt-1 max-w-sm text-sm text-gray-500">Create your first AI agent to auto-handle conversations.</p>
          <button onClick={() => setShowCreate(true)} className="mt-5 flex items-center gap-1.5 rounded-lg bg-green-500 px-5 py-2 text-sm font-semibold text-white hover:bg-green-600">
            <Plus className="h-4 w-4" /> Create Agent
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {agents.map(a => (
            <div key={a.id} className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                    <Bot className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{a.name}</p>
                    <p className="text-xs text-gray-400">{a.model}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${a.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {a.isActive ? 'Active' : 'Paused'}
                </span>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-gray-600">{a.description || 'No description'}</p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => toggleMut.mutate(a)} disabled={toggleMut.isPending} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-300 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                  {a.isActive ? <><Pause className="h-3.5 w-3.5" /> Pause</> : <><Play className="h-3.5 w-3.5" /> Activate</>}
                </button>
                <button onClick={() => openDetail(a)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#0b3d2e] py-2 text-xs font-semibold text-white hover:bg-[#0f4d3a]">
                  <Sparkles className="h-3.5 w-3.5" /> Test
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
              <h3 className="text-lg font-semibold text-gray-900">Create AI Agent</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 space-y-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Agent name (e.g. Sales Assistant)" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short description" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
              <select value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none">
                <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o mini</option>
              </select>
              <textarea value={form.systemPrompt} onChange={e => setForm({ ...form, systemPrompt: e.target.value })} placeholder="System prompt — how the agent should behave" rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
              <textarea value={form.fallbackMessage} onChange={e => setForm({ ...form, fallbackMessage: e.target.value })} placeholder="Fallback message (optional)" rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={() => createMut.mutate(form)} disabled={!form.name || createMut.isPending} className="flex items-center gap-1.5 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60">
                {createMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Create Agent
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
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                  <Bot className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{detail.name}</h3>
                  <p className="text-xs text-gray-400">{detail.model} · {detail.isActive ? 'Active' : 'Paused'}</p>
                </div>
              </div>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500">Description</p>
              <p className="mt-1 text-sm text-gray-700">{detail.description || '—'}</p>
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500">System prompt</p>
              <div className="mt-1 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700 whitespace-pre-wrap">{detail.systemPrompt || '—'}</div>
            </div>
            {detail.fallbackMessage && (
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-500">Fallback message</p>
                <div className="mt-1 rounded-lg bg-green-50/60 px-3 py-2 text-sm text-gray-700">{detail.fallbackMessage}</div>
              </div>
            )}

            {/* Live AI test chat */}
            <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
                <Sparkles className="h-4 w-4 text-green-600" />
                <p className="text-xs font-semibold text-gray-700">Test this agent (live AI)</p>
              </div>
              <div className="max-h-48 space-y-2 overflow-y-auto p-3">
                {chat.length === 0 && <p className="py-4 text-center text-xs text-gray-400">Send a message to see how this agent replies.</p>}
                {chat.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.role === 'user' ? 'rounded-br-sm bg-green-600 text-white' : 'rounded-bl-sm bg-white text-gray-800 shadow-sm'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {testMut.isPending && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-sm text-gray-400 shadow-sm">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> thinking…
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 border-t border-gray-100 p-2">
                <input
                  value={testMsg}
                  onChange={e => setTestMsg(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') sendTest(); }}
                  placeholder="Type a message…"
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                />
                <button onClick={sendTest} disabled={!testMsg.trim() || testMut.isPending} className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button onClick={() => deleteMut.mutate(detail.id)} disabled={deleteMut.isPending} className="flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
                {deleteMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete
              </button>
              <button onClick={() => { toggleMut.mutate(detail); setDetail(null); }} className="flex items-center gap-1.5 rounded-lg bg-[#0b3d2e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f4d3a]">
                {detail.isActive ? <><Pause className="h-4 w-4" /> Pause Agent</> : <><Play className="h-4 w-4" /> Activate Agent</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardPageScaffold>
  );
}
