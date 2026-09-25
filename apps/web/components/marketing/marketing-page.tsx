import Link from 'next/link';
import { ArrowRight, CheckCircle2, type LucideIcon } from 'lucide-react';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';

export type MarketingFeature = {
  icon?: LucideIcon;
  title: string;
  desc: string;
};

export type MarketingPageProps = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  heroImage?: string;
  /** short bullet points shown next to the hero */
  highlights?: string[];
  /** feature cards grid */
  features?: MarketingFeature[];
  featuresTitle?: string;
  /** alternating image + text rows */
  sections?: { title: string; body: string; image: string }[];
  /** small stat row */
  stats?: { value: string; label: string }[];
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  ctaTitle?: string;
  ctaSubtitle?: string;
};

export function MarketingPage({
  eyebrow,
  title,
  subtitle,
  heroImage,
  highlights,
  features,
  featuresTitle = 'Everything you need',
  sections,
  stats,
  primaryCta = { label: 'Start for FREE', href: '/signup' },
  secondaryCta = { label: 'View Pricing', href: '/pricing' },
  ctaTitle = 'Ready to get started?',
  ctaSubtitle = 'Join thousands of businesses growing with Adyapan Connect.',
}: MarketingPageProps) {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-b from-green-50 to-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            {eyebrow && (
              <span className="inline-block rounded-full bg-green-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-green-700">
                {eyebrow}
              </span>
            )}
            <h1 className="mt-6 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">{title}</h1>
            <p className="mt-5 max-w-xl text-lg text-gray-600 lg:mx-0">{subtitle}</p>

            {highlights && highlights.length > 0 && (
              <ul className="mt-6 space-y-2.5 text-left">
                {highlights.map(h => (
                  <li key={h} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-gray-600">{h}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Link href={primaryCta.href} className="flex items-center gap-2 rounded-lg bg-green-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-600">
                {primaryCta.label} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={secondaryCta.href} className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
                {secondaryCta.label}
              </Link>
            </div>
          </div>

          {heroImage && (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={heroImage} alt={title} className="w-full rounded-3xl object-cover shadow-xl" />
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      {stats && stats.length > 0 && (
        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-green-600">{s.value}</p>
                <p className="mt-1 text-sm text-gray-600">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Feature cards */}
      {features && features.length > 0 && (
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-bold text-gray-900">{featuresTitle}</h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(f => (
                <div key={f.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                  {f.icon && (
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
                      <f.icon className="h-5 w-5 text-green-600" />
                    </div>
                  )}
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Alternating sections */}
      {sections && sections.length > 0 && (
        <section className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-14">
            {sections.map((s, i) => (
              <div key={s.title} className="grid items-center gap-8 md:grid-cols-2">
                <div className={i % 2 === 1 ? 'md:order-2' : ''}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.image} alt={s.title} className="h-64 w-full rounded-2xl object-cover shadow-md" />
                </div>
                <div className={i % 2 === 1 ? 'md:order-1' : ''}>
                  <h3 className="text-2xl font-semibold text-gray-900">{s.title}</h3>
                  <p className="mt-3 leading-relaxed text-gray-600">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-14 text-center shadow-lg">
          <h2 className="text-3xl font-bold text-white">{ctaTitle}</h2>
          <p className="mx-auto mt-4 max-w-xl text-green-50">{ctaSubtitle}</p>
          <Link href={primaryCta.href} className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-sm font-semibold text-green-700 shadow-sm transition-transform hover:scale-[1.02]">
            {primaryCta.label} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
