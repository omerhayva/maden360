import Link from 'next/link';
import type { ReactNode } from 'react';
import { Mail } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { FairPlan } from '@/components/listings/FairPlan';
import { JobCard, MarketCard } from '@/components/listings/ListingCards';
import { SearchForm } from '@/components/search/SearchForm';
import { ButtonLink } from '@/components/ui/Button';
import { listPanel, panel } from '@/components/ui/card';
import { Photo } from '@/components/ui/Photo';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { photoFillClasses, photoScrimClasses } from '@/components/ui/styles';
import { TextLink } from '@/components/ui/TextLink';
import { siteConfig } from '@/config/site';
import { routes } from '@/i18n/routes';
import {
  areSubmissionsOpen,
  getCandidates,
  getHalls,
  getJobs,
  getMarketCategories,
  getMarketListings,
  getStands,
} from '@/lib/content';
import { jobCard, locationOf, marketCard } from '@/lib/listings/view';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata({
  title: `${siteConfig.name} | ${siteConfig.tagline}`,
  description: siteConfig.description,
  path: routes.home(),
  absoluteTitle: true,
});

/** Sayı sıfırsa metin gösterilmez (boş bölümler "bekleniyor" yazılarıyla doldurulmaz). */
function countLabel(count: number, noun: string): string | undefined {
  return count > 0 ? `${count} ${noun}` : undefined;
}

/** Yan sütundaki kısa liste satırı: başlık ve tek satır bilgi */
function CompactRow({ href, title, meta }: { href: string; title: string; meta: string }) {
  return (
    <li>
      <Link
        href={href}
        className="group block px-4 py-3 transition-colors duration-100 ui-hover:bg-stone-50 ui-active:bg-stone-100"
      >
        <span className="block leading-snug font-semibold text-graphite-950 underline-offset-4 group-hover:underline">
          {title}
        </span>
        <span className="mt-0.5 block text-sm text-graphite-600">{meta}</span>
      </Link>
    </li>
  );
}

/** Boş bölüm: tek satırlık sade not */
function EmptyNote({ children }: { children: ReactNode }) {
  return <p className={`${panel} px-4 py-4 text-sm leading-6 text-graphite-700`}>{children}</p>;
}

