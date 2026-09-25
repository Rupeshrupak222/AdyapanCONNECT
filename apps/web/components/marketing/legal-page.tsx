import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { COMPANY } from '@/lib/company';

export type LegalSection = { heading: string; body: string };

export type LegalPageProps = {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

export function LegalPage({ title, updated, intro, sections }: LegalPageProps) {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="border-b border-gray-100 bg-gray-50 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: {updated}</p>
        </div>
      </section>
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-gray-600">{intro}</p>
          <div className="mt-8 space-y-8">
            {sections.map((s, i) => (
              <div key={s.heading}>
                <h2 className="text-xl font-semibold text-gray-900">{i + 1}. {s.heading}</h2>
                <p className="mt-2 leading-relaxed text-gray-600">{s.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-12 text-sm text-gray-500">
            {COMPANY.brand} is a product of {COMPANY.legalName}, {COMPANY.registeredAddress}.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
