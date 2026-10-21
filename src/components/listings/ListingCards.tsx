import Link from 'next/link';
import type { ReactNode } from 'react';
import { listRow, stretchedLink } from '@/components/ui/card';
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
 * İlan satırları. Liste panelinin (card.ts → listPanel) içinde, her biri bir <li> olarak
 * kullanılır. Sunucuda ve tarayıcıdaki süzme bileşeninde ortak kullanılır; yalnızca düz veri
 * alır (sunucuya özgü içe aktarma yok).
 *
 * Satır düzeni: solda başlık ve bilgiler, sağda (telefonda başlığın altında) en çok bakılan
 * değer (ücret, fiyat, il). Bilgi parçaları ince dikey çizgiyle ayrılır; büyük harfli etiket ve
 * süs simgesi kullanılmaz.
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
  /** Yan haklar (servis, yemek, lojman...) */
  benefits?: string[];
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
  /** Kategori simgesi (içerik şemasında tutulur; satırda gösterilmez) */
  icon: CategoryIconName;
  location: string;
  price: string;
  meta: string[];
  image?: { src: string; alt: string };
  postedAt?: string;
}

export type ListingCardData = StandCardData | JobCardData | CandidateCardData | MarketCardData;

type Heading = 'h2' | 'h3';

/**
 * Bilgi parçaları: aralarında ince dikey çizgi (orta nokta kullanılmaz). Liste, çizgi ve iç
 * boşluk kadar (1 px + 10 px) sola kaydırılıp kırpılan bir kapsayıcıya konur; böylece satır
 * kaydığında yeni satırın başındaki çizgi görünmez.
 */
export function Facts({
  items,
  label,
  className = '',
}: {
  items: (string | false | null | undefined)[];
  label?: string;
  className?: string;
}) {
  const list = items.filter((item): item is string => Boolean(item));
  if (list.length === 0) return null;
  return (
    <div className={`overflow-hidden ${className}`}>
      <ul
        aria-label={label}
        className="-ml-[11px] flex flex-wrap items-center gap-y-1 text-sm leading-5 text-graphite-700"
      >
        {list.map((item, index) => (
          <li key={`${item}-${index}`} className="border-l border-stone-300 px-2.5">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusBadges({ status, example }: { status: ContentStatus; example?: boolean }) {
  return (
    <>
      <ListingStatusBadge status={status} />
      <ExampleBadge example={example} />
    </>
  );
}

/** Başlık satırı: solda başlık, sağda öne çıkan değer (telefonda alt alta) */
function TitleLine({
  H,
  href,
  title,
  aside,
}: {
  H: Heading;
  href: string;
  title: string;
  aside?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <H className="text-lg leading-snug font-semibold text-graphite-950">
        <Link href={href} className={stretchedLink}>
          {title}
        </Link>
      </H>
      {aside}
    </div>
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
    <article className={`${listRow} flex gap-4`}>
      <StandAvatar name={data.name} logo={data.logo} className="mt-0.5 h-12 w-12 text-base" />
      <div className="min-w-0 flex-1">
        <TitleLine
          H={H}
          href={data.url}
          title={data.name}
          aside={<p className="shrink-0 text-sm text-graphite-700">{data.city}</p>}
        />
        <Facts items={data.halls} label="Salonlar" className="mt-1" />
        <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-graphite-800">{data.summary}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-graphite-600">
          <FeaturedBadge featured={data.featured} />
          <VerifiedBadge checkedAt={data.verifiedAt} />
          {data.offeringCount > 0 && <span>{data.offeringCount} ürün ve hizmet</span>}
          <StatusBadges status={data.status} example={data.example} />
        </div>
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
    <article className={listRow}>
      <TitleLine
        H={H}
        href={data.url}
        title={data.title}
        aside={
          data.salary && (
            <p className="shrink-0 text-sm font-semibold text-graphite-950 tabular-nums">
              {data.salary}
            </p>
          )
        }
      />
      <p className="mt-1 text-sm text-graphite-800">
        <span className="font-medium">{data.employer}</span>, {data.location}
      </p>
      <Facts items={data.chips} label="İlan özellikleri" className="mt-1" />
      {data.benefits && data.benefits.length > 0 && (
        <p className="mt-1 text-sm text-graphite-700">Yan haklar: {data.benefits.join(', ')}</p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-graphite-600">
        {data.postedAt && <span>Yayın: {formatDate(data.postedAt)}</span>}
        {data.expiresAt && <span>Son başvuru: {formatDate(data.expiresAt)}</span>}
        <StatusBadges status={data.status} example={data.example} />
      </div>
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
    <article className={listRow}>
      <TitleLine
        H={H}
        href={data.url}
        title={data.headline}
        aside={
          data.ref && (
            <p className="shrink-0 text-xs text-graphite-600 tabular-nums">Profil no {data.ref}</p>
          )
        }
      />
      <Facts items={[data.position, ...data.chips]} label="Profil özellikleri" className="mt-1" />
      <p className="mt-1 text-sm text-graphite-700">
        Çalışabileceği iller: {data.cities.join(', ')}
      </p>
      {data.certificates.length > 0 && (
        <p className="mt-1 line-clamp-2 text-sm text-graphite-700">
          Belgeler: {data.certificates.join(', ')}
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2 empty:hidden">
        <StatusBadges status={data.status} example={data.example} />
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
    <article className={`${listRow} flex gap-4`}>
      {data.image && (
        // eslint-disable-next-line @next/next/no-img-element -- statik dışa aktarım; görseller önceden küçültülür
        <img
          src={data.image.src}
          alt={data.image.alt}
          loading="lazy"
          decoding="async"
          className="h-20 w-28 shrink-0 rounded-xs bg-stone-100 object-cover sm:h-24 sm:w-32"
        />
      )}
      <div className="min-w-0 flex-1">
        <TitleLine
          H={H}
          href={data.url}
          title={data.title}
          aside={
            <p className="shrink-0 text-base font-semibold text-graphite-950 tabular-nums">
              {data.price}
            </p>
          }
        />
        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <MarketTypeBadge type={data.type} />
          <Facts items={[data.category, data.location]} label="Kategori ve konum" />
        </div>
        <Facts items={data.meta} label="Ürün bilgileri" className="mt-1" />
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-graphite-600">
          {data.postedAt && <span>Yayın: {formatDate(data.postedAt)}</span>}
          <StatusBadges status={data.status} example={data.example} />
        </div>
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
