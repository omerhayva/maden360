import 'server-only';
import type { BrowserItem, FacetFilter } from '@/components/listings/ListingBrowser';
import type {
  CandidateCardData,
  JobCardData,
  MarketCardData,
  StandCardData,
} from '@/components/listings/ListingCards';
import {
  getHall,
  getMarketCategory,
  getPosition,
  type Candidate,
  type JobPosting,
  type MarketListing,
  type Stand,
} from '@/lib/content';
import { foldTurkish, turkishCollator } from '@/lib/text';
import { formatPrice, formatQuantity, formatSalary } from './format';
import {
  availabilityLabels,
  conditionLabels,
  employmentTypeLabels,
  licenseKindLabels,
  licenseOfferLabels,
  marketTypeLabels,
  REGION_WILDCARDS,
  siteTypeLabels,
  type Option,
} from './options';

/**
 * İçerik kayıtlarını kart ve süzme verisine dönüştürür (yalnızca sunucuda).
 */

const fold = (...parts: (string | undefined | false)[]) =>
  foldTurkish(parts.filter(Boolean).join(' '));

export function locationOf(entry: { city: string; district?: string }): string {
  return entry.district ? `${entry.district}, ${entry.city}` : entry.city;
}

/* ------------------------------ Fuar ------------------------------ */

export function standCard(stand: Stand): StandCardData {
  return {
    kind: 'stand',
    url: stand.url,
    status: stand.status,
    example: stand.example,
    name: stand.name,
    summary: stand.summary,
    city: stand.city,
    halls: stand.halls.map((slug) => {
      const hall = getHall(slug);
      return hall ? `Salon ${hall.code}` : slug;
    }),
    logo: stand.logo,
    verifiedAt: stand.verification?.checkedAt,
    featured: stand.featured,
    offeringCount: stand.offerings.length,
  };
}

export function standItem(stand: Stand): BrowserItem {
  return {
    key: stand.slug,
    expiresAt: stand.expiresAt,
    searchText: fold(
      stand.name,
      stand.summary,
      stand.city,
      ...stand.serviceArea,
      ...stand.offerings.map((offering) => `${offering.name} ${offering.description ?? ''}`),
      ...stand.brands,
      ...stand.keywords,
      ...stand.halls.map((slug) => getHall(slug)?.name),
    ),
    facets: { salon: stand.halls, il: stand.city },
    card: standCard(stand),
  };
}

/* ------------------------------ İş ilanları ------------------------------ */

export function jobCard(job: JobPosting): JobCardData {
  const chips: string[] = [siteTypeLabels[job.siteType], employmentTypeLabels[job.employmentType]];
  if (job.openings > 1) chips.push(`${job.openings} kişi`);
  if (job.experienceYears) chips.push(`En az ${job.experienceYears} yıl deneyim`);
  return {
    kind: 'job',
    url: job.url,
    status: job.status,
    example: job.example,
    title: job.title,
    position: getPosition(job.position)?.name ?? job.position,
    employer: job.employer.name,
    location: locationOf(job),
    chips,
    salary: job.salary ? formatSalary(job.salary) : undefined,
    postedAt: job.postedAt,
    expiresAt: job.expiresAt,
  };
}

export function jobItem(job: JobPosting): BrowserItem {
  return {
    key: job.slug,
    expiresAt: job.expiresAt,
    searchText: fold(
      job.title,
      job.summary,
      job.employer.name,
      job.city,
      job.district,
      getPosition(job.position)?.name,
      ...job.requirements,
      ...job.certificates,
      ...job.keywords,
    ),
    facets: { meslek: job.position, il: job.city, yer: job.siteType, sekil: job.employmentType },
    card: jobCard(job),
  };
}

/* ------------------------------ Adaylar ------------------------------ */

export function candidateCard(candidate: Candidate): CandidateCardData {
  const chips = [
    candidate.experienceYears > 0
      ? `${candidate.experienceYears} yıl deneyim`
      : 'Yeni mezun / deneyimsiz',
  ];
  if (candidate.availability !== 'belirtilmedi')
    chips.push(availabilityLabels[candidate.availability]);
  return {
    kind: 'candidate',
    url: candidate.url,
    status: candidate.status,
    example: candidate.example,
    ref: candidate.ref,
    headline: candidate.headline,
    position: getPosition(candidate.position)?.name ?? candidate.position,
    chips,
    cities: candidate.preferredCities,
    certificates: candidate.certificates.slice(0, 3),
  };
}

