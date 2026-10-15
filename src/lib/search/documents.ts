import 'server-only';
import {
  getArticles,
  getCalculators,
  getCategory,
  getHall,
  getJobs,
  getMarketCategory,
  getMarketListings,
  getPosition,
  getStands,
  getTag,
  getTerms,
} from '@/lib/content';
import { marketMeta } from '@/lib/listings/view';
import { truncate } from '@/lib/text';
import type { SearchDocument } from './engine';

const BODY_LIMIT = 6000;

const tagNames = (slugs: string[]) => slugs.map((slug) => getTag(slug)?.name ?? slug).join(' ');

/** Yayımlanabilir tüm içeriklerden arama dizini belgelerini üretir. */
export function buildSearchDocuments(): SearchDocument[] {
  const calculators: SearchDocument[] = getCalculators().map((calculator) => ({
    id: `hesaplama:${calculator.slug}`,
    type: 'hesaplama',
    title: calculator.title,
    url: calculator.url,
    summary: calculator.summary,
    category: getCategory(calculator.category)?.name,
    keywords: [calculator.shortTitle, ...calculator.keywords, tagNames(calculator.tags)].join(' '),
    headings: calculator.toc.map((entry) => entry.text).join(' '),
    body: truncate(calculator.plainText, BODY_LIMIT),
  }));

  const articles: SearchDocument[] = getArticles().map((article) => ({
    id: `makale:${article.slug}`,
    type: 'makale',
    title: article.title,
    url: article.url,
    summary: article.summary,
    category: getCategory(article.category)?.name,
    keywords: [...article.keywords, tagNames(article.tags)].join(' '),
    headings: article.toc.map((entry) => entry.text).join(' '),
    body: truncate(article.plainText, BODY_LIMIT),
  }));

  const terms: SearchDocument[] = getTerms().map((term) => ({
    id: `terim:${term.slug}`,
    type: 'terim',
    title: term.term,
    url: term.url,
    summary: term.definition,
    category: term.category ? getCategory(term.category)?.name : undefined,
    keywords: [
      term.english ?? '',
      term.abbreviation ?? '',
      ...term.aliases,
      tagNames(term.tags),
    ].join(' '),
    headings: '',
    body: truncate(term.plainText, BODY_LIMIT),
  }));

  /*
   * İlanlar: fuar standları, iş ilanları ve market ilanları. Aday profilleri kişisel
   * veri içerdiği için arama dizinine eklenmez.
   */
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

  return [...calculators, ...articles, ...terms, ...stands, ...jobs, ...market];
}
