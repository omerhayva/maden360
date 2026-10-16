import type { MetadataRoute } from 'next';
import { optionalPageFiles, routes } from '@/i18n/routes';
import {
  getHalls,
  getJobs,
  getMarketCategories,
  getMarketListings,
  getOptionalPage,
  getStands,
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
    routes.fair(),
    routes.jobs(),
    routes.market(),
    routes.postListing(),
    routes.about(),
    routes.contact(),
  ];

  const optionalPages = Object.values(optionalPageFiles)
    .map((slug) => getOptionalPage(slug))
    .filter((page) => page?.status === 'published');

  return [
    ...staticPaths.map((path) => ({ url: absoluteUrl(path) })),
    ...optionalPages.map((page) => ({
      url: absoluteUrl(`/${page!.slug}`),
      lastModified: page!.updatedAt,
    })),
    ...getHalls().map((hall) => ({ url: absoluteUrl(routes.hall(hall.slug)) })),
    ...getMarketCategories().map((category) => ({
      url: absoluteUrl(routes.marketCategory(category.slug)),
    })),
    ...[...getStands(), ...getJobs(), ...getMarketListings()]
      .filter((entry) => entry.status === 'published' && !entry.example)
      .map((entry) => ({
        url: absoluteUrl(entry.url),
        lastModified: entry.updatedAt ?? entry.postedAt,
      })),
  ];
}
