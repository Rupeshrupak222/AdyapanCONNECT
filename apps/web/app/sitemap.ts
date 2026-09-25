import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://connect.adyapan.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Public, indexable pages
  const staticRoutes = [
    '', // home
    '/pricing',
    '/features',
    '/about',
    '/customers',
    '/contact',
    '/blog',
    '/help',
    '/docs',
    '/developers',
    '/partner',
    '/demo',
    '/security',
    '/whatsapp-api',
    '/shared-inbox',
    '/ai-agent',
    '/automation',
    '/crm',
    '/campaigns',
    '/webhooks',
    '/sdks',
    '/terms',
    '/privacy',
    '/refund-policy',
    // product
    '/product/inbox',
    '/product/campaigns',
    '/product/chatbot',
    '/product/ai',
    // features
    '/features/whatsapp-api',
    '/features/automation',
    '/features/crm',
    '/features/analytics',
    // industries
    '/industries/ecommerce',
    '/industries/education',
    '/industries/healthcare',
    '/industries/real-estate',
    // integrations
    '/integrations/shopify',
    '/integrations/zapier',
    '/integrations/hubspot',
    '/integrations/woocommerce',
  ];

  return staticRoutes.map(route => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : route === '/pricing' || route === '/features' ? 0.9 : 0.7,
  }));
}
