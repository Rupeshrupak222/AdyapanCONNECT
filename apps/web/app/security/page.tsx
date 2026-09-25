import { MarketingPage } from '@/components/marketing/marketing-page';
import { Lock, ShieldCheck, KeyRound, Server, FileCheck, Eye } from 'lucide-react';

export const metadata = { title: 'Security | Adyapan Connect' };

export default function SecurityPage() {
  return (
    <MarketingPage
      eyebrow="Security"
      title="Enterprise-grade security by default"
      subtitle="Your data and your customers conversations are protected with encryption, strict access controls, and continuous monitoring."
      heroImage="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=900&q=80"
      highlights={[
        'Encryption in transit and at rest',
        'Role-based access control and audit logs',
        'Continuous monitoring and regular audits',
      ]}
      featuresTitle="How we protect you"
      features={[
        { icon: Lock, title: 'Data encryption', desc: 'TLS in transit and strong encryption at rest.' },
        { icon: KeyRound, title: 'Access control', desc: 'Granular roles and permissions for every team member.' },
        { icon: Eye, title: 'Audit logs', desc: 'Track every sensitive action across your workspace.' },
        { icon: Server, title: 'Reliable infra', desc: 'Redundant, monitored infrastructure with 99.9% uptime.' },
        { icon: FileCheck, title: 'Compliance', desc: 'Aligned with WhatsApp policies and data regulations.' },
        { icon: ShieldCheck, title: 'Secure by design', desc: 'Security reviews built into our development process.' },
      ]}
      ctaTitle="Security you can trust"
      ctaSubtitle="Start free and build on a platform designed to keep your data safe."
    />
  );
}
