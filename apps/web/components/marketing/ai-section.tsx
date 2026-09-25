import { Brain, ArrowDown } from 'lucide-react';

const steps = [
  { label: 'Customer sends message', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { label: 'AI Agent receives it', color: 'bg-green-100 text-green-700 border-green-200' },
  { label: 'Understands intent & context', color: 'bg-green-100 text-green-700 border-green-200' },
  { label: 'Answers from Knowledge Base', color: 'bg-green-100 text-green-700 border-green-200' },
  { label: 'Qualifies & scores the lead', color: 'bg-green-100 text-green-700 border-green-200' },
  { label: 'Updates CRM automatically', color: 'bg-green-100 text-green-700 border-green-200' },
  { label: 'Escalates to human if needed', color: 'bg-orange-100 text-orange-700 border-orange-200' },
];

export function AiSection() {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-green-900 via-green-800 to-green-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 items-center">
          {/* Text */}
          <div>
            <span className="text-sm font-semibold text-green-300 uppercase tracking-wider">AI-Powered</span>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              Your AI Employee on WhatsApp
            </h2>
            <p className="mt-4 text-lg text-green-200">
              Train an AI agent on your product docs, FAQs and knowledge base. It handles customer queries, qualifies leads, books appointments and updates your CRM — automatically.
            </p>
            <ul className="mt-8 space-y-3">
              {['Answers questions 24/7 from your knowledge base', 'Qualifies leads with custom scoring criteria', 'Books appointments via calendar integration', 'Updates CRM fields from conversation context', 'Hands off to human agent when needed'].map(item => (
                <li key={item} className="flex items-center gap-3 text-sm text-green-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Flow diagram */}
          <div className="flex flex-col items-center gap-0">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center w-full max-w-xs">
                <div className={`w-full rounded-xl border px-4 py-2.5 text-center text-sm font-medium ${step.color}`}>
                  {step.label}
                </div>
                {i < steps.length - 1 && (
                  <ArrowDown className="h-4 w-4 text-green-400 my-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
