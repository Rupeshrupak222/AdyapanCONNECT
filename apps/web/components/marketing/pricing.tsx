'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Starter', price: 999, period: '/mo', color: 'border-gray-200',
    badge: null,
    description: 'Perfect for small businesses getting started',
    features: ['1 WhatsApp Number', '5,000 Contacts', '3 Team Members', '10 Campaigns/month', 'Basic Analytics', 'Shared Inbox', 'Template Manager', 'API Access'],
  },
  {
    name: 'Growth', price: 2499, period: '/mo', color: 'border-green-500',
    badge: 'Most Popular',
    description: 'For growing teams that need more power',
    features: ['3 WhatsApp Numbers', '25,000 Contacts', '15 Team Members', '50 Campaigns/month', 'Advanced Analytics', 'AI Agent (5,000 msgs)', 'Chatbot Builder', 'Workflow Automation', 'CRM & Pipelines', 'Priority Support'],
  },
  {
    name: 'Business', price: 5999, period: '/mo', color: 'border-gray-200',
    badge: null,
    description: 'For high-volume businesses',
    features: ['10 WhatsApp Numbers', '1,00,000 Contacts', '50 Team Members', 'Unlimited Campaigns', 'Full Analytics Suite', 'AI Agent (25,000 msgs)', 'Advanced Workflows', 'Developer API (500K req)', 'Audit Logs', 'SLA Support'],
  },
  {
    name: 'Enterprise', price: 0, period: 'custom', color: 'border-gray-200',
    badge: null,
    description: 'For large enterprises & agencies',
    features: ['Unlimited Numbers', 'Unlimited Contacts', 'Unlimited Members', 'Dedicated Infrastructure', 'Custom AI Training', 'White Label', 'Agency Mode', 'SSO / SAML', 'Custom Integrations', 'Dedicated Support'],
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(false);
  return (
    <section id="pricing" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-lg text-gray-600">
            Start free. Scale as you grow. No hidden fees.
          </p>
          <div className="mt-6 inline-flex items-center rounded-full border border-gray-200 p-1 bg-gray-50 gap-1">
            <button onClick={() => setAnnual(false)} className={cn('rounded-full px-4 py-1.5 text-sm font-medium transition-all', !annual ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500')}>Monthly</button>
            <button onClick={() => setAnnual(true)} className={cn('rounded-full px-4 py-1.5 text-sm font-medium transition-all', annual ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500')}>
              Annual <span className="ml-1 text-xs text-green-600 font-semibold">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map(plan => (
            <div key={plan.name} className={cn('relative rounded-2xl border-2 bg-white p-6 flex flex-col', plan.color, plan.badge && 'ring-2 ring-green-500 ring-offset-2')}>
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-green-600 px-3 py-0.5 text-xs font-semibold text-white">
                  {plan.badge}
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <p className="mt-1 text-xs text-gray-500">{plan.description}</p>
                <div className="mt-4 flex items-end gap-1">
                  {plan.price > 0 ? (
                    <>
                      <span className="text-4xl font-extrabold text-gray-900">
                        ₹{annual ? Math.round(plan.price * 0.8).toLocaleString('en-IN') : plan.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-sm text-gray-400 mb-1">/mo</span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-gray-900">Contact us</span>
                  )}
                </div>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href={plan.price === 0 ? '/contact' : '/signup'} className={cn('block rounded-xl py-2.5 text-center text-sm font-semibold transition-all', plan.badge ? 'bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-200' : 'border border-gray-200 text-gray-700 hover:bg-gray-50')}>
                {plan.price === 0 ? 'Talk to Sales' : 'Start Free'}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-yellow-200 bg-yellow-50 p-5 max-w-3xl mx-auto">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-800">Platform fee is separate from WhatsApp/Meta messaging charges</p>
              <p className="mt-1 text-xs text-yellow-700">WhatsApp message costs depend on Meta's pricing by category and country. Adyapan Connect charges are only for the platform subscription and usage above plan limits.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
