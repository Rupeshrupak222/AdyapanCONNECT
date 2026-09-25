import { MarketingPage } from '@/components/marketing/marketing-page';

export const metadata = { title: 'Customers | Adyapan Connect' };

export default function CustomersPage() {
  return (
    <MarketingPage
      eyebrow="Customers"
      title="Loved by businesses worldwide"
      subtitle="See how 210,000+ businesses across 68+ countries use Adyapan Connect to drive revenue and delight customers on WhatsApp."
      heroImage="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=900&q=80"
      stats={[
        { value: '210,000+', label: 'Businesses' },
        { value: '68+', label: 'Countries' },
        { value: '5x', label: 'More leads' },
        { value: '40%', label: 'Revenue lift' },
      ]}
      sections={[
        {
          title: 'Heritage Foods — 5x reach on WhatsApp',
          body: 'Our entire subscription model now works on WhatsApp powered by Adyapan Connect. We get 5X more reach and 2X higher order confirmation rates.',
          image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
        },
        {
          title: 'BrightLearn Academy — 3x more enrollments',
          body: 'Automated admission follow-ups on WhatsApp helped us triple our enrollment conversion while cutting manual work for our counselors.',
          image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
        },
        {
          title: 'UrbanNest Realty — faster deal closures',
          body: 'Instant lead capture and AI qualification means our agents only talk to serious buyers. We close deals noticeably faster now.',
          image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
        },
      ]}
      ctaTitle="Join thousands of growing businesses"
      ctaSubtitle="Start your free trial and see the results for yourself."
    />
  );
}
