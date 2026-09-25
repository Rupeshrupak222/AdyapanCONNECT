import { MarketingPage } from '@/components/marketing/marketing-page';
import { Code2, Webhook, Key, BookOpen, Terminal, Boxes } from 'lucide-react';

export const metadata = { title: 'Developers | Adyapan Connect' };

export default function DevelopersPage() {
  return (
    <MarketingPage
      eyebrow="Developers"
      title="Build on the Adyapan Connect platform"
      subtitle="A powerful REST API, webhooks and SDKs to embed WhatsApp messaging into your own products and workflows."
      heroImage="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=900&q=80"
      highlights={[
        'Simple, well-documented REST API',
        'Real-time webhooks for every event',
        'Official SDKs for popular languages',
      ]}
      featuresTitle="Everything a developer needs"
      features={[
        { icon: BookOpen, title: 'Documentation', desc: 'Clear guides and references to get started fast.' },
        { icon: Key, title: 'API Reference', desc: 'Authenticated endpoints for messages and contacts.' },
        { icon: Webhook, title: 'Webhooks', desc: 'Subscribe to message and conversation events.' },
        { icon: Code2, title: 'SDKs', desc: 'Node.js, Python, PHP and more.' },
        { icon: Terminal, title: 'Sandbox', desc: 'Test integrations safely before going live.' },
        { icon: Boxes, title: 'Rate limits', desc: 'Generous, transparent limits that scale with you.' },
      ]}
      primaryCta={{ label: 'Read the docs', href: '/docs' }}
      secondaryCta={{ label: 'API reference', href: '/api' }}
      ctaTitle="Start building today"
      ctaSubtitle="Create a free account and grab your API keys in minutes."
    />
  );
}
