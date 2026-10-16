import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, MessageSquareText } from 'lucide-react';
import { Prose } from '@/components/content/Prose';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Container } from '@/components/layout/Container';
import {
  ContactList,
  FactList,
  ListingMetaFooter,
  ListingPreviewNotice,
  NoticeBox,
  RelayContact,
  SafetyNotice,
  SideCard,
  type Fact,
} from '@/components/listings/Detail';
import {
  ExampleBadge,
  ListingStatusBadge,
  MarketTypeBadge,
} from '@/components/listings/ListingBadges';
import { MobileActionBar } from '@/components/listings/MobileActionBar';
import { Callout } from '@/components/ui/Callout';
import { routes } from '@/i18n/routes';
import {
  getMarketCategory,
  getMarketListing,
  getMarketListings,
  getStand,
  type MarketListing,
} from '@/lib/content';
import { isExpired, todayInTurkey } from '@/lib/listings/dates';
import { formatPrice, formatQuantity } from '@/lib/listings/format';
import {
  analysisBasisLabels,
  conditionLabels,
  licenseKindLabels,
  licenseOfferLabels,
  reserveBasisLabels,
  sellerKindLabels,
} from '@/lib/listings/options';
import { locationOf } from '@/lib/listings/view';
import { pageMetadata } from '@/lib/seo/metadata';
import { slugParams } from '@/lib/static-params';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return slugParams(getMarketListings().map((listing) => listing.slug));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = getMarketListing((await params).slug);
  if (!listing) return {};
  return pageMetadata({
    title: listing.seoTitle ?? `${listing.title} — ${listing.city}`,
    description: listing.seoDescription ?? listing.summary,
    path: listing.url,
    noindex: listing.status !== 'published' || listing.example,
    keywords: listing.keywords,
  });
}

const number = (value: number) => new Intl.NumberFormat('tr-TR').format(value);

function factsFor(listing: MarketListing): Fact[] {
  const facts: Fact[] = [];
  if (listing.ore) {
    facts.push(
      { label: 'Cevher / ürün', value: listing.ore.mineral },
      { label: 'Tenör / kalite', value: listing.ore.grade },
      { label: 'Tenör bilgisinin dayanağı', value: analysisBasisLabels[listing.ore.analysis] },
      { label: 'Teslim şekli', value: listing.ore.delivery },
    );
  }
  if (listing.license) {
    facts.push(
      { label: 'Maden grubu', value: `${listing.license.group} Grubu` },
      { label: 'Ruhsat türü', value: licenseKindLabels[listing.license.kind] },
      { label: 'Teklif', value: licenseOfferLabels[listing.license.offer] },
      {
        label: 'Ruhsat alanı',
        value: listing.license.areaHectares
          ? `${number(listing.license.areaHectares)} hektar`
          : undefined,
      },
      { label: 'Rezerv bilgisinin dayanağı', value: reserveBasisLabels[listing.license.reserve] },
    );
  }
  facts.push(
    {
      label: 'Miktar',
      value: listing.quantity
        ? formatQuantity(listing.quantity.value, listing.quantity.unit)
        : undefined,
    },
    { label: 'Marka', value: listing.brand },
    { label: 'Model', value: listing.model },
    { label: 'Model yılı', value: listing.year ? String(listing.year) : undefined },
    {
      label: 'Çalışma saati',
      value: listing.hours !== undefined ? `${number(listing.hours)} saat` : undefined,
    },
    { label: 'Durum', value: listing.condition ? conditionLabels[listing.condition] : undefined },
    ...listing.specs.map((spec) => ({ label: spec.label, value: spec.value })),
  );
  return facts;
}

