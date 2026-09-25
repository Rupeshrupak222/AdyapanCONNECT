import { MarketingPage } from '@/components/marketing/marketing-page';
import { Target, Users, Globe, Heart, Rocket, ShieldCheck } from 'lucide-react';

export const metadata = { title: 'About | Adyapan Connect' };

export default function AboutPage() {
  return (
    <MarketingPage
      eyebrow="About us"
      title="Building the future of business conversations"
      subtitle="Adyapan Connect helps businesses turn WhatsApp into their most powerful channel for marketing, support and sales — powered by AI."
      heroImage="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80"
      stats={[
        { value: '210,000+', label: 'Businesses' },
        { value: '68+', label: 'Countries' },
        { value: '6000+', label: 'Partners' },
        { value: '1B+', label: 'Messages sent' },
      ]}
      featuresTitle="What we stand for"
      features={[
        { icon: Target, title: 'Customer obsession', desc: 'Every decision starts with our customers success.' },
        { icon: Rocket, title: 'Ship fast', desc: 'We move quickly and improve relentlessly.' },
        { icon: Heart, title: 'Simplicity', desc: 'Powerful software that anyone can use.' },
        { icon: Users, title: 'Team first', desc: 'We win together, as one team.' },
        { icon: Globe, title: 'Global mindset', desc: 'Built for businesses in every market.' },
        { icon: ShieldCheck, title: 'Trust & security', desc: 'We protect customer data like our own.' },
      ]}
      ctaTitle="Want to join us?"
      ctaSubtitle="We are always looking for great people. Start by creating your free account."
    />
  );
}
