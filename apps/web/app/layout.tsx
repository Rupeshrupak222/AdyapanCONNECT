import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { QueryProvider } from '@/components/ui/query-provider';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://connect.adyapan.com';

export const metadata: Metadata = {
  title: {
    default: 'Adyapan Connect – WhatsApp Business API, CRM & Automation Platform',
    template: '%s | Adyapan Connect',
  },
  description:
    'Adyapan Connect is an AI-powered WhatsApp Business platform for messaging, CRM, chatbots, broadcasts and automation. Connect, automate, engage and grow your business on WhatsApp.',
  keywords: [
    'Adyapan Connect', 'Adyapan', 'WhatsApp Business API', 'WhatsApp CRM', 'WhatsApp automation',
    'WhatsApp chatbot', 'WhatsApp broadcast', 'AI agent', 'team inbox', 'campaign management',
    'WhatsApp marketing', 'business messaging',
  ],
  authors: [{ name: 'Adyapan' }],
  creator: 'Adyapan',
  publisher: 'Adyapan',
  applicationName: 'Adyapan Connect',
  icons: {
    icon: '/icon.jpg',
    shortcut: '/icon.jpg',
    apple: '/apple-icon.jpg',
  },
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    title: 'Adyapan Connect – WhatsApp Business API, CRM & Automation Platform',
    description: 'AI-powered WhatsApp Business messaging, CRM, chatbots & automation. Connect. Automate. Engage. Grow.',
    siteName: 'Adyapan Connect',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Adyapan Connect – WhatsApp Business Platform',
    description: 'AI-powered WhatsApp Business messaging, CRM & automation SaaS.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Adyapan Connect',
  url: SITE_URL,
  logo: `${SITE_URL}/icon.jpg`,
  description: 'AI-powered WhatsApp Business messaging, CRM, chatbots and automation platform.',
  sameAs: [] as string[],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
