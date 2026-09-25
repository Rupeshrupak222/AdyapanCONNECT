'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ChevronDown, Globe, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/brand/logo';

type NavItem = { label: string; href?: string; children?: { label: string; href: string }[] };

const NAV: NavItem[] = [
  { label: 'Pricing', href: '/pricing' },
  {
    label: 'Product',
    children: [
      { label: 'Team Inbox', href: '/product/inbox' },
      { label: 'Broadcast & Campaigns', href: '/product/campaigns' },
      { label: 'Chatbot Builder', href: '/product/chatbot' },
      { label: 'AI Copilot', href: '/product/ai' },
    ],
  },
  {
    label: 'Features',
    children: [
      { label: 'WhatsApp API', href: '/features/whatsapp-api' },
      { label: 'Automation', href: '/features/automation' },
      { label: 'CRM', href: '/features/crm' },
      { label: 'Analytics', href: '/features/analytics' },
    ],
  },
  {
    label: 'Industries',
    children: [
      { label: 'E-commerce', href: '/industries/ecommerce' },
      { label: 'Education', href: '/industries/education' },
      { label: 'Healthcare', href: '/industries/healthcare' },
      { label: 'Real Estate', href: '/industries/real-estate' },
    ],
  },
  {
    label: 'Resources',
    children: [
      { label: 'Blog', href: '/blog' },
      { label: 'Help Center', href: '/help' },
      { label: 'API Docs', href: '/docs' },
      { label: 'Case Studies', href: '/customers' },
    ],
  },
  {
    label: 'Integrations',
    children: [
      { label: 'Shopify', href: '/integrations/shopify' },
      { label: 'Zapier', href: '/integrations/zapier' },
      { label: 'HubSpot', href: '/integrations/hubspot' },
      { label: 'WooCommerce', href: '/integrations/woocommerce' },
    ],
  },
  { label: 'Partner', href: '/partner' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Logo size={36} textClassName="text-xl text-gray-900" />

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 lg:flex">
            {NAV.map(item =>
              item.children ? (
                <div key={item.label} className="group relative">
                  <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-green-600">
                    {item.label}
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400 transition-transform group-hover:rotate-180" />
                  </button>
                  {/* Dropdown */}
                  <div className="invisible absolute left-0 top-full z-50 min-w-[220px] translate-y-1 rounded-xl border border-gray-100 bg-white p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    {item.children.map(c => (
                      <Link key={c.href} href={c.href} className="block rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-green-50 hover:text-green-700">
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link key={item.label} href={item.href!} className="px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-green-600">
                  {item.label}
                </Link>
              )
            )}
          </div>

          {/* Right side: language + CTAs */}
          <div className="hidden items-center gap-3 lg:flex">
            <button className="flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-green-600">
              <Globe className="h-4 w-4" />
              Eng
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </button>
            <Link href="/signup" className="flex items-center gap-1.5 rounded-md bg-green-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-600">
              Start for FREE
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="flex items-center gap-1.5 rounded-md border border-gray-800 px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50">
              Login
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-gray-100 bg-white px-4 pb-4 lg:hidden">
          {NAV.map(item =>
            item.children ? (
              <div key={item.label} className="border-b border-gray-50">
                <button
                  onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
                  className="flex w-full items-center justify-between py-3 text-sm font-medium text-gray-700"
                >
                  {item.label}
                  <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform', mobileExpanded === item.label && 'rotate-180')} />
                </button>
                {mobileExpanded === item.label && (
                  <div className="pb-2 pl-3">
                    {item.children.map(c => (
                      <Link key={c.href} href={c.href} onClick={() => setOpen(false)} className="block py-2 text-sm text-gray-500 hover:text-green-600">
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link key={item.label} href={item.href!} onClick={() => setOpen(false)} className="block border-b border-gray-50 py-3 text-sm font-medium text-gray-700 hover:text-green-600">
                {item.label}
              </Link>
            )
          )}

          <div className="mt-4 flex flex-col gap-2">
            <button className="flex items-center justify-center gap-1 py-2 text-sm font-medium text-gray-600">
              <Globe className="h-4 w-4" /> Eng
            </button>
            <Link href="/signup" onClick={() => setOpen(false)} className="flex items-center justify-center gap-1.5 rounded-md bg-green-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-600">
              Start for FREE <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" onClick={() => setOpen(false)} className="flex items-center justify-center gap-1.5 rounded-md border border-gray-800 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50">
              Login <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
