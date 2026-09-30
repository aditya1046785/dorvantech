import type { Metadata } from 'next';
import { Bricolage_Grotesque, Source_Serif_4, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  axes: ['opsz', 'wdth'],
  variable: '--font-display',
  display: 'swap',
});

const body = Source_Serif_4({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--font-body',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dorvantech.in';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'DORVANTECH | Technology that works for your business',
  description:
    'DORVANTECH builds custom websites, software systems and AI-powered tools, and can manage the technology after launch.',
  openGraph: {
    title: 'DORVANTECH | Technology that works for your business',
    description:
      'DORVANTECH builds custom websites, software systems and AI-powered tools, and can manage the technology after launch.',
    url: siteUrl,
    siteName: 'DORVANTECH',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DORVANTECH | Technology that works for your business',
    description:
      'DORVANTECH builds custom websites, software systems and AI-powered tools, and can manage the technology after launch.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'DORVANTECH',
    url: siteUrl,
  };

  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}