export default function HomePage() {
  const stands = getStands();
  const jobs = getJobs();
  const candidates = getCandidates();
  const marketListings = getMarketListings();
  const halls = getHalls();
  const marketCategories = getMarketCategories();
  const open = areSubmissionsOpen();
  const hasListings = stands.length + jobs.length + marketListings.length > 0;

  const intents = [
    { href: routes.jobs(), label: 'İş arıyorum', detail: countLabel(jobs.length, 'iş ilanı') },
    {
      href: routes.candidates(),
      label: 'Eleman arıyorum',
      detail: countLabel(candidates.length, 'iş arayan'),
    },
    {
      href: routes.market(),
      label: 'Makine veya parça arıyorum',
      detail: countLabel(marketListings.length, 'market ilanı'),
    },
    {
      href: routes.fair(),
      label: 'Tedarikçi arıyorum',
      detail: countLabel(stands.length, 'firma'),
    },
  ];

  const hallCounts = Object.fromEntries(
    halls.map((hall) => [
      hall.slug,
      stands.filter((stand) => stand.halls.includes(hall.slug)).length,
    ]),
  );

  return (
    <>
      {/* Giriş: fotoğraf + koyu katman (metin renkleri photos.test.ts ile denetlenir) */}
      <section
        aria-labelledby="giris-baslik"
        className="photo-header relative isolate overflow-hidden bg-graphite-950 text-white"
      >
        <Photo name="ana-sayfa" priority className={photoFillClasses} />
        <div aria-hidden="true" className={photoScrimClasses} />
        <Container className="py-8 sm:py-12 lg:py-14">
          <h1
            id="giris-baslik"
            className="max-w-3xl text-3xl leading-tight font-semibold sm:text-4xl lg:text-[2.75rem]"
          >
            Madencilik sektörünün ilan panosu
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-graphite-100 sm:text-lg sm:leading-8">
            Eleman arayan ocaklar, iş arayan operatör ve mühendisler, makine ve parça satanlar için
            ücretsiz ilan sitesi. Her ilanı yayından önce bir editör okur.
          </p>
          <div className="mt-6 max-w-2xl">
            <SearchForm variant="hero" id="hero-search" />
            {hasListings && (
              <p className="mt-3 text-sm leading-6 text-graphite-200">
                Sık arananlar:{' '}
                {siteConfig.popularSearches.map((term, index) => (
                  <span key={term}>
                    {index > 0 && ', '}
                    <Link
                      href={routes.search(term)}
                      className="text-white underline decoration-white/40 underline-offset-4 ui-hover:decoration-white"
                    >
                      {term}
                    </Link>
                  </span>
                ))}
              </p>
            )}
          </div>
        </Container>
      </section>

      {/* Ne arıyorsunuz? Ziyaretçinin amacına göre dört giriş */}
      <nav aria-label="Ne arıyorsunuz?" className="border-b border-stone-300 bg-white">
        <Container>
          <ul className="-mx-4 grid grid-cols-2 sm:mx-0 lg:grid-cols-4">
            {intents.map((intent, index) => (
              <li
                key={intent.href}
                className={`border-stone-200 ${index % 2 === 1 ? 'border-l' : ''} ${index > 1 ? 'border-t lg:border-t-0' : ''} ${index === 2 ? 'lg:border-l' : ''}`}
              >
                <Link
                  href={intent.href}
                  className="group flex h-full min-h-18 flex-col justify-center px-4 py-3 transition-colors duration-100 sm:px-5 ui-hover:bg-stone-50 ui-active:bg-stone-100"
                >
                  <span className="leading-snug font-semibold text-graphite-950 underline-offset-4 group-hover:underline">
                    {intent.label}
                  </span>
                  {intent.detail && (
                    <span className="mt-0.5 text-sm text-graphite-600 tabular-nums">
                      {intent.detail}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </nav>

      <Container className="grid gap-10 py-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-12">
        <div className="min-w-0 space-y-10">
          <section aria-labelledby="son-is-ilanlari">
            <SectionHeading
              id="son-is-ilanlari"
              title="Son iş ilanları"
              href={jobs.length > 0 ? routes.jobs() : undefined}
              linkLabel={`Tüm iş ilanları (${jobs.length})`}
            />
            {jobs.length > 0 ? (
              <ul className={`mt-3 ${listPanel}`}>
                {jobs.slice(0, 5).map((job) => (
                  <li key={job.url}>
                    <JobCard data={jobCard(job)} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-3">
                <EmptyNote>
                  Henüz yayında iş ilanı yok. İlk ilanlar editör onayından sonra burada görünecek.
                </EmptyNote>
              </div>
            )}
          </section>

          <section aria-labelledby="son-market-ilanlari">
            <SectionHeading
              id="son-market-ilanlari"
              title="Market'te son ilanlar"
              href={marketListings.length > 0 ? routes.market() : undefined}
              linkLabel={`Tüm market ilanları (${marketListings.length})`}
            />
            {marketListings.length > 0 ? (
              <ul className={`mt-3 ${listPanel}`}>
                {marketListings.slice(0, 5).map((listing) => (
                  <li key={listing.url}>
                    <MarketCard data={marketCard(listing)} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-3">
                <EmptyNote>
                  Henüz yayında market ilanı yok. Satılık ve kiralık makine, parça, hizmet, cevher
                  ve saha ilanları burada listelenecek.
                </EmptyNote>
              </div>
            )}
          </section>
        </div>

        <div className="min-w-0 space-y-10">
          <section aria-labelledby="ilan-ver-kutusu" className={`${panel} p-5`}>
            <h2
              id="ilan-ver-kutusu"
              className="text-xl leading-tight font-semibold text-graphite-950"
            >
              {open ? 'İlan vermek ücretsiz' : 'İlan verme yakında açılıyor'}
            </h2>
            {open ? (
              <>
                <p className="mt-2 text-sm leading-6 text-graphite-700">
                  Üyelik gerekmez. Formu doldurun, editör okuyup yayımlasın. İş ilanları ve aday
                  profilleri en fazla 60 gün, market ilanları 90 gün, fuar standları bir yıl yayında
                  kalır.
                </p>
                <ButtonLink href={routes.postListing()} width="full" className="mt-4">
                  İlan ver
                </ButtonLink>
                <p className="mt-3 text-sm leading-6 text-graphite-700">
                  Doğrudan forma gidin:{' '}
                  {[
                    { href: routes.postListing('is-ilani'), label: 'iş ilanı' },
                    { href: routes.postListing('aday-profili'), label: 'aday profili' },
                    { href: routes.postListing('market-ilani'), label: 'market ilanı' },
                    { href: routes.postListing('fuar-standi'), label: 'fuar standı' },
                  ].map((form, index) => (
                    <span key={form.href}>
                      {index > 0 && ', '}
                      <Link
                        href={form.href}
                        className="font-medium text-copper-700 underline underline-offset-4 ui-hover:text-copper-900"
                      >
                        {form.label}
                      </Link>
                    </span>
                  ))}
                  .
                </p>
              </>
            ) : (
              <>
                <p className="mt-2 text-sm leading-6 text-graphite-700">
                  Başvuru formları, ilan kuralları ve KVKK aydınlatma metni yayımlanınca açılacak.
                  Sorularınız için bize yazabilirsiniz.
                </p>
                <ButtonLink
                  href={routes.contact()}
                  variant="secondary"
                  width="full"
                  icon={Mail}
                  className="mt-4"
                >
                  Bize yazın
                </ButtonLink>
              </>
            )}
          </section>

          <section aria-labelledby="is-arayanlar">
            <SectionHeading
              id="is-arayanlar"
              as="h2"
              title="İş arayanlar"
              href={candidates.length > 0 ? routes.candidates() : undefined}
              linkLabel={`Tümü (${candidates.length})`}
            />
            {candidates.length > 0 ? (
              <ul className={`mt-3 ${listPanel}`}>
                {candidates.slice(0, 3).map((candidate) => (
                  <CompactRow
                    key={candidate.url}
                    href={candidate.url}
                    title={candidate.headline}
                    meta={[
                      candidate.experienceYears > 0
                        ? `${candidate.experienceYears} yıl deneyim`
                        : 'Deneyimsiz',
                      candidate.preferredCities.slice(0, 2).join(', '),
                    ].join(', ')}
                  />
                ))}
              </ul>
            ) : (
              <div className="mt-3">
                <EmptyNote>Henüz yayında aday profili yok.</EmptyNote>
              </div>
            )}
          </section>

          <section aria-labelledby="fuardaki-firmalar">
            <SectionHeading
              id="fuardaki-firmalar"
              title="Fuardaki firmalar"
              href={stands.length > 0 ? routes.fair() : undefined}
              linkLabel={`Tümü (${stands.length})`}
            />
            {stands.length > 0 ? (
              <ul className={`mt-3 ${listPanel}`}>
                {stands.slice(0, 4).map((stand) => (
                  <CompactRow
                    key={stand.url}
                    href={stand.url}
                    title={stand.name}
                    meta={[
                      locationOf(stand),
                      stand.halls
                        .map((slug) => halls.find((hall) => hall.slug === slug)?.code)
                        .filter(Boolean)
                        .map((code) => `Salon ${code}`)
                        .join(', '),
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  />
                ))}
              </ul>
            ) : (
              <div className="mt-3">
                <EmptyNote>Henüz stand açan firma yok.</EmptyNote>
              </div>
            )}
          </section>
        </div>
      </Container>

      <section aria-labelledby="salon-plani" className="border-t border-stone-300 bg-white">
        <Container className="py-10">
          <SectionHeading
            id="salon-plani"
            title="Sanal Fuar salon planı"
            description="Tedarikçi ve hizmet firmaları faaliyet alanlarına göre salonlarda yer alır."
          />
          <div className="mt-5">
            <FairPlan
              halls={halls}
              counts={hallCounts}
              extra={
                <>
                  <span className="font-semibold text-graphite-950">Fuaye</span>
                  <TextLink href={routes.fair()} className="-my-2">
                    {stands.length > 0 ? `Tüm firmalar (${stands.length})` : 'Fuar sayfası'}
                  </TextLink>
                </>
              }
            />
          </div>
        </Container>
      </section>

      <section aria-labelledby="market-kategorileri" className="border-t border-stone-300">
        <Container className="py-10">
          <SectionHeading id="market-kategorileri" title="Market kategorileri" />
          <ul className="mt-4 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {marketCategories.map((category) => {
              const count = marketListings.filter(
                (listing) => listing.category === category.slug,
              ).length;
              return (
                <li key={category.slug} className="border-b border-stone-300">
                  <Link
                    href={routes.marketCategory(category.slug)}
                    className="group flex min-h-12 items-baseline justify-between gap-3 py-3"
                  >
                    <span className="font-medium text-graphite-950 underline-offset-4 group-hover:underline">
                      {category.name}
                    </span>
                    {count > 0 && (
                      <span className="text-sm text-graphite-600 tabular-nums">{count}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>
    </>
  );
}
