import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MessageSquareText } from 'lucide-react';
import { Prose } from '@/components/content/Prose';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Container } from '@/components/layout/Container';
import {
  ChipList,
  ContactList,
  ListingMetaFooter,
  ListingPreviewNotice,
  SafetyNotice,
  SideCard,
} from '@/components/listings/Detail';
import {
  ExampleBadge,
  FeaturedBadge,
  ListingStatusBadge,
  VerifiedBadge,
} from '@/components/listings/ListingBadges';
import { JobCard, MarketCard } from '@/components/listings/ListingCards';
import { MobileActionBar } from '@/components/listings/MobileActionBar';
import { StandAvatar } from '@/components/listings/StandAvatar';
import { JsonLd } from '@/components/seo/JsonLd';
import { chipClasses } from '@/components/ui/styles';
import { routes } from '@/i18n/routes';
import {
  getHall,
  getJobsByStand,
  getMarketListingsByStand,
  getStand,
  getStands,
} from '@/lib/content';
import { formatDate } from '@/lib/format';
import { isExpired, todayInTurkey } from '@/lib/listings/dates';
import { jobCard, marketCard } from '@/lib/listings/view';
import { pageMetadata } from '@/lib/seo/metadata';
import { slugParams } from '@/lib/static-params';
import { standSchema } from '@/lib/seo/structured-data';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return slugParams(getStands().map((stand) => stand.slug));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const stand = getStand((await params).slug);
  if (!stand) return {};
  return pageMetadata({
    title: stand.seoTitle ?? `${stand.name}: ürün ve hizmetler`,
    description: stand.seoDescription ?? stand.summary,
    path: stand.url,
    noindex: stand.status !== 'published' || stand.example,
    keywords: stand.keywords,
  });
}

