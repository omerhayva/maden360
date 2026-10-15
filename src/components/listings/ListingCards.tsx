import Link from 'next/link';
import type { ReactNode } from 'react';
import { Briefcase, CalendarClock, Clock, MapPin, UserSearch } from 'lucide-react';
import { cardBase, cardFrame, stretchedLink } from '@/components/content/Cards';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import type { CategoryIcon as CategoryIconName } from '@/lib/content/schemas';
import type { ContentStatus } from '@/lib/content/schemas';
import { formatDate } from '@/lib/format';
import type { MarketType } from '@/lib/listings/options';
import {
  ExampleBadge,
  FeaturedBadge,
  ListingStatusBadge,
  MarketTypeBadge,
  VerifiedBadge,
} from './ListingBadges';
import { StandAvatar } from './StandAvatar';

/**
 * İlan kartları. Sunucuda ve tarayıcıdaki süzme bileşeninde ortak kullanılır;
 * yalnızca düz veri alır (sunucuya özgü içe aktarma yok).
 */

interface CommonCard {
  url: string;
  status: ContentStatus;
  example?: boolean;
}

export interface StandCardData extends CommonCard {
  kind: 'stand';
  name: string;
  summary: string;
  city: string;
  halls: string[];
  logo?: string;
  verifiedAt?: string;
  featured?: boolean;
  offeringCount: number;
}

export interface JobCardData extends CommonCard {
  kind: 'job';
  title: string;
  position: string;
  employer: string;
  location: string;
  chips: string[];
  salary?: string;
  postedAt?: string;
  expiresAt?: string;
}

export interface CandidateCardData extends CommonCard {
  kind: 'candidate';
  ref?: string;
  headline: string;
  position: string;
  chips: string[];
  cities: string[];
  certificates: string[];
}

export interface MarketCardData extends CommonCard {
  kind: 'market';
  title: string;
  type: MarketType;
  category: string;
  /** Görsel yoksa kartta küçük kategori simgesi gösterilir */
  icon: CategoryIconName;
  location: string;
  price: string;
  meta: string[];
  image?: { src: string; alt: string };
  postedAt?: string;
}

export type ListingCardData = StandCardData | JobCardData | CandidateCardData | MarketCardData;

type Heading = 'h2' | 'h3';

function Badges({
  status,
  example,
  children,
}: {
  status: ContentStatus;
  example?: boolean;
  children?: ReactNode;
}) {
  return (
    <>
      {children}
      <ListingStatusBadge status={status} />
      <ExampleBadge example={example} />
    </>
  );
}

export function StandCard({
  data,
  headingLevel: H = 'h3',
}: {
  data: StandCardData;
  headingLevel?: Heading;
}) {
  return (
    <article className={cardBase}>
      <div className="flex items-start gap-4">
        <StandAvatar name={data.name} logo={data.logo} className="h-14 w-14 text-lg" />
        <div className="min-w-0 flex-1">
          <H className="text-lg font-semibold leading-snug text-graphite-950 group-hover:text-copper-800">
            <Link href={data.url} className={stretchedLink}>
              {data.name}
            </Link>
          </H>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-graphite-600">
            <span className="inline-flex items-center gap-1">
              <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-copper-600" />
              {data.city}
            </span>
            <span aria-hidden="true">·</span>
            <span>{data.halls.join(', ')}</span>
          </p>
        </div>
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-graphite-700">{data.summary}</p>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
        <Badges status={data.status} example={data.example}>
          <FeaturedBadge featured={data.featured} />
          <VerifiedBadge checkedAt={data.verifiedAt} />
        </Badges>
        {data.offeringCount > 0 && (
          <span className="text-xs text-graphite-500">{data.offeringCount} ürün ve hizmet</span>
        )}
      </div>
    </article>
  );
}

