'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Wallet, Check, X, Loader2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { DashboardPageScaffold } from '@/components/dashboard/page-scaffold';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { payWithRazorpay } from '@/lib/razorpay';
import { useAuthStore } from '@/store/auth.store';

type Plan = { id: string; name: string; tier: string; priceMonthly: number; featuresJson: string[] | any };
type WalletData = { balance: number; currency: string } | null;
type Txn = { id: string; type: string; amount: number; description?: string; createdAt: string };

export default function BillingPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [showRecharge, setShowRecharge] = useState(false);
  const [amount, setAmount] = useState('');
  const [payingPlan, setPayingPlan] = useState<string | null>(null);
  const [rechargeLoading, setRechargeLoading] = useState(false);
  const customerName = user ? `${user.firstName} ${user.lastName}` : 'Customer';

  const { data: wallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => (await api.get('/billing/wallet')).data.data as WalletData,
    retry: false,
  });

  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => (await api.get('/billing/plans')).data.data as Plan[],
    retry: false,
    placeholderData: [],
  });

  const { data: sub } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => (await api.get('/billing/subscription')).data.data as { plan?: { id: string; name: string } } | null,
    retry: false,
  });

  const { data: txnData } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: async () => (await api.get('/billing/wallet/transactions', { params: { pageSize: 10 } })).data.data as { transactions: Txn[] },
    retry: false,
    placeholderData: { transactions: [] },
  });

  // Wallet top-up via real Razorpay payment
  const handleRecharge = async (amt: number) => {
    setRechargeLoading(true);
    try {
      const result = await payWithRazorpay({
        type: 'wallet',
        amount: amt,
        name: customerName,
        email: user?.email,
        description: `Wallet top-up ₹${amt}`,
      });
      if (result) {
        toast({ title: 'Payment successful', description: `₹${amt} added to your wallet.` });
        setShowRecharge(false);
        setAmount('');
        qc.invalidateQueries({ queryKey: ['wallet'] });
        qc.invalidateQueries({ queryKey: ['wallet-transactions'] });
      }
    } catch (e: any) {
      toast({ title: 'Payment failed', description: e.response?.data?.error?.message || e.message || 'Try again', variant: 'destructive' });
    } finally {
      setRechargeLoading(false);
    }
  };

  // Plan purchase via real Razorpay payment
  const handleSubscribe = async (planId: string, planName: string) => {
    setPayingPlan(planId);
    try {
      const result = await payWithRazorpay({
        type: 'plan',
        planId,
        name: customerName,
        email: user?.email,
        description: `${planName} plan`,
      });
      if (result) {
        toast({ title: 'Payment successful', description: `You're now on the ${planName} plan.` });
        qc.invalidateQueries({ queryKey: ['subscription'] });
      }
    } catch (e: any) {
      toast({ title: 'Payment failed', description: e.response?.data?.error?.message || e.message || 'Try again', variant: 'destructive' });
    } finally {
      setPayingPlan(null);
    }
  };

  const planList: Plan[] = Array.isArray(plans) ? plans : [];
  const currentPlanId = sub?.plan?.id;
  const txns: Txn[] = txnData?.transactions || [];
  const balance = wallet?.balance ?? 0;

  const features = (p: Plan): string[] => Array.isArray(p.featuresJson) ? p.featuresJson : [];

  return (
    <DashboardPageScaffold title="WA Payments & Billing" description="Manage your plan, wallet and invoices" icon={CreditCard}>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Wallet */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2"><Wallet className="h-5 w-5 text-green-600" /><h3 className="text-sm font-semibold text-gray-900">Wallet Balance</h3></div>
          <p className="mt-3 text-2xl font-bold text-gray-900">₹{balance.toLocaleString('en-IN')}</p>
          <button onClick={() => setShowRecharge(true)} className="mt-3 w-full rounded-lg bg-green-500 py-2 text-sm font-semibold text-white hover:bg-green-600">Add Credits</button>

          {/* Recent transactions */}
          <div className="mt-5 border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-500">Recent transactions</p>
            <div className="mt-2 space-y-2">
              {txns.length === 0 ? (
                <p className="text-xs text-gray-400">No transactions yet.</p>
              ) : txns.slice(0, 5).map(t => (
                <div key={t.id} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-gray-600">
                    {t.type === 'CREDIT' ? <ArrowDownCircle className="h-3.5 w-3.5 text-green-500" /> : <ArrowUpCircle className="h-3.5 w-3.5 text-red-400" />}
                    {t.description || t.type}
                  </span>
                  <span className={t.type === 'CREDIT' ? 'font-medium text-green-600' : 'font-medium text-red-500'}>
                    {t.type === 'CREDIT' ? '+' : '-'}₹{Math.abs(t.amount).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Plans */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Plans</h3>
          {planList.length === 0 ? (
            <p className="mt-4 text-sm text-gray-400">No plans available.</p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {planList.map(p => {
                const isCurrent = p.id === currentPlanId || (!currentPlanId && p.tier === 'STARTER');
                return (
                  <div key={p.id} className={`flex flex-col rounded-xl border p-4 ${isCurrent ? 'border-green-500 ring-1 ring-green-500/20' : 'border-gray-100'}`}>
                    <p className="text-sm font-bold text-gray-900">{p.name}</p>
                    <p className="mt-1 text-lg font-bold text-gray-900">₹{p.priceMonthly.toLocaleString('en-IN')}<span className="text-xs font-normal text-gray-400">/mo</span></p>
                    <ul className="mt-3 flex-1 space-y-1.5">
                      {features(p).slice(0, 4).map(f => <li key={f} className="flex items-start gap-1.5 text-xs text-gray-600"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" /> {f}</li>)}
                    </ul>
                    {isCurrent
                      ? <span className="mt-3 block rounded-lg bg-gray-100 py-1.5 text-center text-xs font-semibold text-gray-500">Current Plan</span>
                      : <button onClick={() => handleSubscribe(p.id, p.name)} disabled={payingPlan === p.id} className="mt-3 flex items-center justify-center gap-1 rounded-lg bg-green-500 py-1.5 text-center text-xs font-semibold text-white hover:bg-green-600 disabled:opacity-60">
                          {payingPlan === p.id && <Loader2 className="h-3 w-3 animate-spin" />} {p.priceMonthly > 0 ? 'Buy Plan' : 'Switch'}
                        </button>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recharge modal */}
      {showRecharge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowRecharge(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Add Credits</h3>
              <button onClick={() => setShowRecharge(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 flex items-center rounded-lg border border-gray-300 px-3 focus-within:border-green-500">
              <span className="text-sm text-gray-400">₹</span>
              <input value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ''))} placeholder="Amount" className="w-full bg-transparent px-2 py-2.5 text-sm focus:outline-none" />
            </div>
            <div className="mt-3 flex gap-2">
              {[500, 1000, 2000].map(a => (
                <button key={a} onClick={() => setAmount(String(a))} className="flex-1 rounded-lg border border-gray-200 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">₹{a}</button>
              ))}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowRecharge(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleRecharge(Number(amount))} disabled={!amount || Number(amount) <= 0 || rechargeLoading} className="flex items-center gap-1.5 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60">
                {rechargeLoading && <Loader2 className="h-4 w-4 animate-spin" />} Pay ₹{amount || '0'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardPageScaffold>
  );
}
