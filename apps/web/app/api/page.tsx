import { MarketingPage } from '@/components/marketing/marketing-page';
import { Send, Users, FileText, Image, PhoneCall, Key } from 'lucide-react';

export const metadata = { title: 'API Reference | Adyapan Connect' };

export default function ApiPage() {
  return (
    <MarketingPage
      eyebrow="Developers"
      title="Adyapan Connect API Reference"
      subtitle="Send messages, manage contacts and automate WhatsApp with a clean, predictable REST API."
      heroImage="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&q=80"
      highlights={[
        'Token-based authentication',
        'JSON request and response bodies',
        'Versioned, backward-compatible endpoints',
      ]}
      featuresTitle="Core endpoints"
      features={[
        { icon: Key, title: 'Authentication', desc: 'POST /auth — obtain and refresh access tokens.' },
        { icon: Send, title: 'Send Message', desc: 'POST /messages — send text, template or media.' },
        { icon: FileText, title: 'Templates', desc: 'GET /templates — list approved message templates.' },
        { icon: Users, title: 'Contacts', desc: 'CRUD /contacts — manage your audience.' },
        { icon: Image, title: 'Media', desc: 'POST /media — upload images, docs and video.' },
        { icon: PhoneCall, title: 'Conversations', desc: 'GET /conversations — fetch chat history.' },
      ]}
      primaryCta={{ label: 'Get API keys', href: '/signup' }}
      secondaryCta={{ label: 'Read docs', href: '/docs' }}
      ctaTitle="Ready to integrate?"
      ctaSubtitle="Sign up, generate your API key and make your first request."
    />
  );
}
