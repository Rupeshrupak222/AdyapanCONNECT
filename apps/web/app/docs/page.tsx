import Link from 'next/link';
import { Rocket, Key, MessageSquare, Webhook, Code2, BookOpen, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';

export const metadata = { title: 'Documentation | Adyapan Connect' };

const sections = [
  { icon: Rocket, title: 'Quickstart', desc: 'Create an account, connect a number and send your first message.', href: '/docs' },
  { icon: Key, title: 'Authentication', desc: 'Generate API keys and authenticate your requests.', href: '/api' },
  { icon: MessageSquare, title: 'Sending Messages', desc: 'Send templates, media and interactive messages via the API.', href: '/api' },
  { icon: Webhook, title: 'Webhooks', desc: 'Receive real-time events for message status and inbound chats.', href: '/webhooks' },
  { icon: Code2, title: 'SDKs & Libraries', desc: 'Official SDKs for Node.js, Python, PHP and more.', href: '/sdks' },
  { icon: BookOpen, title: 'Guides', desc: 'Step-by-step tutorials for common integration patterns.', href: '/docs' },
];

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="bg-gradient-to-b from-green-50 to-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-green-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-green-700">Developers</span>
          <h1 className="mt-6 text-4xl font-bold text-gray-900 sm:text-5xl">Documentation</h1>
          <p className="mt-4 text-lg text-gray-600">Everything you need to build on the Adyapan Connect platform.</p>
        </div>
      </section>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map(s => (
            <Link key={s.title} href={s.href} className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
                <s.icon className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="mt-4 flex items-center gap-1 text-lg font-semibold text-gray-900 group-hover:text-green-600">
                {s.title} <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </h3>
              <p className="mt-2 text-sm text-gray-600">{s.desc}</p>
            </Link>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-2xl bg-gray-900 p-6 text-sm text-gray-100">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-green-400">Example: send a message</p>
          <pre className="overflow-x-auto"><code>{`curl -X POST https://api.adyapanconnect.com/v1/messages \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+919999999999",
    "type": "template",
    "template": "welcome_message"
  }'`}</code></pre>
        </div>
      </section>
      <Footer />
    </main>
  );
}
