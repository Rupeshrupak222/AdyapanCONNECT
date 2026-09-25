import { notFound } from 'next/navigation';
import { Inbox, Megaphone, Bot, Sparkles, Users, Zap, BarChart3, MessageSquare } from 'lucide-react';
import { MarketingPage, type MarketingPageProps } from '@/components/marketing/marketing-page';

const PRODUCTS: Record<string, MarketingPageProps> = {
  inbox: {
    eyebrow: 'Product',
    title: 'Shared Team Inbox for WhatsApp',
    subtitle: 'Manage every customer conversation from one collaborative inbox. Assign chats, add notes, and reply faster with your whole team.',
    heroImage: 'https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&w=900&q=80',
    highlights: [
      'Unlimited agents on a single WhatsApp number',
      'Assign, tag and route conversations automatically',
      'Private notes and @mentions for teammates',
    ],
    featuresTitle: 'Built for support teams',
    features: [
      { icon: Users, title: 'Multi-agent access', desc: 'Let your whole team handle chats without sharing a phone.' },
      { icon: MessageSquare, title: 'Quick replies', desc: 'Save canned responses and send them in one click.' },
      { icon: Inbox, title: 'Smart routing', desc: 'Auto-assign chats to the right agent or team.' },
      { icon: BarChart3, title: 'Inbox analytics', desc: 'Track response times, resolution rates and CSAT.' },
      { icon: Bot, title: 'Chatbot handoff', desc: 'Bots handle FAQs, humans take over when needed.' },
      { icon: Zap, title: 'Fast & reliable', desc: 'Real-time sync across web, desktop and mobile.' },
    ],
  },
  campaigns: {
    eyebrow: 'Product',
    title: 'Broadcast & Campaigns on WhatsApp',
    subtitle: 'Send offers, updates and reminders to thousands of opted-in customers without getting blocked. Track delivery, opens and clicks.',
    heroImage: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?auto=format&fit=crop&w=900&q=80',
    highlights: [
      'Import contacts and broadcast in minutes',
      'Personalize with names, variables and media',
      'Real-time delivery and read reports',
    ],
    featuresTitle: 'Campaigns that convert',
    features: [
      { icon: Megaphone, title: 'Bulk broadcasts', desc: 'Reach your entire audience with one message.' },
      { icon: Sparkles, title: 'Personalization', desc: 'Dynamic variables for a 1:1 feel at scale.' },
      { icon: BarChart3, title: 'Delivery insights', desc: 'See sent, delivered, read and replied counts.' },
      { icon: Users, title: 'Audience segments', desc: 'Target the right people with smart filters.' },
      { icon: MessageSquare, title: 'Template manager', desc: 'Create and get templates approved easily.' },
      { icon: Zap, title: 'Scheduling', desc: 'Plan campaigns for the perfect send time.' },
    ],
  },
  chatbot: {
    eyebrow: 'Product',
    title: 'No-Code WhatsApp Chatbot Builder',
    subtitle: 'Build powerful WhatsApp chatbots with a drag-and-drop flow builder. Automate FAQs, capture leads and qualify customers 24/7.',
    heroImage: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=900&q=80',
    highlights: [
      'Drag-and-drop flow builder, zero coding',
      'Capture leads and book appointments automatically',
      'Seamless handoff to live agents',
    ],
    featuresTitle: 'Automate at scale',
    features: [
      { icon: Bot, title: 'Visual flow builder', desc: 'Design conversations with a simple canvas.' },
      { icon: MessageSquare, title: 'Interactive messages', desc: 'Buttons, lists, forms and quick replies.' },
      { icon: Sparkles, title: 'Conditional logic', desc: 'Branch flows based on user responses.' },
      { icon: Users, title: 'Lead capture', desc: 'Collect and sync details to your CRM.' },
      { icon: Zap, title: '24/7 availability', desc: 'Respond instantly, any time of day.' },
      { icon: BarChart3, title: 'Bot analytics', desc: 'Measure engagement and drop-off points.' },
    ],
  },
  ai: {
    eyebrow: 'Product',
    title: 'AI Copilot & Agents for WhatsApp',
    subtitle: 'Deploy smart AI agents that capture leads, recommend products, manage orders and offer human-like support on WhatsApp.',
    heroImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=80',
    highlights: [
      'Human-like conversations powered by AI',
      'AI Copilot suggests replies to your agents',
      'Trained on your business knowledge base',
    ],
    featuresTitle: 'Work smarter with AI',
    features: [
      { icon: Sparkles, title: 'AI Copilot', desc: 'Suggested replies and summaries for agents.' },
      { icon: Bot, title: 'Autonomous agents', desc: 'Handle full conversations end to end.' },
      { icon: MessageSquare, title: 'Smart replies', desc: 'Context-aware responses in your brand tone.' },
      { icon: Users, title: 'Lead qualification', desc: 'AI scores and routes hot leads instantly.' },
      { icon: BarChart3, title: 'Insights', desc: 'Understand intent and sentiment at scale.' },
      { icon: Zap, title: 'Knowledge base', desc: 'Answers grounded in your own content.' },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(PRODUCTS).map(slug => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const p = PRODUCTS[params.slug];
  return { title: p ? `${p.title} | Adyapan Connect` : 'Product | Adyapan Connect' };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const data = PRODUCTS[params.slug];
  if (!data) notFound();
  return <MarketingPage {...data} />;
}
