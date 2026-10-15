import type { MetadataRoute } from 'next';
import { routes } from '@/i18n/routes';
import { getArticles, getCalculators, getCategories, getTerms } from '@/lib/content';
import { absoluteUrl } from '@/lib/seo/metadata';

export const dynamic = 'force-static';

/** Site haritası yalnızca yayımlanmış içerikleri listeler. */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    routes.home(),
    routes.articles(),
    routes.topics(),
    routes.calculators(),
    routes.guide(),
    routes.glossary(),
    routes.about(),
    routes.sourcePolicy(),
    routes.correctionPolicy(),
    routes.contact(),
  ];

  const lastModified = (entry: { updatedAt?: string; reviewedAt?: string; publishedAt?: string }) =>
    entry.updatedAt ?? entry.reviewedAt ?? entry.publishedAt;

  return [
    ...staticPaths.map((path) => ({ url: absoluteUrl(path) })),
    ...getCategories().map((category) => ({ url: absoluteUrl(routes.topic(category.slug)) })),
    ...[...getCalculators(), ...getArticles(), ...getTerms()]
      .filter((entry) => entry.status === 'published')
      .map((entry) => ({ url: absoluteUrl(entry.url), lastModified: lastModified(entry) })),
  ];
}
