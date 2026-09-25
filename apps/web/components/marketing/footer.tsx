import Link from 'next/link';
import { COMPANY } from '@/lib/company';
import { Logo } from '@/components/brand/logo';

const links = {
  Product: ['/features', '/whatsapp-api', '/product/campaigns', '/shared-inbox', '/features/crm', '/ai-agent', '/automation', '/pricing'].map((h, i) => ({ href: h, label: ['Features', 'WhatsApp API', 'Campaigns', 'Shared Inbox', 'CRM', 'AI Agent', 'Automation', 'Pricing'][i] })),
  Developers: ['/developers', '/docs', '/api', '/webhooks', '/sdks'].map((h, i) => ({ href: h, label: ['Overview', 'Documentation', 'API Reference', 'Webhooks', 'SDKs'][i] })),
  Company: ['/about', '/customers', '/contact', '/blog'].map((h, i) => ({ href: h, label: ['About', 'Customers', 'Contact', 'Blog'][i] })),
  Legal: ['/terms', '/privacy', '/refund-policy', '/security'].map((h, i) => ({ href: h, label: ['Terms', 'Privacy', 'Refund Policy', 'Security'][i] })),
};

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Logo size={32} textClassName="text-base text-white" className="mb-4" />
            <p className="text-xs leading-relaxed">AI-Powered WhatsApp Business Platform for modern businesses.</p>
            <p className="mt-3 text-xs text-green-500">Connect. Automate. Engage. Grow.</p>
          </div>
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">{group}</h3>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-xs hover:text-green-400 transition-colors">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs">© {new Date().getFullYear()} {COMPANY.legalName}. All rights reserved.</p>

          {/* Quick legal links — always visible */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            <Link href="/privacy" className="hover:text-green-400 transition-colors">Privacy Policy</Link>
            <span className="text-gray-700">·</span>
            <Link href="/terms" className="hover:text-green-400 transition-colors">Terms &amp; Conditions</Link>
            <span className="text-gray-700">·</span>
            <Link href="/refund-policy" className="hover:text-green-400 transition-colors">Refund Policy</Link>
            <span className="text-gray-700">·</span>
            <Link href="/contact" className="hover:text-green-400 transition-colors">Contact</Link>
          </div>

          <p className="text-xs">
            Part of the{' '}
            <a href="https://adyapan.com" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">
              Adyapan
            </a>{' '}
            product family
          </p>
        </div>
      </div>
    </footer>
  );
}
