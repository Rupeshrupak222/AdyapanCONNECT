import Link from 'next/link';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';

export const metadata = { title: 'Blog | Adyapan Connect' };

const posts = [
  { title: '10 WhatsApp marketing strategies that actually convert', category: 'Marketing', date: 'Sep 2, 2026', image: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?auto=format&fit=crop&w=800&q=80', excerpt: 'Practical, proven tactics to turn WhatsApp into your highest-converting channel.' },
  { title: 'How AI agents are transforming customer support', category: 'AI', date: 'Aug 28, 2026', image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80', excerpt: 'From instant replies to human-like conversations, here is what AI changes.' },
  { title: 'A complete guide to WhatsApp broadcast campaigns', category: 'Guides', date: 'Aug 20, 2026', image: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?auto=format&fit=crop&w=800&q=80', excerpt: 'Everything you need to run compliant, high-performing broadcasts.' },
  { title: 'Recovering abandoned carts with WhatsApp automation', category: 'E-commerce', date: 'Aug 12, 2026', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80', excerpt: 'Set up automated flows that win back lost sales on autopilot.' },
  { title: 'Building your first no-code WhatsApp chatbot', category: 'Product', date: 'Aug 5, 2026', image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=800&q=80', excerpt: 'A step-by-step walkthrough of our drag-and-drop flow builder.' },
  { title: 'WhatsApp for education: boosting enrollments', category: 'Industries', date: 'Jul 29, 2026', image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80', excerpt: 'How institutes use WhatsApp to nurture leads into enrollments.' },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="bg-gradient-to-b from-green-50 to-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-block rounded-full bg-green-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-green-700">Blog</span>
          <h1 className="mt-6 text-4xl font-bold text-gray-900 sm:text-5xl">Insights on WhatsApp growth</h1>
          <p className="mt-4 text-lg text-gray-600">Tips, guides and stories to help you grow with WhatsApp.</p>
        </div>
      </section>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map(p => (
            <article key={p.title} className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={p.title} className="h-44 w-full object-cover" />
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="font-semibold text-green-600">{p.category}</span>
                  <span>•</span>
                  <span>{p.date}</span>
                </div>
                <h2 className="mt-2 text-lg font-semibold text-gray-900 group-hover:text-green-600">{p.title}</h2>
                <p className="mt-2 text-sm text-gray-600">{p.excerpt}</p>
                <Link href="/blog" className="mt-3 inline-block text-sm font-medium text-green-600 hover:text-green-700">Read more →</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
