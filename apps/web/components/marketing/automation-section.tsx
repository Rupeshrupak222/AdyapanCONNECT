import { Zap, ArrowDown, GitBranch } from 'lucide-react';

export function AutomationSection() {
  return (
    <section className="py-20 lg:py-28 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <span className="text-sm font-semibold text-green-600 uppercase tracking-wider">Automation</span>
          <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
            Automate Any Business Process
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Build Zapier-like workflows — triggered by any event, connected to any action.
          </p>
        </div>
        <div className="mx-auto max-w-lg">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-lg bg-green-600 flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Lead Nurture Workflow</span>
            </div>
            {[
              { label: '🎯 Trigger: New Lead Created', color: 'bg-blue-50 border-blue-200 text-blue-800' },
              { label: '🤖 AI Score Lead', color: 'bg-purple-50 border-purple-200 text-purple-800' },
              { label: '📱 Send WhatsApp Message', color: 'bg-green-50 border-green-200 text-green-800' },
              { label: '⏳ Wait 2 Hours', color: 'bg-gray-50 border-gray-200 text-gray-600' },
            ].map((step, i) => (
              <div key={i}>
                <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${step.color}`}>
                  {step.label}
                </div>
                {i < 3 && <ArrowDown className="h-4 w-4 text-gray-300 mx-auto my-1.5" />}
              </div>
            ))}
            <div className="mt-1.5 flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-gray-300 mx-auto" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-center text-xs font-medium text-green-800">
                ✅ Reply received → Assign to Sales Agent
              </div>
              <div className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5 text-center text-xs font-medium text-orange-800">
                ⏰ No reply → Send Follow-up
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
