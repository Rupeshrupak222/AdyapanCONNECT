import { MessageSquare, Users, BarChart3, Bot, Zap, Code2, Globe, Shield } from 'lucide-react';

const features = [
  { icon: MessageSquare, title: 'WhatsApp API', description: 'Official Meta Cloud API integration with multi-number support, webhooks, and full message type support.', color: 'text-green-600 bg-green-50' },
  { icon: Users, title: 'Shared Team Inbox', description: 'Real-time collaborative inbox with agent assignment, labels, notes, and conversation routing.', color: 'text-blue-600 bg-blue-50' },
  { icon: BarChart3, title: 'Campaign Management', description: 'Build, schedule and broadcast template campaigns to unlimited contacts with delivery analytics.', color: 'text-purple-600 bg-purple-50' },
  { icon: Bot, title: 'AI Agent', description: 'Deploy an AI agent trained on your knowledge base to answer questions and qualify leads 24/7.', color: 'text-orange-600 bg-orange-50' },
  { icon: Zap, title: 'Workflow Automation', description: 'Trigger multi-step automations on any event — message received, lead created, payment done.', color: 'text-yellow-600 bg-yellow-50' },
  { icon: Users, title: 'Built-in CRM', description: 'Full CRM with leads, deals, pipelines, tasks, and AI-powered lead scoring in one place.', color: 'text-pink-600 bg-pink-50' },
  { icon: Code2, title: 'Developer API', description: 'REST API with API keys, webhooks, request logs and full OpenAPI/Swagger documentation.', color: 'text-cyan-600 bg-cyan-50' },
  { icon: Globe, title: 'Contact Segments', description: 'Build dynamic audience segments with complex AND/OR conditions to target the right people.', color: 'text-indigo-600 bg-indigo-50' },
  { icon: Shield, title: 'Enterprise Security', description: 'RBAC, audit logs, 2FA, tenant isolation, encrypted credentials and API key management.', color: 'text-red-600 bg-red-50' },
];

export function Features() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <span className="text-sm font-semibold text-green-600 uppercase tracking-wider">Everything in one platform</span>
          <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
            WhatsApp Business + CRM + AI + Automation
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Stop juggling 5 tools. Adyapan Connect replaces your entire WhatsApp stack.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(f => (
            <div key={f.title} className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md hover:border-green-200 transition-all">
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${f.color} mb-4`}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
