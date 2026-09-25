import Link from 'next/link';
import { Rocket, MessageSquare, CreditCard, Settings, Bot, ShieldCheck, Search } from 'lucide-react';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';

export const metadata = { title: 'Help Center | Adyapan Connect' };

const categories = [
  { icon: Rocket, title: 'Getting Started', desc: 'Set up your account and go live on WhatsApp.' },
  { icon: MessageSquare, title: 'Messaging & Campaigns', desc: 'Send broadcasts, templates and manage the inbox.' },
  { icon: Bot, title: 'Chatbots & Automation', desc: 'Build flows and automate conversations.' },
  { icon: CreditCard, title: 'Billing & Plans', desc: 'Manage your subscription, wallet and invoices.' },
  { icon: Settings, title: 'Account & Settings', desc: 'Teams, roles, numbers and configuration.' },
  { icon: ShieldCheck, title: 'Security & Privacy', desc: 'Data protection, compliance and access control.' },
];

const faqs = [
  { q: 'How do I get the WhatsApp green tick?', a: 'Submit a verification request from your dashboard; our team guides you through Meta approval.' },
  { q: 'Can I use my existing number?', a: 'Yes, as long as it is not already active on a personal or Business app.' },
  { q: 'How are conversations charged?', a: 'Conversations follow WhatsApp pricing, shown transparently in your wallet.' },
  { q: 'Do you offer onboarding support?', a: 'Every plan includes onboarding help to get you live quickly.' },
];

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="bg-gradient-to-b from-green-50 to-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">How can we help?</h1>
          <p className="mt-4 text-lg text-gray-600">Search our help center or browse popular topics.</p>
          <div className="mx-auto mt-6 flex max-w-xl items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm">
            <Search className="h-5 w-5 text-gray-400" />
            <input placeholder="Search for articles..." className="w-full text-sm focus:outline-none" />
          </div>
        </div>
      </section>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map(c => (
              <div key={c.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
                  <c.icon className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{c.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{c.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900">Frequently asked questions</h2>
            <div className="mt-6 space-y-4">
              {faqs.map(f => (
                <div key={f.q} className="rounded-xl border border-gray-100 bg-white p-5">
                  <h3 className="font-semibold text-gray-900">{f.q}</h3>
                  <p className="mt-1.5 text-sm text-gray-600">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-12 text-center text-gray-600">
            Still need help? <Link href="/contact" className="font-semibold text-green-600 hover:text-green-700">Contact support</Link>
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
