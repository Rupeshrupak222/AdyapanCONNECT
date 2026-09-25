import { MarketingPage } from '@/components/marketing/marketing-page';
import { Code2, Terminal, Boxes, Package, GitBranch, BookOpen } from 'lucide-react';

export const metadata = { title: 'SDKs & Libraries | Adyapan Connect' };

export default function SdksPage() {
  return (
    <MarketingPage
      eyebrow="Developers"
      title="SDKs & Libraries"
      subtitle="Official client libraries make it easy to integrate Adyapan Connect into your stack — with typed methods and helpers out of the box."
      heroImage="https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?auto=format&fit=crop&w=900&q=80"
      highlights={[
        'Typed clients for a great developer experience',
        'Built-in retries and error handling',
        'Open source and community friendly',
      ]}
      featuresTitle="Available SDKs"
      features={[
        { icon: Code2, title: 'Node.js', desc: 'npm install @adyapan/connect-sdk' },
        { icon: Terminal, title: 'Python', desc: 'pip install adyapan-connect' },
        { icon: Package, title: 'PHP', desc: 'composer require adyapan/connect' },
        { icon: Boxes, title: 'Ruby', desc: 'gem install adyapan-connect' },
        { icon: GitBranch, title: 'Go', desc: 'go get github.com/adyapan/connect-go' },
        { icon: BookOpen, title: 'REST', desc: 'Use any language with our REST API.' },
      ]}
      primaryCta={{ label: 'Get started', href: '/signup' }}
      secondaryCta={{ label: 'Read docs', href: '/docs' }}
      ctaTitle="Integrate in minutes"
      ctaSubtitle="Pick your language, install the SDK and start sending messages."
    />
  );
}
