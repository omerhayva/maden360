import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { isPreviewMode } from '@/lib/content/visibility';
import { truncate } from '@/lib/text';

export const OG_IMAGE = {
  url: '/og-image.jpg',
  width: 1200,
  height: 630,
  alt: `${siteConfig.name}: ${siteConfig.tagline}`,
};

export interface PageMetaInput {
  /** Site adı eklenmeden sayfa başlığı */
  title: string;
  description: string;
  /** Kanonik yol, ör. "/market/ornek-krom-cevheri" */
  path: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
  /** Ana sayfa gibi şablon kullanmayan başlıklar */
  absoluteTitle?: boolean;
  keywords?: string[];
}

/**
 * Her sayfa için özgün başlık, açıklama, kanonik URL ve Open Graph bilgisi üretir.
 * Önizleme ortamında (taslaklar görünürken) tüm sayfalar "noindex" olur.
 */
export function pageMetadata(input: PageMetaInput): Metadata {
  const noindex = input.noindex || isPreviewMode();
  // Arama sonuçlarında kesilmemesi için güvenlik ağı (asıl çözüm: seoDescription alanı)
  const description = truncate(input.description, 160);
  const fullTitle = input.absoluteTitle ? input.title : `${input.title} | ${siteConfig.name}`;
  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description,
    keywords: input.keywords && input.keywords.length > 0 ? input.keywords : undefined,
    alternates: { canonical: input.path },
    openGraph: {
      type: input.type ?? 'website',
      url: input.path,
      title: fullTitle,
      description,
      siteName: siteConfig.name,
      locale: siteConfig.ogLocale,
      images: [OG_IMAGE],
      ...(input.type === 'article'
        ? { publishedTime: input.publishedTime, modifiedTime: input.modifiedTime }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [OG_IMAGE.url],
    },
    robots: noindex ? { index: false, follow: true } : undefined,
  };
}

export function absoluteUrl(path: string): string {
  return `${siteConfig.url}${path === '/' ? '' : path}`;
}
