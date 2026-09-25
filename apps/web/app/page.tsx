import { Navbar } from '@/components/marketing/navbar';
import { Hero } from '@/components/marketing/hero';
import { LogoStrip } from '@/components/marketing/logo-strip';
import { Problem } from '@/components/marketing/problem';
import { Features } from '@/components/marketing/features';
import { AiSection } from '@/components/marketing/ai-section';
import { AutomationSection } from '@/components/marketing/automation-section';
import { Pricing } from '@/components/marketing/pricing';
import { Integrations } from '@/components/marketing/integrations';
import { Security } from '@/components/marketing/security';
import { Faq } from '@/components/marketing/faq';
import { Footer } from '@/components/marketing/footer';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <LogoStrip />
      <Problem />
      <Features />
      <AiSection />
      <AutomationSection />
      <Pricing />
      <Integrations />
      <Security />
      <Faq />
      <Footer />
    </main>
  );
}
