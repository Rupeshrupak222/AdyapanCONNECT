'use client';
import { useState } from 'react';
import { BarChart3, Plus, X, Loader2, Play, Pause, Eye, MousePointerClick, IndianRupee, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DashboardPageScaffold } from '@/components/dashboard/page-scaffold';

type Ad = {
  id: string;
  name: string;
  objective: string;
  status: 'active' | 'paused';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  leads: number;
};

const seedAds: Ad[] = [
  { id: 'ad1', name: 'Diwali Click-to-WhatsApp', objective: 'Messages', status: 'active', budget: 5000, spent: 3240, impressions: 84200, clicks: 3120, leads: 412 },
  { id: 'ad2', name: 'New Product Launch', objective: 'Leads', status: 'active', budget: 8000, spent: 6100, impressions: 152000, clicks: 5400, leads: 738 },
  { id: 'ad3', name: 'Retargeting - Cart', objective: 'Conversions', status: 'paused', budget: 3000, spent: 3000, impressions: 41000, clicks: 1800, leads: 205 },
];

export default function AdsManagerPage() {
  const { toast } = useToast();
  const [ads, setAds] = useState<Ad[]>(seedAds);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', objective: 'Messages', budget: '' });

  const toggle = (id: string) => {
    setAds(prev => prev.map(a => (a.id === id ? { ...a, status: a.status === 'active' ? 'paused' : 'active' } : a)));
  };

  const create = () => {
    if (!form.name || !form.budget) return;
    setSaving(true);
    setTimeout(() => {
      setAds(prev => [{ id: `ad${Date.now()}`, name: form.name, objective: form.objective, status: 'active', budget: Number(form.budget), spent: 0, impressions: 0, clicks: 0, leads: 0 }, ...prev]);
      setSaving(false);
      setShowCreate(false);
      setForm({ name: '', objective: 'Messages', budget: '' });
      toast({ title: 'Ad campaign created', description: form.name });
    }, 600);
  };

  const totalSpent = ads.reduce((s, a) => s + a.spent, 0);
  const totalImpr = ads.reduce((s, a) => s + a.impressions, 0);
  const totalClicks = ads.reduce((s, a) => s + a.clicks, 0);
  const totalLeads = ads.reduce((s, a) => s + a.leads, 0);
  const ctr = totalImpr ? ((totalClicks / totalImpr) * 100).toFixed(2) : '0';

  return (
    <DashboardPageScaffold
      title="Ads Manager"
      description="Run Click-to-WhatsApp ads and track performance"
      icon={BarChart3}
      actions={
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-2 text-sm font-semibold text-white hover:bg-green-600">
          <Plus className="h-4 w-4" /> Create Ad
        </button>
      }
    >
      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, icon: IndianRupee, color: 'text-green-600 bg-green-50' },
          { label: 'Impressions', value: totalImpr.toLocaleString(), icon: Eye, color: 'text-blue-600 bg-blue-50' },
          { label: 'Clicks', value: totalClicks.toLocaleString(), icon: MousePointerClick, color: 'text-purple-600 bg-purple-50' },
          { label: 'CTR', value: `${ctr}%`, icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
        ].map(m => (
          <div key={m.label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${m.color}`}>
              <m.icon className="h-4 w-4" />
            </div>
            <p className="mt-3 text-xs text-gray-400">{m.label}</p>
            <p className="text-lg font-bold text-gray-900">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Ads table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Ad Campaigns</h3>
          <span className="text-xs text-gray-400">{totalLeads.toLocaleString()} total leads</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-400">
                <th className="px-4 py-3 font-medium">Campaign</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Budget / Spent</th>
                <th className="px-4 py-3 font-medium">Clicks</th>
                <th className="px-4 py-3 font-medium">Leads</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ads.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{a.name}</p>
                    <p className="text-xs text-gray-400">{a.objective}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${a.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {a.status === 'active' ? 'Active' : 'Paused'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    ₹{a.spent.toLocaleString()} <span className="text-gray-400">/ ₹{a.budget.toLocaleString()}</span>
                    <div className="mt-1 h-1 w-24 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-green-500" style={{ width: `${Math.min(100, (a.spent / a.budget) * 100)}%` }} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{a.clicks.toLocaleString()}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{a.leads.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toggle(a.id)} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                      {a.status === 'active' ? <><Pause className="h-3.5 w-3.5" /> Pause</> : <><Play className="h-3.5 w-3.5" /> Resume</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Create Ad Campaign</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 space-y-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Campaign name" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
              <select value={form.objective} onChange={e => setForm({ ...form, objective: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none">
                <option>Messages</option>
                <option>Leads</option>
                <option>Conversions</option>
                <option>Traffic</option>
              </select>
              <div className="flex items-center rounded-lg border border-gray-300 px-3 focus-within:border-green-500">
                <span className="text-sm text-gray-400">₹</span>
                <input value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value.replace(/[^0-9]/g, '') })} placeholder="Daily budget" className="w-full bg-transparent px-2 py-2 text-sm focus:outline-none" />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={create} disabled={!form.name || !form.budget || saving} className="flex items-center gap-1.5 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Launch Ad
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardPageScaffold>
  );
}
