import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';

export const metadata = { title: 'Pricing | Adyapan Connect' };

const plans = [
  {
    name: 'Starter',
    price: '₹0',
    period: '/month',
    tagline: 'For individuals getting started',
    features: ['1 WhatsApp number', 'Up to 2 agents', '1,000 conversations/mo', 'Basic broadcast & inbox', 'Community support'],
    cta: 'Start for FREE',
    highlighted: false,
  },
  {
    name: 'Growth',
    price: '₹2,499',
    period: '/month',
    tagline: 'For growing teams and SMBs',
    features: ['1 WhatsApp number', 'Up to 10 agents', 'Unlimited broadcasts', 'Chatbot builder', 'CRM & automation', 'Priority support'],
    cta: 'Start free trial',
    highlighted: true,
  },
  {
    name: 'Pro',
    price: '₹5,999',
    period: '/month',
    tagline: 'For scaling businesses',
    features: ['Multiple numbers', 'Unlimited agents', 'AI Copilot & Agents', 'Advanced analytics', 'API & webhooks', 'Dedicated manager'],
    cta: 'Start free trial',
    highlighted: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    tagline: 'For large organizations',
    features: ['Volume pricing', 'White-label option', 'SSO & audit logs', 'Custom integrations', 'SLA & premium support', 'Onboarding & training'],
    cta: 'Contact sales',
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="bg-gradient-to-b from-green-50 to-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-green-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-green-700">Pricing</span>
          <h1 className="mt-6 text-4xl font-bold text-gray-900 sm:text-5xl">Simple, transparent pricing</h1>
          <p className="mt-4 text-lg text-gray-600">Start free. Upgrade as you grow. No hidden fees. Plus WhatsApp conversation charges at cost.</p>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-4">
          {plans.map(plan => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-2xl border bg-white p-6 shadow-sm ${plan.highlighted ? 'border-green-500 ring-2 ring-green-500/20' : 'border-gray-100'}`}
            >
              {plan.highlighted && (
                <span className="mb-3 self-start rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Most popular</span>
              )}
              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{plan.tagline}</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                <span className="mb-1 text-sm text-gray-500">{plan.period}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.name === 'Enterprise' ? '/contact' : '/signup'}
                className={`mt-6 flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                  plan.highlighted ? 'bg-green-500 text-white hover:bg-green-600' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {plan.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-gray-500">
          All plans include the Official WhatsApp Business API. WhatsApp charges per-conversation fees which are passed through at cost via your wallet.
        </p>
      </section>
      <Footer />
    </main>
  );
}
