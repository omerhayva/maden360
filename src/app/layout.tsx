import '@fontsource-variable/ibm-plex-sans/wdth.css';
import './globals.css';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { PreviewBanner } from '@/components/layout/PreviewBanner';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { JsonLd } from '@/components/seo/JsonLd';
import { siteConfig } from '@/config/site';
import { isPreviewMode } from '@/lib/content/visibility';
import { OG_IMAGE } from '@/lib/seo/metadata';
import { websiteSchema } from '@/lib/seo/structured-data';

if (process.env.NODE_ENV === 'production' && !siteConfig.isUrlConfigured && !isPreviewMode()) {
  console.warn(
    `\n⚠  SITE_URL ortam değişkeni ayarlanmadı; kanonik adresler ${siteConfig.url} ile üretiliyor. ` +
      'Yayına almadan önce SITE_URL değerini gerçek alan adınızla ayarlayın (bkz. docs/yayinlama-ve-geri-alma.md).\n',
  );
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  formatDetection: { telephone: false, address: false, email: false },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    locale: siteConfig.ogLocale,
    images: [OG_IMAGE],
  },
  robots: isPreviewMode() ? { index: false, follow: false } : undefined,
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr" dir="ltr">
      <body className="flex min-h-dvh flex-col">
        <a
          href="#icerik"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-sm focus:bg-white focus:px-4 focus:py-3 focus:font-semibold focus:text-graphite-950 focus:shadow-lg"
        >
          İçeriğe geç
        </a>
        <PreviewBanner />
        <SiteHeader />
        <main id="icerik" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>
        <SiteFooter />
        <JsonLd data={websiteSchema()} />
      </body>
    </html>
  );
}
