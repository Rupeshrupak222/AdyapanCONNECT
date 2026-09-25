import { MarketingPage } from '@/components/marketing/marketing-page';
import { Webhook, Bell, CheckCheck, MessageSquare, RefreshCw, ShieldCheck } from 'lucide-react';

export const metadata = { title: 'Webhooks | Adyapan Connect' };

export default function WebhooksPage() {
  return (
    <MarketingPage
      eyebrow="Developers"
      title="Real-time Webhooks"
      subtitle="Get notified instantly about message status, inbound messages and conversation events. React to everything as it happens."
      heroImage="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80"
      highlights={[
        'Signed payloads for secure delivery',
        'Automatic retries with backoff',
        'Filter events per subscription',
      ]}
      featuresTitle="Events you can subscribe to"
      features={[
        { icon: MessageSquare, title: 'message.received', desc: 'Fires when a customer sends you a message.' },
        { icon: CheckCheck, title: 'message.status', desc: 'Sent, delivered, read and failed updates.' },
        { icon: Bell, title: 'conversation.started', desc: 'A new conversation window opens.' },
        { icon: RefreshCw, title: 'template.status', desc: 'Template approval or rejection updates.' },
        { icon: Webhook, title: 'custom.events', desc: 'Automation and workflow triggers.' },
        { icon: ShieldCheck, title: 'Signature verification', desc: 'Verify every payload with your secret.' },
      ]}
      primaryCta={{ label: 'Set up webhooks', href: '/signup' }}
      secondaryCta={{ label: 'Read docs', href: '/docs' }}
      ctaTitle="Build event-driven flows"
      ctaSubtitle="Start free and configure your first webhook in minutes."
    />
  );
}