export default async function MarketListingPage({ params }: Props) {
  const listing = getMarketListing((await params).slug);
  if (!listing) notFound();

  const category = getMarketCategory(listing.category);
  const stand = getStand(listing.seller.stand);
  const expiredAtBuild = isExpired(listing.expiresAt, todayInTurkey());
  const unverifiedGrade =
    listing.ore && (listing.ore.analysis === 'beyan' || listing.ore.analysis === 'yok');

  return (
    <>
      <div className="border-b border-stone-200 bg-white">
        <Container className="py-8 lg:py-10">
          <Breadcrumbs
            items={[
              { name: 'Market', href: routes.market() },
              ...(category
                ? [{ name: category.name, href: routes.marketCategory(category.slug) }]
                : []),
              { name: listing.title, href: listing.url },
            ]}
          />
          <div className="mt-5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <MarketTypeBadge type={listing.type} />
              {category && (
                <Link
                  href={routes.marketCategory(category.slug)}
                  className="text-sm font-semibold uppercase tracking-wide text-copper-700 underline-offset-4 ui-hover:text-copper-800 ui-hover:underline"
                >
                  {category.name}
                </Link>
              )}
              <ListingStatusBadge status={listing.status} />
              <ExampleBadge example={listing.example} />
            </div>
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-graphite-950 sm:text-4xl">
              {listing.title}
            </h1>
            <p className="mt-3 text-2xl font-bold text-graphite-950">
              {formatPrice(listing.price)}
              {listing.price?.negotiable && (
                <span className="ml-2 align-middle text-sm font-medium text-graphite-600">
                  Pazarlık payı var
                </span>
              )}
            </p>
            <p className="mt-2 inline-flex items-center gap-1 text-graphite-700">
              <MapPin aria-hidden="true" className="h-4 w-4 text-copper-600" />
              {locationOf(listing)}
            </p>
            <ListingPreviewNotice
              status={listing.status}
              example={listing.example}
              expiredAtBuild={expiredAtBuild}
            />
          </div>
        </Container>
      </div>

      <Container className="py-8 lg:py-12">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
          <div className="min-w-0 space-y-8">
            {listing.images.length > 0 && (
              <ul className="grid gap-3 sm:grid-cols-2" aria-label="İlan görselleri">
                {listing.images.map((image, index) => (
                  <li
                    key={image.src}
                    className={
                      index === 0 && listing.images.length % 2 === 1 ? 'sm:col-span-2' : ''
                    }
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- statik dışa aktarım */}
                    <img
                      src={image.src}
                      alt={image.alt}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      className="aspect-[16/10] w-full rounded-xl border border-stone-200 object-cover"
                    />
                  </li>
                ))}
              </ul>
            )}

            <FactList facts={factsFor(listing)} />

            {unverifiedGrade && (
              <Callout variant="warning" title="Tenör bilgisi analizle doğrulanmamış">
                Bu ilandaki tenör/kalite bilgisi{' '}
                {listing.ore?.analysis === 'beyan'
                  ? 'ilan sahibinin beyanıdır'
                  : 'bir analize dayanmıyor'}
                . Satın almadan önce temsilî numune alarak akredite bir laboratuvarda analiz
                yaptırın.
              </Callout>
            )}

            <section aria-labelledby="aciklama">
              <h2 id="aciklama" className="text-2xl font-bold tracking-tight text-graphite-950">
                Açıklama
              </h2>
              <Prose html={listing.html} className="mt-4" />
            </section>

            {category?.notice && (
              <NoticeBox
                title={category.notice.title}
                text={category.notice.text}
                references={category.notice.references}
              />
            )}

            <ListingMetaFooter
              refCode={listing.ref}
              postedAt={listing.postedAt}
              updatedAt={listing.updatedAt}
              moderatedAt={listing.moderatedAt}
              expiresAt={listing.expiresAt}
              expiryLabel="Yayın bitişi"
              title={listing.title}
              path={listing.url}
            />
          </div>

          <aside className="mt-10 space-y-5 lg:mt-0" aria-label="Satıcı ve iletişim">
            <SideCard title="Satıcı" id="satici">
              <p className="font-semibold text-graphite-950">
                {stand ? (
                  <Link
                    href={stand.url}
                    className="text-copper-700 underline-offset-4 ui-hover:text-copper-800 ui-hover:underline"
                  >
                    {listing.seller.name}
                  </Link>
                ) : (
                  listing.seller.name
                )}
              </p>
              <p className="text-sm text-graphite-600">
                {sellerKindLabels[listing.seller.kind]}
                {stand ? ' · Sanal fuarda standı var' : ''}
              </p>
              <div className="mt-4">
                {listing.contact.mode === 'dogrudan' ? (
                  <ContactList
                    items={{
                      phone: listing.contact.phone,
                      email: listing.contact.email,
                      website: listing.contact.website,
                    }}
                    emailSubject={`Maden360 ilanı: ${listing.title}${listing.ref ? ` (${listing.ref})` : ''}`}
                  />
                ) : (
                  <>
                    <RelayContact
                      refCode={listing.ref}
                      description="Satıcının iletişim bilgileri gizlidir. Talebinizi editörlerimiz satıcıya iletir."
                    />
                    {listing.contact.website && (
                      <div className="mt-3">
                        <ContactList items={{ website: listing.contact.website }} />
                      </div>
                    )}
                  </>
                )}
              </div>
            </SideCard>
            <SafetyNotice variant="market" />
          </aside>
        </div>
      </Container>

      <MobileActionBar href="#satici" label="Satıcıyla iletişime geç" icon={MessageSquareText} />
    </>
  );
}
