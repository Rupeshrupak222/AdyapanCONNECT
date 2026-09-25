import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Adyapan Connect – WhatsApp Business Platform',
    short_name: 'Adyapan Connect',
    description: 'AI-Powered WhatsApp Business Messaging, CRM & Automation SaaS.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#22c55e',
    icons: [
      { src: '/icon.jpg', sizes: '512x512', type: 'image/jpeg' },
    ],
  };
}
