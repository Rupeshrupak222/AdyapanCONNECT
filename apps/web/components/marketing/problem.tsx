import { X, CheckCircle2 } from 'lucide-react';

const problems = [
  'Too many disconnected tools — CRM, inbox, campaigns all separate',
  'Manual follow-ups — agents waste hours on repetitive messages',
  'Lost WhatsApp conversations — no shared inbox, no context',
  'Zero campaign visibility — no delivery or click analytics',
  'Poor lead management — leads fall through the cracks',
];

const solutions = [
  'One platform for all customer conversations',
  'AI handles routine queries 24/7 automatically',
  'Shared team inbox with full conversation history',
  'Real-time campaign analytics and delivery tracking',
  'Built-in CRM with pipeline, scoring and follow-ups',
];

export function Problem() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Sound familiar?</h2>
          <p className="mt-4 text-lg text-gray-600">Most businesses struggle with the same WhatsApp challenges.</p>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Problems */}
          <div className="rounded-2xl border border-red-100 bg-red-50 p-8">
            <h3 className="text-lg font-semibold text-red-800 mb-6">❌ Without Adyapan Connect</h3>
            <ul className="space-y-4">
              {problems.map(p => (
                <li key={p} className="flex items-start gap-3">
                  <X className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                  <span className="text-sm text-red-700">{p}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Solutions */}
          <div className="rounded-2xl border border-green-200 bg-green-50 p-8">
            <h3 className="text-lg font-semibold text-green-800 mb-6">✅ With Adyapan Connect</h3>
            <ul className="space-y-4">
              {solutions.map(s => (
                <li key={s} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                  <span className="text-sm text-green-800">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
