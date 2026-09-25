import { Webhook, Workflow, Users, BarChart3, Zap, MessageSquare, Bot, ShieldCheck, Megaphone, Inbox, Sparkles } from 'lucide-react';
import { MarketingPage } from '@/components/marketing/marketing-page';

export const metadata = { title: 'Features | Adyapan Connect' };

export default function FeaturesPage() {
  return (
    <MarketingPage
      eyebrow="Features"
      title="Everything you need to grow on WhatsApp"
      subtitle="From the Official WhatsApp API to AI agents, automation and CRM — Adyapan Connect brings your entire WhatsApp business into one platform."
      heroImage="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80"
      featuresTitle="One platform, every capability"
      features={[
        { icon: MessageSquare, title: 'WhatsApp Business API', desc: 'Official, verified access with high message limits.' },
        { icon: Megaphone, title: 'Broadcast & Campaigns', desc: 'Send bulk offers and track delivery in real time.' },
        { icon: Inbox, title: 'Shared Team Inbox', desc: 'Collaborate on chats with unlimited agents.' },
        { icon: Bot, title: 'Chatbot Builder', desc: 'No-code drag-and-drop automation flows.' },
        { icon: Sparkles, title: 'AI Copilot & Agents', desc: 'Human-like AI support and reply suggestions.' },
        { icon: Users, title: 'Built-in CRM', desc: 'Contacts, pipelines and full history in one place.' },
        { icon: Workflow, title: 'Automation', desc: 'Event-based notifications and drip sequences.' },
        { icon: BarChart3, title: 'Analytics', desc: 'Dashboards for campaigns, agents and revenue.' },
        { icon: Webhook, title: 'Integrations & APIs', desc: 'Connect your store, CRM and 1000+ apps.' },
        { icon: ShieldCheck, title: 'Enterprise security', desc: 'Encryption, roles and audit logs by default.' },
        { icon: Zap, title: 'WhatsApp Payments', desc: 'Let customers pay right inside the chat.' },
        { icon: MessageSquare, title: 'Forms & Webviews', desc: 'Capture leads and load pages inside WhatsApp.' },
      ]}
      ctaTitle="See it all in action"
      ctaSubtitle="Start your free trial and explore every feature today."
    />
  );
}
