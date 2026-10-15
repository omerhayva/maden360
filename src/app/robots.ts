import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { isPreviewMode } from '@/lib/content/visibility';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  // Önizleme ortamı (taslaklar görünür) arama motorlarına tamamen kapalıdır.
  if (isPreviewMode()) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/ara'] },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
