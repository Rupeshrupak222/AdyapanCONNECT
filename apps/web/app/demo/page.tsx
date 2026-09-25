'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Loader2, CalendarCheck, Users, Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { useToast } from '@/hooks/use-toast';

const benefits = [
  { icon: Zap, title: 'See it live in 30 mins', desc: 'A product expert walks you through WhatsApp campaigns, chatbots and the team inbox.' },
  { icon: Users, title: 'Tailored to your business', desc: 'We map Adyapan Connect to your exact use case and industry.' },
  { icon: ShieldCheck, title: 'No commitment', desc: 'Ask anything. No credit card, no obligation to buy.' },
];

const teamSizes = ['1–10', '11–50', '51–200', '201–1000', '1000+'];

export default function DemoPage() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '', teamSize: '11–50' });

  const valid = form.name && form.email.includes('@') && form.company && form.phone.length >= 6;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setDone(true);
      toast({ title: 'Demo requested!', description: 'Our team will reach out within 24 hours.' });
    }, 700);
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
        {/* Left — pitch */}
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
            <CalendarCheck className="h-3.5 w-3.5" /> Book a personalized demo
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
            See Adyapan Connect <span className="text-green-600">in action</span>
          </h1>
          <p className="mt-3 max-w-md text-base text-gray-600">
            Get a guided tour with a product expert and discover how businesses grow 5X on WhatsApp.
          </p>

          <div className="mt-8 space-y-5">
            {benefits.map(b => (
              <div key={b.title} className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
                  <b.icon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{b.title}</p>
                  <p className="text-sm text-gray-600">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-sm text-gray-600">
              Prefer to explore on your own?{' '}
              <Link href="/signup" className="font-semibold text-green-600 hover:text-green-700">Start for free</Link>{' '}
              — no demo needed.
            </p>
          </div>
        </div>

        {/* Right — form / success */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          {done ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-7 w-7 text-green-600" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900">You&apos;re all set, {form.name.split(' ')[0]}!</h2>
              <p className="mt-2 max-w-sm text-sm text-gray-600">
                Thanks for booking a demo. Our team will reach out to <span className="font-medium text-gray-800">{form.email}</span> within 24 hours to schedule your session.
              </p>
              <Link href="/signup" className="mt-6 flex items-center gap-1.5 rounded-lg bg-green-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-600">
                Or start free now <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900">Request your demo</h2>
              <p className="mt-1 text-sm text-gray-500">Fill this in and we&apos;ll be in touch within 24 hours.</p>

              <form onSubmit={submit} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Full name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name"
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Work email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@company.com"
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Company</label>
                  <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Company name"
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Phone number</label>
                  <div className="flex">
                    <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-600">🇮🇳 +91</span>
                    <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value.replace(/[^0-9]/g, '') })} placeholder="Phone number"
                      className="w-full rounded-r-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Team size</label>
                  <select value={form.teamSize} onChange={e => setForm({ ...form, teamSize: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-700 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20">
                    {teamSizes.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>

                <button type="submit" disabled={!valid || submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-60">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Book my demo
                </button>
                <p className="text-center text-[11px] text-gray-400">By submitting, you agree to our Terms &amp; Privacy Policy.</p>
              </form>
            </>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
