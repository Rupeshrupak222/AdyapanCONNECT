'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2, Gift, Users, Megaphone, Star, TrendingUp, Copy,
  Phone, Pencil, ChevronRight, Info, MessageSquare, Zap, ExternalLink,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { getInitials } from '@/lib/utils';

function StatusCard({ label, value, valueClass, badge }: { label: string; value: string; valueClass?: string; badge?: boolean }) {
  return (
    <div className="flex-1 px-5 py-4">
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        {label} <Info className="h-3 w-3" />
      </div>
      {badge ? (
        <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${valueClass}`}>{value}</span>
      ) : (
        <p className={`mt-2 text-xl font-bold ${valueClass ?? 'text-gray-900'}`}>{value}</p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user, tenantSlug } = useAuthStore();

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => { const r = await api.get('/analytics/dashboard'); return r.data.data; },
    placeholderData: { remainingQuota: 2000, qualityRating: 'High' },
    retry: false,
  });

  // Real setup-progress signals
  const { data: numbers } = useQuery({
    queryKey: ['wa-numbers'],
    queryFn: async () => (await api.get('/whatsapp/numbers')).data.data as any[],
    retry: false,
    placeholderData: [],
  });
  const { data: contactsData } = useQuery({
    queryKey: ['dash-contacts-count'],
    queryFn: async () => (await api.get('/contacts', { params: { pageSize: 1 } })).data.data,
    retry: false,
    placeholderData: { total: 0, items: [] },
  });
  const { data: campaignsData } = useQuery({
    queryKey: ['dash-campaigns-count'],
    queryFn: async () => (await api.get('/campaigns', { params: { pageSize: 1 } })).data.data,
    retry: false,
    placeholderData: { meta: { total: 0 }, data: [] },
  });

  const isLiveNumber = Array.isArray(numbers) && numbers.some((n: any) => n.status === 'CONNECTED' && n.displayPhoneNumber !== 'Sandbox Business');
  const isSandboxNumber = Array.isArray(numbers) && numbers.some((n: any) => n.displayPhoneNumber === 'Sandbox Business');
  const hasNumber = isLiveNumber || isSandboxNumber;

  const contactsCount = contactsData?.total ?? contactsData?.meta?.total ?? (contactsData?.items?.length || 0);
  const campaignsCount = campaignsData?.meta?.total ?? campaignsData?.total ?? (campaignsData?.data?.length || 0);

  const apiStatusValue = isLiveNumber ? 'LIVE' : isSandboxNumber ? 'SANDBOX' : 'NOT CONNECTED';
  const apiStatusClass = isLiveNumber ? 'bg-green-100 text-green-700' : isSandboxNumber ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600';

  const businessName =
    user?.tenantName ||
    (tenantSlug && tenantSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())) ||
    (user ? `${user.firstName} ${user.lastName}` : 'My Workspace');

  const referralLink = `wa.adyapanconnect.com/${(tenantSlug || 'demo').slice(0, 8)}`;

  const setupSteps = [
    { label: 'Create your account', done: true, href: '/settings', cta: 'View' },
    { label: 'Verify your email address', done: user?.emailVerified ?? false, href: `/verify-email${user?.email ? `?email=${encodeURIComponent(user.email)}` : ''}`, cta: 'Verify now' },
    { label: 'Connect WhatsApp Business number', done: isLiveNumber, action: 'connect' as const, cta: 'Connect' },
    { label: 'Import your first contacts', done: contactsCount > 0, href: '/contacts', cta: 'Import' },
    { label: 'Send your first broadcast', done: campaignsCount > 0, href: '/campaigns', cta: 'Create' },
  ];
  const doneCount = setupSteps.filter(s => s.done).length;
  const nextStepIndex = setupSteps.findIndex(s => !s.done);

  const promos = [
    { title: 'Onboarding Call', desc: 'Schedule a call with our team to get set up faster.', cta: 'Schedule Now', href: '/settings', bg: 'bg-blue-50', icon: Phone, iconColor: 'text-blue-600' },
    { title: 'Feedback & Earn Credits', desc: 'Share your feedback and earn free WhatsApp credits.', cta: 'Give Feedback', href: '/settings', bg: 'bg-purple-50', icon: Star, iconColor: 'text-purple-600' },
    { title: 'Join Affiliate Program', desc: 'Earn 20% recurring commission on every referral.', cta: 'Become a Partner', href: '/partner', bg: 'bg-amber-50', icon: Users, iconColor: 'text-amber-600' },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 xl:grid-cols-3">
      {/* Main column */}
      <div className="space-y-6 xl:col-span-2">
        {/* Status cards */}
        <div className="flex flex-col divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white shadow-sm sm:flex-row sm:divide-x sm:divide-y-0">
          <StatusCard label="WhatsApp Business API Status" value={apiStatusValue} badge valueClass={apiStatusClass} />
          <StatusCard label="Quality Rating" value={stats?.qualityRating || 'High'} badge valueClass="bg-green-100 text-green-700" />
          <StatusCard label="Remaining Quota" value={String(stats?.remainingQuota ?? 2000)} valueClass="text-green-600" />
        </div>

        {/* Offer code banner */}
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/60 p-4 sm:flex-row sm:items-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500">
            <Gift className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">Got an offer access code?</p>
            <p className="text-xs text-gray-500">Activate your special discounted offer now!</p>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <input placeholder="Enter access code" className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none sm:w-40" />
            <button className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600">Activate</button>
          </div>
        </div>

        {/* Setup steps */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <h2 className="text-sm font-semibold text-gray-900">Setup FREE WhatsApp Business Account</h2>
            </div>
            <span className="text-xs font-medium text-gray-400">{doneCount}/{setupSteps.length} done</span>
          </div>
          <div className="mt-4 space-y-2">
            {setupSteps.map((step, i) => {
              const isNext = i === nextStepIndex;
              return (
                <div
                  key={step.label}
                  className={`flex items-center gap-3 rounded-lg px-2 py-2 transition-colors ${isNext ? 'bg-green-50 ring-1 ring-green-200' : ''}`}
                >
                  <CheckCircle2 className={`h-5 w-5 shrink-0 ${step.done ? 'text-green-500' : isNext ? 'text-green-400' : 'text-gray-300'}`} />
                  <span className={`flex-1 text-sm ${step.done ? 'text-gray-400 line-through' : isNext ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                    {step.label}
                  </span>
                  {step.done ? (
                    <span className="shrink-0 text-xs font-medium text-green-600">Done</span>
                  ) : (step as any).action === 'connect' ? (
                    <Link
                      href="/settings/whatsapp"
                      className={`flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        isNext ? 'bg-green-500 text-white hover:bg-green-600' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {step.cta} <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <Link
                      href={(step as any).href}
                      className={`flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        isNext ? 'bg-green-500 text-white hover:bg-green-600' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {step.cta} <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${(doneCount / setupSteps.length) * 100}%` }} />
          </div>
          {nextStepIndex !== -1 && (
            <p className="mt-3 text-xs text-gray-500">
              Next up: <span className="font-medium text-gray-700">{setupSteps[nextStepIndex].label}</span> — complete all steps to go live.
            </p>
          )}
        </div>

        {/* Setup Ads */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h2 className="text-sm font-semibold text-gray-900">Setup account to run Ads</h2>
            </div>
            <Link href="/campaigns/ads" className="rounded-lg bg-[#0b3d2e] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#0f4d3a]">Setup</Link>
          </div>
          <div className="mt-3 rounded-lg bg-green-50/60 px-4 py-3 text-sm text-gray-600">
            Set up your Meta ad account to run Click-to-WhatsApp ads and reach more customers.
          </div>
        </div>

        {/* Refer & Earn */}
        <div className="rounded-2xl border border-green-100 bg-gradient-to-r from-green-50 to-emerald-50 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <Megaphone className="h-4 w-4 text-green-600" />
                <h3 className="text-sm font-semibold text-gray-900">Refer &amp; Earn</h3>
              </div>
              <p className="mt-1 text-xs text-gray-600">Share your referral link and earn ₹2000 per signup.</p>
              <div className="mt-3 flex max-w-md items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
                <span className="flex-1 truncate text-xs text-gray-600">{referralLink}</span>
                <button className="flex items-center gap-1 rounded bg-green-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-600">
                  <Copy className="h-3 w-3" /> Copy
                </button>
              </div>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-xs text-gray-500">Total Earned</p>
              <p className="text-lg font-bold text-green-600">₹0</p>
            </div>
          </div>
        </div>

        {/* Promo grid */}
        <div className="grid gap-4 sm:grid-cols-3">
          {promos.map(p => (
            <div key={p.title} className={`rounded-2xl ${p.bg} p-4`}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/70">
                <p.icon className={`h-5 w-5 ${p.iconColor}`} />
              </div>
              <h4 className="mt-3 text-sm font-semibold text-gray-900">{p.title}</h4>
              <p className="mt-1 text-xs text-gray-600">{p.desc}</p>
              <Link href={p.href} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-gray-800 hover:text-green-700">
                {p.cta} <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-6">
        {/* Download app */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Scan to download the Mobile app</h3>
          <div className="mt-4 flex items-center gap-4">
            <div className="grid h-28 w-28 grid-cols-8 grid-rows-8 gap-[2px] rounded-lg border border-gray-200 p-1.5">
              {Array.from({ length: 64 }).map((_, i) => {
                const on = (i * 7 + (i % 5) * 3 + Math.floor(i / 8)) % 3 === 0;
                const corner = (i % 8 < 2 && i < 16) || (i % 8 > 5 && i < 16) || (i % 8 < 2 && i >= 48);
                return <div key={i} className={(on || corner) ? 'bg-gray-900' : 'bg-transparent'} />;
              })}
            </div>
            <ul className="space-y-1.5 text-xs text-gray-600">
              <li className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Real-time notifications</li>
              <li className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Live Chat on the go</li>
              <li className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Ads Management</li>
              <li className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Analytics Dashboard</li>
            </ul>
          </div>
        </div>

        {/* Profile card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">{businessName}</p>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-700">
                <Phone className="h-3.5 w-3.5 text-green-600" /> +91 91777 03046
              </p>
              <Link href="/settings" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700">
                View Profile <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
                {user ? getInitials(`${user.firstName} ${user.lastName}`) : 'AD'}
              </div>
              <Link href="/settings" className="text-gray-400 hover:text-gray-600"><Pencil className="h-3.5 w-3.5" /></Link>
            </div>
          </div>
        </div>

        {/* Credits */}
        <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Advertisement Credits</p>
              <p className="text-lg font-bold text-gray-900">₹0</p>
            </div>
            <Link href="/billing" className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">Buy Credits</Link>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-500">Free Service Conversations</p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100">
              <div className="h-full w-0 rounded-full bg-green-500" />
            </div>
            <p className="mt-1 text-right text-[11px] text-gray-400">0 / Unlimited</p>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <div>
              <p className="text-xs text-gray-500">WhatsApp Conversation Credits</p>
              <p className="text-lg font-bold text-gray-900">₹208.50</p>
            </div>
            <Link href="/billing" className="rounded-lg bg-[#0b3d2e] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0f4d3a]">Buy More</Link>
          </div>
        </div>

        {/* Current plan */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-green-600" />
            <p className="text-xs text-gray-500">Current Plan</p>
          </div>
          <p className="mt-1 text-base font-bold text-gray-900">FREE FOREVER</p>
          <p className="mt-1 text-xs text-gray-500">You don&apos;t have any active paid plan.</p>
          <Link href="/billing" className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-[#0b3d2e] py-2.5 text-sm font-semibold text-white hover:bg-[#0f4d3a]">
            Get a Plan <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