export function JobCard({
  data,
  headingLevel: H = 'h3',
}: {
  data: JobCardData;
  headingLevel?: Heading;
}) {
  return (
    <article className={cardBase}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-copper-700">
          <Briefcase aria-hidden="true" className="h-3.5 w-3.5" />
          {data.position}
        </span>
        <Badges status={data.status} example={data.example} />
      </div>
      <H className="mt-2 text-lg font-semibold leading-snug text-graphite-950 group-hover:text-copper-800">
        <Link href={data.url} className={stretchedLink}>
          {data.title}
        </Link>
      </H>
      <p className="mt-1 text-sm text-graphite-700">
        <span className="font-medium">{data.employer}</span>
        <span aria-hidden="true"> · </span>
        <span className="inline-flex items-center gap-1">
          <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-copper-600" />
          {data.location}
        </span>
      </p>
      <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="İlan özellikleri">
        {data.chips.map((chip) => (
          <li
            key={chip}
            className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-graphite-700"
          >
            {chip}
          </li>
        ))}
      </ul>
      {data.salary && <p className="mt-3 text-sm font-semibold text-graphite-900">{data.salary}</p>}
      <p className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-4 text-xs text-graphite-500">
        {data.postedAt && (
          <span className="inline-flex items-center gap-1">
            <Clock aria-hidden="true" className="h-3.5 w-3.5" />
            Yayın: {formatDate(data.postedAt)}
          </span>
        )}
        {data.expiresAt && (
          <span className="inline-flex items-center gap-1">
            <CalendarClock aria-hidden="true" className="h-3.5 w-3.5" />
            Son başvuru: {formatDate(data.expiresAt)}
          </span>
        )}
      </p>
    </article>
  );
}

export function CandidateCard({
  data,
  headingLevel: H = 'h3',
}: {
  data: CandidateCardData;
  headingLevel?: Heading;
}) {
  return (
    <article className={cardBase}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-copper-700">
          <UserSearch aria-hidden="true" className="h-3.5 w-3.5" />
          {data.position}
        </span>
        {data.ref && <span className="font-mono text-xs text-graphite-500">{data.ref}</span>}
      </div>
      <H className="mt-2 text-lg font-semibold leading-snug text-graphite-950 group-hover:text-copper-800">
        <Link href={data.url} className={stretchedLink}>
          {data.headline}
        </Link>
      </H>
      <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Profil özellikleri">
        {data.chips.map((chip) => (
          <li
            key={chip}
            className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-graphite-700"
          >
            {chip}
          </li>
        ))}
      </ul>
      <p className="mt-3 flex items-start gap-1 text-sm text-graphite-700">
        <MapPin aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-copper-600" />
        <span>{data.cities.join(', ')}</span>
      </p>
      {data.certificates.length > 0 && (
        <p className="mt-1 line-clamp-2 text-sm text-graphite-600">
          Belgeler: {data.certificates.join(', ')}
        </p>
      )}
      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        <Badges status={data.status} example={data.example} />
      </div>
    </article>
  );
}

export function MarketCard({
  data,
  headingLevel: H = 'h3',
}: {
  data: MarketCardData;
  headingLevel?: Heading;
}) {
  return (
    <article className={`${cardFrame} overflow-hidden`}>
      {data.image && (
        // eslint-disable-next-line @next/next/no-img-element -- statik dışa aktarım; görseller önceden küçültülür
        <img
          src={data.image.src}
          alt={data.image.alt}
          loading="lazy"
          decoding="async"
          className="aspect-[16/10] w-full object-cover"
        />
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-3">
          {!data.image && (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-graphite-900 text-copper-400">
              <CategoryIcon icon={data.icon} className="h-5 w-5" />
            </span>
          )}
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <MarketTypeBadge type={data.type} />
            <span className="text-xs font-semibold uppercase tracking-wide text-copper-700">
              {data.category}
            </span>
            <Badges status={data.status} example={data.example} />
          </div>
        </div>
        <H className="mt-3 text-lg font-semibold leading-snug text-graphite-950 group-hover:text-copper-800">
          <Link href={data.url} className={stretchedLink}>
            {data.title}
          </Link>
        </H>
        {data.meta.length > 0 && (
          <p className="mt-1 text-sm text-graphite-600">{data.meta.join(' · ')}</p>
        )}
        <p className="mt-3 text-base font-bold text-graphite-950">{data.price}</p>
        <p className="mt-auto flex flex-wrap gap-x-3 pt-3 text-xs text-graphite-500">
          <span className="inline-flex items-center gap-1">
            <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
            {data.location}
          </span>
          {data.postedAt && <span>{formatDate(data.postedAt)}</span>}
        </p>
      </div>
    </article>
  );
}

export function ListingCard({
  data,
  headingLevel,
}: {
  data: ListingCardData;
  headingLevel?: Heading;
}) {
  switch (data.kind) {
    case 'stand':
      return <StandCard data={data} headingLevel={headingLevel} />;
    case 'job':
      return <JobCard data={data} headingLevel={headingLevel} />;
    case 'candidate':
      return <CandidateCard data={data} headingLevel={headingLevel} />;
    case 'market':
      return <MarketCard data={data} headingLevel={headingLevel} />;
  }
}
