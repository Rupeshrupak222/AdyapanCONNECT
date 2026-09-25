import { notFound } from 'next/navigation';
import { ShoppingBag, Workflow, Users, Store, Zap, MessageSquare, BarChart3, Webhook } from 'lucide-react';
import { MarketingPage, type MarketingPageProps } from '@/components/marketing/marketing-page';

const INTEGRATIONS: Record<string, MarketingPageProps> = {
  shopify: {
    eyebrow: 'Integration',
    title: 'Adyapan Connect for Shopify',
    subtitle: 'Connect your Shopify store to send order updates, recover carts and drive repeat purchases on WhatsApp — automatically.',
    heroImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=900&q=80',
    highlights: [
      'One-click Shopify connection',
      'Automated order and shipping notifications',
      'Abandoned cart recovery on WhatsApp',
    ],
    featuresTitle: 'Turn Shopify into a WhatsApp store',
    features: [
      { icon: ShoppingBag, title: 'Order sync', desc: 'Auto-send confirmations and updates.' },
      { icon: Zap, title: 'Cart recovery', desc: 'Recover abandoned carts on autopilot.' },
      { icon: Users, title: 'Customer sync', desc: 'Import contacts and segments instantly.' },
      { icon: MessageSquare, title: 'Broadcasts', desc: 'Announce sales to your store audience.' },
      { icon: BarChart3, title: 'Revenue tracking', desc: 'See sales driven by WhatsApp.' },
      { icon: Webhook, title: 'Real-time events', desc: 'Trigger messages on any store event.' },
    ],
  },
  zapier: {
    eyebrow: 'Integration',
    title: 'Adyapan Connect for Zapier',
    subtitle: 'Connect Adyapan Connect to 6,000+ apps with Zapier. Automate WhatsApp messages from any tool, no code required.',
    heroImage: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=900&q=80',
    highlights: [
      'Link 6,000+ apps with no code',
      'Trigger WhatsApp messages from any workflow',
      'Sync leads and data both ways',
    ],
    featuresTitle: 'Automate across your stack',
    features: [
      { icon: Workflow, title: 'No-code Zaps', desc: 'Build automations in minutes.' },
      { icon: Zap, title: 'Any trigger', desc: 'Start flows from forms, CRMs, sheets and more.' },
      { icon: MessageSquare, title: 'Send messages', desc: 'Fire WhatsApp templates automatically.' },
      { icon: Users, title: 'Lead sync', desc: 'Push new leads straight into your CRM.' },
      { icon: Webhook, title: 'Webhooks', desc: 'Advanced control with custom payloads.' },
      { icon: BarChart3, title: 'Reliability', desc: 'Monitored delivery for every Zap.' },
    ],
  },
  hubspot: {
    eyebrow: 'Integration',
    title: 'Adyapan Connect for HubSpot',
    subtitle: 'Sync contacts and conversations with HubSpot CRM. Send WhatsApp messages and log every interaction automatically.',
    heroImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80',
    highlights: [
      'Two-way contact and deal sync',
      'Log WhatsApp chats to HubSpot timeline',
      'Trigger messages from HubSpot workflows',
    ],
    featuresTitle: 'WhatsApp meets your CRM',
    features: [
      { icon: Users, title: 'Contact sync', desc: 'Keep HubSpot and Adyapan in step.' },
      { icon: MessageSquare, title: 'Chat logging', desc: 'Every conversation on the contact timeline.' },
      { icon: Workflow, title: 'Workflow triggers', desc: 'Send WhatsApp from HubSpot automations.' },
      { icon: Zap, title: 'Deal updates', desc: 'Move deals based on WhatsApp activity.' },
      { icon: BarChart3, title: 'Reporting', desc: 'Attribute pipeline to WhatsApp outreach.' },
      { icon: Webhook, title: 'Custom events', desc: 'Fine-grained control via webhooks.' },
    ],
  },
  woocommerce: {
    eyebrow: 'Integration',
    title: 'Adyapan Connect for WooCommerce',
    subtitle: 'Bring WhatsApp automation to your WooCommerce store. Order updates, cart recovery and marketing — built in.',
    heroImage: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=900&q=80',
    highlights: [
      'Simple WooCommerce plugin setup',
      'Automated order and payment notifications',
      'Recover carts and re-engage customers',
    ],
    featuresTitle: 'Supercharge your WooCommerce store',
    features: [
      { icon: Store, title: 'Order automation', desc: 'Send updates for every order status.' },
      { icon: Zap, title: 'Cart recovery', desc: 'Automatically win back abandoned carts.' },
      { icon: Users, title: 'Customer import', desc: 'Sync your store customers with one click.' },
      { icon: MessageSquare, title: 'Campaigns', desc: 'Broadcast offers to WooCommerce buyers.' },
      { icon: BarChart3, title: 'Sales insights', desc: 'Track revenue driven by WhatsApp.' },
      { icon: Webhook, title: 'Event triggers', desc: 'Automate on any WooCommerce hook.' },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(INTEGRATIONS).map(slug => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const it = INTEGRATIONS[params.slug];
  return { title: it ? `${it.title} | Adyapan Connect` : 'Integrations | Adyapan Connect' };
}

export default function IntegrationPage({ params }: { params: { slug: string } }) {
  const data = INTEGRATIONS[params.slug];
  if (!data) notFound();
  return <MarketingPage {...data} />;
}