export function candidateItem(candidate: Candidate): BrowserItem {
  return {
    key: candidate.slug,
    expiresAt: candidate.expiresAt,
    searchText: fold(
      candidate.headline,
      candidate.summary,
      getPosition(candidate.position)?.name,
      ...candidate.skills,
      ...candidate.certificates,
      ...candidate.preferredCities,
      candidate.ref,
    ),
    facets: {
      meslek: candidate.position,
      il: candidate.preferredCities,
      hazir: candidate.availability,
    },
    card: candidateCard(candidate),
  };
}

/* ------------------------------ Market ------------------------------ */

export function marketMeta(listing: MarketListing): string[] {
  const meta: string[] = [];
  if (listing.ore) {
    meta.push(listing.ore.mineral);
    if (listing.ore.grade) meta.push(listing.ore.grade);
  }
  if (listing.license) {
    meta.push(
      `${listing.license.group} Grubu`,
      licenseKindLabels[listing.license.kind],
      licenseOfferLabels[listing.license.offer],
    );
    if (listing.license.areaHectares)
      meta.push(`${new Intl.NumberFormat('tr-TR').format(listing.license.areaHectares)} ha`);
  }
  if (listing.quantity) meta.push(formatQuantity(listing.quantity.value, listing.quantity.unit));
  const brandModel = [listing.brand, listing.model].filter(Boolean).join(' ');
  if (brandModel) meta.push(brandModel);
  if (listing.year) meta.push(String(listing.year));
  if (listing.hours !== undefined)
    meta.push(`${new Intl.NumberFormat('tr-TR').format(listing.hours)} saat`);
  if (listing.condition) meta.push(conditionLabels[listing.condition]);
  return meta;
}

export function marketCard(listing: MarketListing): MarketCardData {
  const category = getMarketCategory(listing.category);
  return {
    kind: 'market',
    url: listing.url,
    status: listing.status,
    example: listing.example,
    title: listing.title,
    type: listing.type,
    category: category?.name ?? listing.category,
    icon: category?.icon ?? 'wrench',
    location: locationOf(listing),
    price: formatPrice(listing.price),
    meta: marketMeta(listing),
    image: listing.images[0],
    postedAt: listing.postedAt,
  };
}

export function marketItem(listing: MarketListing): BrowserItem {
  return {
    key: listing.slug,
    expiresAt: listing.expiresAt,
    searchText: fold(
      listing.title,
      listing.summary,
      listing.city,
      listing.district,
      listing.seller.name,
      getMarketCategory(listing.category)?.name,
      marketTypeLabels[listing.type],
      ...marketMeta(listing),
      ...listing.specs.map((spec) => `${spec.label} ${spec.value}`),
      ...listing.keywords,
    ),
    facets: { kategori: listing.category, tur: listing.type, il: listing.city },
    card: marketCard(listing),
  };
}

/* ------------------------------ Süzgeçler ------------------------------ */

/** Yalnızca listede bulunan değerlerden seçenek üretir (Türkçe sıralı). */
export function facetFilter(
  items: BrowserItem[],
  config: {
    id: string;
    label: string;
    allLabel: string;
    labelFor?: (value: string) => string;
    sort?: boolean;
    wildcards?: boolean;
  },
): FacetFilter {
  const values = new Set<string>();
  for (const item of items) {
    const value = item.facets[config.id];
    for (const v of Array.isArray(value) ? value : value ? [value] : []) values.add(v);
  }
  const wildcards: string[] = config.wildcards ? [...REGION_WILDCARDS] : [];
  let options: Option[] = [...values]
    .filter((value) => !wildcards.includes(value))
    .map((value) => ({ value, label: config.labelFor?.(value) ?? value }));
  if (config.sort !== false)
    options = options.sort((a, b) => turkishCollator.compare(a.label, b.label));
  return { id: config.id, label: config.label, allLabel: config.allLabel, options, wildcards };
}
