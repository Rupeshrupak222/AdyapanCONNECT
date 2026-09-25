import { notFound } from 'next/navigation';
import { ShoppingCart, GraduationCap, HeartPulse, Home, MessageSquare, Bot, Users, BarChart3, Zap, Megaphone } from 'lucide-react';
import { MarketingPage, type MarketingPageProps } from '@/components/marketing/marketing-page';

const INDUSTRIES: Record<string, MarketingPageProps> = {
  ecommerce: {
    eyebrow: 'Industries',
    title: 'WhatsApp for E-commerce',
    subtitle: 'Recover abandoned carts, send order updates and drive repeat sales on the channel your customers already use every day.',
    heroImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=80',
    highlights: [
      'Automated cart recovery and order notifications',
      'Click-to-WhatsApp ads that drive 5x more leads',
      'Sync with Shopify, WooCommerce and more',
    ],
    featuresTitle: 'Sell more on WhatsApp',
    features: [
      { icon: ShoppingCart, title: 'Cart recovery', desc: 'Win back lost sales with timely reminders.' },
      { icon: Megaphone, title: 'Order updates', desc: 'Confirmations, shipping and delivery alerts.' },
      { icon: Bot, title: 'Product discovery', desc: 'AI recommends products right in chat.' },
      { icon: Users, title: 'Loyalty & re-engagement', desc: 'Bring customers back with offers.' },
      { icon: Zap, title: 'Store integrations', desc: 'Plug into your existing e-commerce stack.' },
      { icon: BarChart3, title: 'Revenue tracking', desc: 'Attribute sales to every campaign.' },
    ],
  },
  education: {
    eyebrow: 'Industries',
    title: 'WhatsApp for Education',
    subtitle: 'Boost enrollments, share updates and support students and parents at scale — all through WhatsApp.',
    heroImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80',
    highlights: [
      'Automated admission and enquiry follow-ups',
      'Fee reminders, schedules and announcements',
      'Chatbots to answer common student queries',
    ],
    featuresTitle: 'Engage students & parents',
    features: [
      { icon: GraduationCap, title: 'Admissions', desc: 'Capture and nurture leads to enrollment.' },
      { icon: Megaphone, title: 'Announcements', desc: 'Broadcast schedules, results and events.' },
      { icon: Bot, title: 'Query bots', desc: 'Answer FAQs about courses and fees 24/7.' },
      { icon: MessageSquare, title: 'Reminders', desc: 'Fee due dates, classes and deadlines.' },
      { icon: Users, title: 'Parent updates', desc: 'Keep parents informed automatically.' },
      { icon: BarChart3, title: 'Insights', desc: 'Track enquiry-to-enrollment funnels.' },
    ],
  },
  healthcare: {
    eyebrow: 'Industries',
    title: 'WhatsApp for Healthcare',
    subtitle: 'Book appointments, send reminders and share reports securely — improving patient experience while reducing no-shows.',
    heroImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80',
    highlights: [
      'Appointment booking and reminders',
      'Secure sharing of reports and prescriptions',
      'Automated follow-ups and feedback',
    ],
    featuresTitle: 'Better patient care',
    features: [
      { icon: HeartPulse, title: 'Appointments', desc: 'Let patients book and reschedule in chat.' },
      { icon: MessageSquare, title: 'Reminders', desc: 'Reduce no-shows with timely nudges.' },
      { icon: Bot, title: 'Triage bots', desc: 'Guide patients to the right department.' },
      { icon: Users, title: 'Follow-ups', desc: 'Post-visit care and feedback requests.' },
      { icon: Zap, title: 'Report delivery', desc: 'Share reports and prescriptions securely.' },
      { icon: BarChart3, title: 'Analytics', desc: 'Monitor engagement and satisfaction.' },
    ],
  },
  'real-estate': {
    eyebrow: 'Industries',
    title: 'WhatsApp for Real Estate',
    subtitle: 'Capture and qualify property leads, share listings and schedule site visits — all in one conversation.',
    heroImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80',
    highlights: [
      'Instant lead capture from ads and listings',
      'Share property media and brochures in chat',
      'Automated site-visit scheduling',
    ],
    featuresTitle: 'Close deals faster',
    features: [
      { icon: Home, title: 'Listing sharing', desc: 'Send photos, videos and brochures instantly.' },
      { icon: Users, title: 'Lead qualification', desc: 'AI scores and routes serious buyers.' },
      { icon: MessageSquare, title: 'Site visits', desc: 'Schedule and remind about property tours.' },
      { icon: Bot, title: 'Enquiry bots', desc: 'Answer price and availability questions 24/7.' },
      { icon: Megaphone, title: 'New launches', desc: 'Broadcast projects to interested buyers.' },
      { icon: BarChart3, title: 'Pipeline', desc: 'Track leads from enquiry to booking.' },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(INDUSTRIES).map(slug => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const i = INDUSTRIES[params.slug];
  return { title: i ? `${i.title} | Adyapan Connect` : 'Industries | Adyapan Connect' };
}

export default function IndustryPage({ params }: { params: { slug: string } }) {
  const data = INDUSTRIES[params.slug];
  if (!data) notFound();
  return <MarketingPage {...data} />;
}
