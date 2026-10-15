import type { MetadataRoute } from 'next';
import { optionalPageFiles, routes } from '@/i18n/routes';
import {
  getArticles,
  getCalculators,
  getCategories,
  getHalls,
  getJobs,
  getMarketCategories,
  getMarketListings,
  getOptionalPage,
  getStands,
  getTerms,
} from '@/lib/content';
import { absoluteUrl } from '@/lib/seo/metadata';

export const dynamic = 'force-static';

/**
 * Site haritası yalnızca yayımlanmış içerikleri listeler. Aday profilleri kişisel veri
 * içerdiği için (noindex) site haritasına eklenmez.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    routes.home(),
    routes.articles(),
    routes.topics(),
    routes.calculators(),
    routes.guide(),
    routes.glossary(),
    routes.fair(),
    routes.jobs(),
    routes.market(),
    routes.postListing(),
    routes.about(),
    routes.sourcePolicy(),
    routes.correctionPolicy(),
    routes.contact(),
  ];

  const lastModified = (entry: {
    updatedAt?: string;
    reviewedAt?: string;
    publishedAt?: string;
    postedAt?: string;
  }) => entry.updatedAt ?? entry.reviewedAt ?? entry.publishedAt ?? entry.postedAt;

  const optionalPages = Object.values(optionalPageFiles)
    .map((slug) => getOptionalPage(slug))
    .filter((page) => page?.status === 'published');

  return [
    ...staticPaths.map((path) => ({ url: absoluteUrl(path) })),
    ...optionalPages.map((page) => ({
      url: absoluteUrl(`/${page!.slug}`),
      lastModified: page!.updatedAt,
    })),
    ...getCategories().map((category) => ({ url: absoluteUrl(routes.topic(category.slug)) })),
    ...getHalls().map((hall) => ({ url: absoluteUrl(routes.hall(hall.slug)) })),
    ...getMarketCategories().map((category) => ({
      url: absoluteUrl(routes.marketCategory(category.slug)),
    })),
    ...[...getCalculators(), ...getArticles(), ...getTerms()]
      .filter((entry) => entry.status === 'published')
      .map((entry) => ({ url: absoluteUrl(entry.url), lastModified: lastModified(entry) })),
    ...[...getStands(), ...getJobs(), ...getMarketListings()]
      .filter((entry) => entry.status === 'published' && !entry.example)
      .map((entry) => ({ url: absoluteUrl(entry.url), lastModified: lastModified(entry) })),
  ];
}