export default async function StandPage({ params }: Props) {
  const stand = getStand((await params).slug);
  if (!stand) notFound();

  const halls = stand.halls.map((slug) => getHall(slug)).filter((hall) => hall !== undefined);
  const jobs = getJobsByStand(stand.slug);
  const listings = getMarketListingsByStand(stand.slug);
  const expiredAtBuild = isExpired(stand.expiresAt, todayInTurkey());
  const firstHall = halls[0];

  return (
    <>
      <div className="border-b border-stone-200 bg-white">
        <Container className="py-8 lg:py-10">
          <Breadcrumbs
            items={[
              { name: 'Sanal Fuar', href: routes.fair() },
              ...(firstHall
                ? [{ name: `Salon ${firstHall.code}`, href: routes.hall(firstHall.slug) }]
                : []),
              { name: stand.name, href: stand.url },
            ]}
          />
          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start">
            <StandAvatar name={stand.name} logo={stand.logo} className="h-20 w-20 text-2xl" />
            <div className="min-w-0 max-w-3xl">
              <h1 className="text-3xl leading-tight font-semibold text-graphite-950 sm:text-4xl">
                {stand.name}
              </h1>
              <p className="mt-2 text-graphite-700">
                {stand.city}
                {stand.founded && <>, kuruluş {stand.founded}</>}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <FeaturedBadge featured={stand.featured} />
                <VerifiedBadge checkedAt={stand.verification?.checkedAt} />
                <ListingStatusBadge status={stand.status} />
                <ExampleBadge example={stand.example} />
              </div>
              <p className="mt-4 text-lg leading-8 text-graphite-700">{stand.summary}</p>
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="Salonlar">
                {halls.map((hall) => (
                  <li key={hall.slug}>
                    <Link href={routes.hall(hall.slug)} className={chipClasses()}>
                      Salon {hall.code}: {hall.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <ListingPreviewNotice
                status={stand.status}
                example={stand.example}
                expiredAtBuild={expiredAtBuild}
              />
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-8 lg:py-12">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
          <div className="min-w-0">
            {stand.offerings.length > 0 && (
              <section aria-labelledby="urunler">
                <h2 id="urunler" className="text-2xl font-semibold text-graphite-950">
                  Ürün ve hizmetler
                </h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {stand.offerings.map((offering) => (
                    <li
                      key={offering.name}
                      className="rounded-sm border border-stone-300 bg-white p-4"
                    >
                      <p className="font-semibold text-graphite-950">{offering.name}</p>
                      {offering.description && (
                        <p className="mt-1 text-sm leading-6 text-graphite-600">
                          {offering.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {stand.html && (
              <section aria-labelledby="firma-hakkinda" className="mt-10">
                <h2 id="firma-hakkinda" className="text-2xl font-semibold text-graphite-950">
                  Firma hakkında
                </h2>
                <Prose html={stand.html} className="mt-4" />
              </section>
            )}

            {(stand.brands.length > 0 ||
              stand.certificates.length > 0 ||
              stand.serviceArea.length > 0) && (
              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                {stand.brands.length > 0 && (
                  <section aria-labelledby="markalar">
                    <h2 id="markalar" className="mb-3 text-lg font-semibold text-graphite-950">
                      Temsil edilen markalar
                    </h2>
                    <ChipList items={stand.brands} label="Markalar" />
                  </section>
                )}
                {stand.certificates.length > 0 && (
                  <section aria-labelledby="belgeler">
                    <h2 id="belgeler" className="mb-3 text-lg font-semibold text-graphite-950">
                      Belgeler ve sertifikalar
                    </h2>
                    <ChipList items={stand.certificates} label="Belgeler" />
                  </section>
                )}
                {stand.serviceArea.length > 0 && (
                  <section aria-labelledby="hizmet-bolgesi">
                    <h2
                      id="hizmet-bolgesi"
                      className="mb-3 text-lg font-semibold text-graphite-950"
                    >
                      Hizmet bölgesi
                    </h2>
                    <ChipList items={stand.serviceArea} label="Hizmet bölgesi" />
                  </section>
                )}
              </div>
            )}

            {(listings.length > 0 || jobs.length > 0) && (
              <section aria-labelledby="firma-ilanlari" className="mt-12">
                <h2 id="firma-ilanlari" className="text-2xl font-semibold text-graphite-950">
                  Firmanın ilanları
                </h2>
                <ul className="mt-4 grid gap-4 md:grid-cols-2">
                  {listings.map((listing) => (
                    <li key={listing.slug}>
                      <MarketCard data={marketCard(listing)} />
                    </li>
                  ))}
                  {jobs.map((job) => (
                    <li key={job.slug}>
                      <JobCard data={jobCard(job)} />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <ListingMetaFooter
              refCode={stand.ref}
              postedAt={stand.postedAt}
              updatedAt={stand.updatedAt}
              moderatedAt={stand.moderatedAt}
              expiresAt={stand.expiresAt}
              expiryLabel="Stand geçerliliği"
              title={stand.name}
              path={stand.url}
            />
          </div>

          <aside
            className="mt-10 space-y-5 lg:mt-0"
            aria-label="Firma iletişim ve doğrulama bilgileri"
          >
            <SideCard title="İletişim" id="iletisim">
              <ContactList
                items={{
                  website: stand.website,
                  email: stand.email,
                  phone: stand.phone,
                  address: stand.address,
                }}
                emailSubject={`Maden360 Sanal Fuar: ${stand.name}`}
              />
            </SideCard>
            <section
              aria-labelledby="dogrulama"
              className="rounded-sm border border-stone-300 bg-white p-5 text-sm"
            >
              <h2 id="dogrulama" className="text-lg font-semibold text-graphite-950">
                Doğrulama
              </h2>
              {stand.verification ? (
                <p className="mt-2 leading-6 text-graphite-700">
                  {stand.verification.method} Son kontrol:{' '}
                  {formatDate(stand.verification.checkedAt)}.
                </p>
              ) : (
                <p className="mt-2 leading-6 text-graphite-700">
                  Firma bilgileri henüz editör tarafından doğrulanmadı.
                </p>
              )}
            </section>
            <SafetyNotice variant="stand" />
          </aside>
        </div>
      </Container>

      {(stand.website || stand.email || stand.phone) && (
        <MobileActionBar href="#iletisim" label="Firmayla iletişime geç" icon={MessageSquareText} />
      )}

      {stand.status === 'published' && !stand.example && <JsonLd data={standSchema(stand)} />}
    </>
  );
}
