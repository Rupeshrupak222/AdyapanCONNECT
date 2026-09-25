import { notFound } from 'next/navigation';
import { Webhook, Workflow, Users, BarChart3, Zap, MessageSquare, Bot, ShieldCheck } from 'lucide-react';
import { MarketingPage, type MarketingPageProps } from '@/components/marketing/marketing-page';

const FEATURES: Record<string, MarketingPageProps> = {
  'whatsapp-api': {
    eyebrow: 'Feature',
    title: 'Official WhatsApp Business API',
    subtitle: 'Get verified green-tick access to the Official WhatsApp Business API with fast onboarding, high message limits and rock-solid delivery.',
    heroImage: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?auto=format&fit=crop&w=900&q=80',
    highlights: [
      'Green-tick verified business account',
      'High-volume messaging with tier upgrades',
      '99.9% uptime and secure infrastructure',
    ],
    featuresTitle: 'Enterprise-grade messaging',
    features: [
      { icon: Zap, title: 'Fast onboarding', desc: 'Go live on the Official API within days.' },
      { icon: ShieldCheck, title: 'Verified profile', desc: 'Build trust with the WhatsApp green tick.' },
      { icon: MessageSquare, title: 'Rich messaging', desc: 'Media, buttons, lists and interactive templates.' },
      { icon: BarChart3, title: 'Delivery insights', desc: 'Track every message end to end.' },
      { icon: Webhook, title: 'Webhooks', desc: 'Real-time events for every message status.' },
      { icon: Users, title: 'Multi-number', desc: 'Manage multiple numbers from one place.' },
    ],
  },
  automation: {
    eyebrow: 'Feature',
    title: 'Marketing & Workflow Automation',
    subtitle: 'Automate notifications, drip sequences and event-based messages. Connect your store, CRM or apps and let messages flow on autopilot.',
    heroImage: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=900&q=80',
    highlights: [
      'Trigger messages on any event',
      'Drip campaigns and follow-up sequences',
      'No-code automation builder',
    ],
    featuresTitle: 'Automate everything',
    features: [
      { icon: Workflow, title: 'Visual workflows', desc: 'Build automations with drag-and-drop.' },
      { icon: Zap, title: 'Event triggers', desc: 'Fire messages on orders, payments and more.' },
      { icon: MessageSquare, title: 'Drip sequences', desc: 'Nurture leads with timed message series.' },
      { icon: Bot, title: 'Auto-replies', desc: 'Instant responses to common queries.' },
      { icon: Webhook, title: 'Integrations', desc: 'Connect 1000+ apps via Zapier and APIs.' },
      { icon: BarChart3, title: 'Performance', desc: 'Measure and optimize every automation.' },
    ],
  },
  crm: {
    eyebrow: 'Feature',
    title: 'Built-in WhatsApp CRM',
    subtitle: 'Manage contacts, deals and customer history in one place. Every conversation, note and tag synced automatically.',
    heroImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80',
    highlights: [
      'Unified contact profiles and history',
      'Custom fields, tags and lead stages',
      'Pipeline view for deals and follow-ups',
    ],
    featuresTitle: 'Know your customers',
    features: [
      { icon: Users, title: 'Contact management', desc: 'Rich profiles with full conversation history.' },
      { icon: BarChart3, title: 'Sales pipeline', desc: 'Track deals across customizable stages.' },
      { icon: MessageSquare, title: 'Notes & tags', desc: 'Organize customers your way.' },
      { icon: Zap, title: 'Auto-sync', desc: 'Contacts update from every interaction.' },
      { icon: Workflow, title: 'Segments', desc: 'Group customers for targeted outreach.' },
      { icon: ShieldCheck, title: 'Data security', desc: 'Your customer data stays private and safe.' },
    ],
  },
  analytics: {
    eyebrow: 'Feature',
    title: 'Analytics & Reporting',
    subtitle: 'Understand what drives results. Track campaign performance, agent productivity and revenue attribution in real time.',
    heroImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
    highlights: [
      'Real-time dashboards and reports',
      'Campaign, agent and revenue metrics',
      'Exportable data for deeper analysis',
    ],
    featuresTitle: 'Data you can act on',
    features: [
      { icon: BarChart3, title: 'Live dashboards', desc: 'See key metrics update in real time.' },
      { icon: MessageSquare, title: 'Message reports', desc: 'Sent, delivered, read and reply rates.' },
      { icon: Users, title: 'Agent metrics', desc: 'Response times and resolution rates.' },
      { icon: Zap, title: 'Revenue tracking', desc: 'Attribute sales to campaigns and chats.' },
      { icon: Workflow, title: 'Funnels', desc: 'Visualize drop-off across your flows.' },
      { icon: ShieldCheck, title: 'Exports', desc: 'Download reports as CSV any time.' },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(FEATURES).map(slug => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const f = FEATURES[params.slug];
  return { title: f ? `${f.title} | Adyapan Connect` : 'Features | Adyapan Connect' };
}

export default function FeatureDetailPage({ params }: { params: { slug: string } }) {
  const data = FEATURES[params.slug];
  if (!data) notFound();
  return <MarketingPage {...data} />;
}
