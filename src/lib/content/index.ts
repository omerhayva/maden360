import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import { optionalPageFiles } from '@/i18n/routes';
import { turkishCollator } from '@/lib/text';
import {
  loadContentStore,
  type Candidate,
  type ContentStore,
  type JobPosting,
  type MarketListing,
  type Stand,
  type StaticPage,
} from './repository';
import type { Hall, MarketCategory, Person, Position } from './schemas';
import { isListingVisible, isVisible } from './visibility';

export type {
  Candidate,
  JobPosting,
  ListingEntry,
  MarketListing,
  Stand,
  StaticPage,
} from './repository';

let cache: { store: ContentStore; signature: string } | undefined;

/** content/ klasöründeki dosya sayısı ve en son değişiklik zamanı (geliştirmede önbellek anahtarı). */
function contentSignature(): string {
  let latest = 0;
  let count = 0;
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else {
        count += 1;
        latest = Math.max(latest, fs.statSync(full).mtimeMs);
      }
    }
  };
  walk(path.join(process.cwd(), 'content'));
  return `${count}:${latest}`;
}

/**
 * İçerik deposunu yükler. Üretim derlemesinde bir kez okunur; geliştirmede
 * içerik dosyaları değiştiğinde otomatik olarak yeniden yüklenir.
 */
export function getStore(): ContentStore {
  const isProduction = process.env.NODE_ENV === 'production';
  if (cache && isProduction) return cache.store;
  const signature = isProduction ? 'uretim' : contentSignature();
  if (cache && cache.signature === signature) return cache.store;
  const { store, errors } = loadContentStore();
  if (errors.length > 0) {
    const details = errors.map((error) => `\n• ${error.message}`).join('');
    throw new Error(
      `İçerik dosyalarında ${errors.length} hata var. Ayrıntılar için "npm run content:check" çalıştırın.${details}`,
    );
  }
  cache = { store, signature };
  return store;
}

export function getPerson(id: string): Person | undefined {
  return getStore().people.find((person) => person.id === id);
}

/* --------------------------- Sayfalar --------------------------- */

export function getPage(slug: string): StaticPage {
  const page = getStore().pages.find((entry) => entry.slug === slug);
  if (!page) throw new Error(`content/sayfalar/${slug}.md bulunamadı.`);
  return page;
}

/** Yayın durumuna bağlı sayfa (ilan kuralları, KVKK): yayımlanmadıysa üretimde yoktur. */
export function getOptionalPage(slug: string): StaticPage | undefined {
  const page = getStore().pages.find((entry) => entry.slug === slug);
  return page && isVisible(page.status) ? page : undefined;
}

/**
 * İlan başvuru formları, ilan kuralları ve KVKK aydınlatma metni yayımlandığında
 * açılır (önizleme ortamında her zaman açıktır).
 */
export function areSubmissionsOpen(): boolean {
  return Object.values(optionalPageFiles).every((slug) => getOptionalPage(slug) !== undefined);
}

/* --------------------------- Sanal fuar --------------------------- */

export function getHalls(): Hall[] {
  return getStore().halls;
}

export function getHall(slug: string): Hall | undefined {
  return getStore().halls.find((hall) => hall.slug === slug);
}

const standOrder = (a: Stand, b: Stand) =>
  Number(b.featured) - Number(a.featured) || turkishCollator.compare(a.name, b.name);

export function getStands(): Stand[] {
  return getStore()
    .stands.filter((stand) => isListingVisible(stand))
    .sort(standOrder);
}

export function getStand(slug: string | undefined): Stand | undefined {
  if (!slug) return undefined;
  const stand = getStore().stands.find((entry) => entry.slug === slug);
  return stand && isListingVisible(stand) ? stand : undefined;
}

export function getStandsByHall(slug: string): Stand[] {
  return getStands().filter((stand) => stand.halls.includes(slug));
}

/* --------------------------- İş ilanları ve adaylar --------------------------- */

const byPostedDesc = <T extends { postedAt?: string; slug: string }>(a: T, b: T) =>
  (b.postedAt ?? '').localeCompare(a.postedAt ?? '') || a.slug.localeCompare(b.slug);

export function getPositions(): Position[] {
  return getStore().positions;
}

export function getPosition(slug: string): Position | undefined {
  return getStore().positions.find((position) => position.slug === slug);
}

export function getJobs(): JobPosting[] {
  return getStore()
    .jobs.filter((job) => isListingVisible(job))
    .sort(byPostedDesc);
}

export function getJob(slug: string): JobPosting | undefined {
  const job = getStore().jobs.find((entry) => entry.slug === slug);
  return job && isListingVisible(job) ? job : undefined;
}

export function getJobsByStand(standSlug: string): JobPosting[] {
  return getJobs().filter((job) => job.employer.stand === standSlug);
}

export function getCandidates(): Candidate[] {
  return getStore()
    .candidates.filter((candidate) => isListingVisible(candidate))
    .sort(byPostedDesc);
}

export function getCandidate(slug: string): Candidate | undefined {
  const candidate = getStore().candidates.find((entry) => entry.slug === slug);
  return candidate && isListingVisible(candidate) ? candidate : undefined;
}

/* --------------------------- Market --------------------------- */

export function getMarketCategories(): MarketCategory[] {
  return getStore().marketCategories;
}

export function getMarketCategory(slug: string): MarketCategory | undefined {
  return getStore().marketCategories.find((category) => category.slug === slug);
}

export function getMarketListings(): MarketListing[] {
  return getStore()
    .marketListings.filter((listing) => isListingVisible(listing))
    .sort(byPostedDesc);
}

export function getMarketListing(slug: string): MarketListing | undefined {
  const listing = getStore().marketListings.find((entry) => entry.slug === slug);
  return listing && isListingVisible(listing) ? listing : undefined;
}

export function getMarketListingsByCategory(slug: string): MarketListing[] {
  return getMarketListings().filter((listing) => listing.category === slug);
}

export function getMarketListingsByStand(standSlug: string): MarketListing[] {
  return getMarketListings().filter((listing) => listing.seller.stand === standSlug);
}
