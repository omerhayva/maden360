import 'server-only';
import {
  getHall,
  getJobs,
  getMarketCategory,
  getMarketListings,
  getPosition,
  getStands,
} from '@/lib/content';
import { marketMeta } from '@/lib/listings/view';
import { truncate } from '@/lib/text';
import type { SearchDocument } from './engine';

const BODY_LIMIT = 6000;

/**
 * Arama dizini belgeleri: fuar standları, iş ilanları ve market ilanları. Aday profilleri
 * kişisel veri içerdiği için arama dizinine eklenmez.
 */
export function buildSearchDocuments(): SearchDocument[] {
  const stands: SearchDocument[] = getStands().map((stand) => ({
    id: `stand:${stand.slug}`,
    type: 'stand',
    title: stand.name,
    url: stand.url,
    summary: stand.summary,
    category: stand.halls.map((slug) => getHall(slug)?.name ?? slug).join(', '),
    keywords: [...stand.keywords, ...stand.brands, stand.city, ...stand.serviceArea].join(' '),
    headings: stand.offerings.map((offering) => offering.name).join(' '),
    body: truncate(stand.plainText, BODY_LIMIT),
    expiresAt: stand.expiresAt,
  }));

  const jobs: SearchDocument[] = getJobs().map((job) => ({
    id: `is:${job.slug}`,
    type: 'is-ilani',
    title: job.title,
    url: job.url,
    summary: job.summary,
    category: getPosition(job.position)?.name,
    keywords: [
      job.employer.name,
      job.city,
      job.district ?? '',
      ...job.keywords,
      ...job.certificates,
    ].join(' '),
    headings: job.requirements.join(' '),
    body: truncate(job.plainText, BODY_LIMIT),
    expiresAt: job.expiresAt,
  }));

  const market: SearchDocument[] = getMarketListings().map((listing) => ({
    id: `market:${listing.slug}`,
    type: 'market',
    title: listing.title,
    url: listing.url,
    summary: listing.summary,
    category: getMarketCategory(listing.category)?.name,
    keywords: [...marketMeta(listing), listing.city, listing.seller.name, ...listing.keywords].join(
      ' ',
    ),
    headings: listing.specs.map((spec) => `${spec.label} ${spec.value}`).join(' '),
    body: truncate(listing.plainText, BODY_LIMIT),
    expiresAt: listing.expiresAt,
  }));

  return [...stands, ...jobs, ...market];
}
