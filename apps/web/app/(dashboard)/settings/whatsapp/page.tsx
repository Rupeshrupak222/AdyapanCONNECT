'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Plus, X, Loader2, CheckCircle2, ShieldCheck, Phone, Zap } from 'lucide-react';
import { DashboardPageScaffold } from '@/components/dashboard/page-scaffold';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { launchEmbeddedSignup, isEmbeddedSignupConfigured } from '@/lib/meta-signup';

type Number = {
  id: string;
  displayPhoneNumber: string;
  businessName?: string;
  verifiedName?: string;
  status: string;
  qualityRating?: string;
  waba?: { name?: string };
};

export default function WhatsAppSettingsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [connecting, setConnecting] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manual, setManual] = useState({ wabaId: '', phoneNumberId: '', displayPhoneNumber: '', accessToken: '', businessName: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['wa-numbers-settings'],
    queryFn: async () => (await api.get('/whatsapp/numbers')).data.data as Number[],
    retry: false,
    placeholderData: [],
  });
  const numbers: Number[] = Array.isArray(data) ? data : [];

  // Embedded signup (BSP) — real Meta popup
  const startEmbedded = async () => {
    setConnecting(true);
    try {
      const result = await launchEmbeddedSignup();
      await api.post('/whatsapp/embedded-signup', result);
      toast({ title: 'WhatsApp connected!', description: 'Your number is now live on Adyapan Connect.' });
      qc.invalidateQueries({ queryKey: ['wa-numbers-settings'] });
    } catch (e: any) {
      toast({ title: 'Could not connect', description: e.response?.data?.error?.message || e.message || 'Try again', variant: 'destructive' });
    } finally {
      setConnecting(false);
    }
  };

  const manualMut = useMutation({
    mutationFn: async () => (await api.post('/whatsapp/connect', manual)).data.data,
    onSuccess: () => {
      toast({ title: 'Number connected' });
      setShowManual(false);
      setManual({ wabaId: '', phoneNumberId: '', displayPhoneNumber: '', accessToken: '', businessName: '' });
      qc.invalidateQueries({ queryKey: ['wa-numbers-settings'] });
    },
    onError: (e: any) => toast({ title: 'Connect failed', description: e.response?.data?.error?.message || 'Check the details and token.', variant: 'destructive' }),
  });

  const sandboxMut = useMutation({
    mutationFn: async () => (await api.post('/whatsapp/sandbox')).data.data,
    onSuccess: () => { toast({ title: 'Test number connected' }); qc.invalidateQueries({ queryKey: ['wa-numbers-settings'] }); },
  });

  const configured = isEmbeddedSignupConfigured();

  return (
    <DashboardPageScaffold
      title="WhatsApp Setup"
      description="Connect your WhatsApp Business number to start messaging"
      icon={MessageCircle}
    >
      {/* Connected numbers */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Connected Numbers</h2>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading...</div>
        ) : numbers.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">No number connected yet. Connect one below to go live.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {numbers.map(n => (
              <div key={n.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50"><Phone className="h-5 w-5 text-green-600" /></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{n.displayPhoneNumber}</p>
                    <p className="text-xs text-gray-400">{n.verifiedName || n.businessName || n.waba?.name || 'WhatsApp Business'}</p>
                  </div>
                </div>
                <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${n.status === 'CONNECTED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {n.status === 'CONNECTED' && <CheckCircle2 className="h-3 w-3" />} {n.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connect options */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Embedded signup */}
        <div className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-600"><ShieldCheck className="h-6 w-6 text-white" /></div>
          <h3 className="mt-4 text-base font-bold text-gray-900">Connect with Meta (recommended)</h3>
          <p className="mt-1 text-sm text-gray-600">One-click embedded signup. Log in with Facebook, pick your number, and you&apos;re live. Meta bills your own account directly.</p>
          <button
            onClick={startEmbedded}
            disabled={connecting || !configured}
            className="mt-4 flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
          >
            {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            Connect WhatsApp
          </button>
          {!configured && (
            <p className="mt-2 text-[11px] text-amber-600">Embedded signup activates once the platform&apos;s Meta App is approved & configured.</p>
          )}
        </div>

        {/* Manual / test */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-900">Other options</h3>
          <p className="mt-1 text-sm text-gray-600">Already have API credentials? Connect manually. Or spin up a test number to explore the platform.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => setShowManual(true)} className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              <Plus className="h-4 w-4" /> Manual connect
            </button>
            <button onClick={() => sandboxMut.mutate()} disabled={sandboxMut.isPending} className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60">
              {sandboxMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Use test number
            </button>
          </div>
        </div>
      </div>

      {/* Manual connect modal */}
      {showManual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowManual(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Manual Connect</h3>
              <button onClick={() => setShowManual(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 space-y-3">
              <input value={manual.wabaId} onChange={e => setManual({ ...manual, wabaId: e.target.value })} placeholder="WABA ID" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
              <input value={manual.phoneNumberId} onChange={e => setManual({ ...manual, phoneNumberId: e.target.value })} placeholder="Phone Number ID" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
              <input value={manual.displayPhoneNumber} onChange={e => setManual({ ...manual, displayPhoneNumber: e.target.value })} placeholder="Display number (e.g. +91 98765 43210)" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
              <input value={manual.businessName} onChange={e => setManual({ ...manual, businessName: e.target.value })} placeholder="Business name" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
              <textarea value={manual.accessToken} onChange={e => setManual({ ...manual, accessToken: e.target.value })} placeholder="Access token" rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowManual(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={() => manualMut.mutate()} disabled={!manual.wabaId || !manual.phoneNumberId || !manual.accessToken || manualMut.isPending} className="flex items-center gap-1.5 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60">
                {manualMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardPageScaffold>
  );
}
