import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://connect.adyapan.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Keep private / app areas out of search results
        disallow: ['/dashboard', '/inbox', '/settings', '/billing', '/contacts', '/campaigns', '/analytics', '/ai-agents', '/workflows', '/chatbots', '/developer', '/crm', '/onboarding', '/verify-email', '/forgot-password', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
