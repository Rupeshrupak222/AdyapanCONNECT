'use client';
import { useState } from 'react';
import { Mail, Phone, MessageSquare, MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { useToast } from '@/hooks/use-toast';
import { COMPANY } from '@/lib/company';
import api from '@/lib/api';

const contacts = [
  { icon: Phone, label: 'Phone', value: COMPANY.phone, href: COMPANY.phoneHref },
  { icon: Mail, label: 'Email', value: COMPANY.email, href: COMPANY.emailHref },
  { icon: MessageSquare, label: 'WhatsApp', value: 'Chat with sales', href: COMPANY.whatsappHref },
];

export default function ContactPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const valid = form.firstName && form.email.includes('@') && form.message.trim().length > 3;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSending(true);
    try {
      await api.post('/contact', {
        firstName: form.firstName,
        lastName: form.lastName || undefined,
        email: form.email,
        message: form.message,
        source: 'contact-page',
      });
      setSent(true);
      toast({ title: 'Message sent!', description: 'Our team will get back to you within 24 hours.' });
    } catch (err: any) {
      toast({ title: 'Could not send message', description: err.response?.data?.error?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="bg-gradient-to-b from-green-50 to-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">Get in touch</h1>
          <p className="mt-4 text-lg text-gray-600">Questions about pricing, demos or partnerships? We would love to hear from you.</p>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2">
          {/* Form */}
          {sent ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-7 w-7 text-green-600" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900">Thanks, {form.firstName}!</h2>
              <p className="mt-2 max-w-sm text-sm text-gray-600">
                We&apos;ve received your message and our team will get back to you at{' '}
                <span className="font-medium text-gray-800">{form.email}</span> within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">First name</label>
                  <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Last name</label>
                  <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Work email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Message</label>
                <textarea rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20" />
              </div>
              <button type="submit" disabled={!valid || sending} className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-600 disabled:opacity-60">
                {sending && <Loader2 className="h-4 w-4 animate-spin" />}
                Send message
              </button>
            </form>
          )}

          {/* Contact details */}
          <div className="space-y-5">
            {contacts.map(c => (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="block"
              >
                <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-colors hover:border-green-200">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
                    <c.icon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{c.label}</p>
                    <p className="text-sm font-medium text-gray-800">{c.value}</p>
                  </div>
                </div>
              </a>
            ))}

            {/* Offices */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="mb-4 text-sm font-semibold text-gray-900">{COMPANY.legalName}</p>
              <div className="space-y-4">
                {COMPANY.offices.map(o => (
                  <div key={o.label} className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100">
                      <MapPin className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-green-600">{o.label}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-gray-600">
                        {o.lines.map((l, i) => (
                          <span key={i} className="block">{l}</span>
                        ))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
