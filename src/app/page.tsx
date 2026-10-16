import Link from 'next/link';
import {
  ArrowRight,
  Briefcase,
  CalendarClock,
  ClipboardCheck,
  Plus,
  ShieldCheck,
  Store,
  Tent,
} from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { SearchForm } from '@/components/search/SearchForm';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { siteConfig } from '@/config/site';
import { optionalPageFiles, routes } from '@/i18n/routes';
import {
  getCandidates,
  getHalls,
  getJobs,
  getMarketCategories,
  getMarketListings,
  getOptionalPage,
  getStands,
} from '@/lib/content';
import { formatPrice } from '@/lib/listings/format';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata({
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  path: routes.home(),
  absoluteTitle: true,
});

const steps = [
  {
    title: 'Başvuru formunu doldurun',
    text: 'Üyelik gerekmez. Fuar standı, iş ilanı, aday profili veya market ilanı için formu doldurup gönderin.',
  },
  {
    title: 'Editör kontrol eder',
    text: 'Başvurunuz ilan kurallarına göre kontrol edilir; gerekirse sizden ek bilgi veya belge istenir.',
  },
  {
    title: 'İlan yayımlanır',
    text: 'İş ilanı ve aday profili en fazla 60 gün, market ilanı 90 gün, fuar standı 1 yıl yayında kalır; süresi dolan ilan kendiliğinden kalkar.',
  },
];

const principles = [
  {
    icon: ClipboardCheck,
    title: 'Her ilan editör onayından geçer',
    text: 'Yanıltıcı, mevzuata aykırı veya eksik bilgili ilanlar yayımlanmaz. Patlayıcı madde alım-satım ilanları kabul edilmez; ruhsat ve rödövans ilanlarında yasal notlar gösterilir.',
  },
  {
    icon: ShieldCheck,
    title: 'Adayların kişisel verileri korunur',
    text: 'Aday profillerinde ad ve iletişim bilgisi yayımlanmaz; işverenlerin talepleri editörler aracılığıyla iletilir. Aday profilleri arama motorlarında dizinlenmez.',
  },
  {
    icon: CalendarClock,
    title: 'Güncel ilanlar',
    text: 'Her ilanın bir yayın süresi vardır. Süresi dolan ilan listelerden ve aramadan kalkar; süreyi uzatmak için başvuru numarasıyla yeniden başvurulabilir.',
  },
];

export default function HomePage() {
  const stands = getStands();
  const jobs = getJobs();
  const candidates = getCandidates();
  const marketListings = getMarketListings();
  const halls = getHalls();
  const marketCategories = getMarketCategories();
  const hasListings = stands.length + jobs.length + marketListings.length > 0;
  const rulesPublished = Boolean(getOptionalPage(optionalPageFiles.listingRules));

  const sectionCards = [
    {
      icon: Tent,
      title: 'Sanal Fuar',
      href: routes.fair(),
      linkLabel: 'Fuarı gezin',
      description:
        'İş makinesi, kırma-eleme, sondaj, İSG, laboratuvar ve mühendislik firmalarının ürün, hizmet ve iletişim bilgileri.',
      count: stands.length > 0 ? `${stands.length} stand` : 'İlk standlar bekleniyor',
      latest: stands
        .slice(0, 3)
        .map((stand) => ({ href: stand.url, title: stand.name, meta: stand.city })),
    },
    {
      icon: Briefcase,
      title: 'İş İlanları',
      href: routes.jobs(),
      linkLabel: 'İlanlara göz atın',
      description:
        'İşçi arayan işverenler ve iş arayan mühendis, tekniker, operatör ve saha çalışanları.',
      count:
        jobs.length + candidates.length > 0
          ? `${jobs.length} iş ilanı · ${candidates.length} aday profili`
          : 'İlk ilanlar bekleniyor',
      latest: jobs.slice(0, 3).map((job) => ({ href: job.url, title: job.title, meta: job.city })),
    },
    {
      icon: Store,
      title: 'Market',
      href: routes.market(),
      linkLabel: "Market'e gidin",
      description:
        'Satılık ve kiralık ekipman, yedek parça, hizmetler, cevher ve ürün, saha ve rödövans ilanları.',
      count: marketListings.length > 0 ? `${marketListings.length} ilan` : 'İlk ilanlar bekleniyor',
      latest: marketListings.slice(0, 3).map((listing) => ({
        href: listing.url,
        title: listing.title,
        meta: formatPrice(listing.price),
      })),
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="contour-bg relative overflow-hidden bg-graphite-900 text-white">
        <Container className="relative py-14 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-copper-400">
            Türkiye madencilik sektör ağı
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {siteConfig.tagline}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-graphite-200">
            Tedarikçi ve hizmet firmalarının standları, işçi ve iş arayanlar; ekipman, yedek parça,
            hizmet, cevher ve saha ilanları tek yerde. Üyelik gerekmez; her başvuru editör onayından
            geçer.
          </p>
          <div className="mt-8 max-w-2xl">
            <SearchForm variant="hero" id="hero-search" />
            {hasListings && (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                <span className="text-graphite-300">Sık arananlar:</span>
                {siteConfig.popularSearches.map((term) => (
                  <Link
                    key={term}
                    href={routes.search(term)}
                    className="inline-flex min-h-9 items-center rounded-full border border-graphite-600 px-3 text-graphite-100 hover:border-copper-400 hover:text-white"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            )}
            <Link
              href={routes.postListing()}
              className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-md border border-graphite-500 px-4 font-semibold text-white hover:border-copper-400 hover:bg-graphite-800"
            >
              <Plus aria-hidden="true" className="h-4 w-4 text-copper-400" />
              Stand açın veya ilan verin
            </Link>
          </div>
        </Container>
      </section>

      {/* Bölümler: fuar, iş ilanları, market */}
      <Container className="py-14">
        <section aria-labelledby="bolumler">
          <SectionHeading
            id="bolumler"
            title="Fuar, iş ve market"
            description="Madencilik sektörünün tedarikçileri, işverenleri ve çalışanları için üç bölüm."
          />
          <ul className="mt-6 grid gap-4 lg:grid-cols-3">
            {sectionCards.map(({ icon: Icon, ...card }) => (
              <li
                key={card.href}
                className="flex flex-col rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-graphite-900 text-copper-400">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <h3 className="text-lg font-semibold text-graphite-950">
                    <Link href={card.href} className="hover:text-copper-800 hover:underline">
                      {card.title}
                    </Link>
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-graphite-600">{card.description}</p>
                <p className="mt-3 text-sm font-semibold text-copper-700">{card.count}</p>
                {card.latest.length > 0 && (
                  <ul className="mt-3 divide-y divide-stone-200 rounded-lg border border-stone-200 bg-stone-50">
                    {card.latest.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="flex min-h-11 items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-copper-50"
                        >
                          <span className="line-clamp-1 font-medium text-graphite-900">
                            {item.title}
                          </span>
                          <span className="shrink-0 text-xs text-graphite-500">{item.meta}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  href={card.href}
                  className="mt-auto inline-flex min-h-11 items-center gap-1 pt-4 text-sm font-semibold text-copper-700 hover:underline"
                >
                  {card.linkLabel} <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </Container>

      {/* Market kategorileri */}
      <section aria-labelledby="market-kategorileri" className="border-y border-stone-200 bg-white">
        <Container className="py-14">
          <SectionHeading
            id="market-kategorileri"
            title="Market kategorileri"
            description="Ekipmandan sahaya, ilanları kategoriye göre inceleyin."
            href={routes.market()}
            linkLabel="Tüm market ilanları"
          />
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {marketCategories.map((category) => {
              const count = marketListings.filter(
                (listing) => listing.category === category.slug,
              ).length;
              return (
                <li key={category.slug}>
                  <Link
                    href={routes.marketCategory(category.slug)}
                    className="flex h-full min-h-16 items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4 hover:border-copper-300 hover:bg-white"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-graphite-900 text-copper-400">
                      <CategoryIcon icon={category.icon} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold leading-5 text-graphite-950">
                        {category.name}
                      </span>
                      <span className="block text-xs text-graphite-500">
                        {count > 0 ? `${count} ilan` : 'İlan bekleniyor'}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      {/* Fuar salonları */}
      <Container className="py-14">
        <section aria-labelledby="fuar-salonlari">
          <SectionHeading
            id="fuar-salonlari"
            title="Fuar salonları"
            description="Firmalar faaliyet alanlarına göre salonlarda yer alır."
            href={routes.fair()}
            linkLabel="Fuarı gezin"
          />
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {halls.map((hall) => {
              const count = stands.filter((stand) => stand.halls.includes(hall.slug)).length;
              return (
                <li key={hall.slug}>
                  <Link
                    href={routes.hall(hall.slug)}
                    className="flex h-full min-h-16 items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 hover:border-copper-300"
                  >
                    <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-graphite-900 text-copper-400">
                      <CategoryIcon icon={hall.icon} className="h-4 w-4" />
                      <span className="text-[0.65rem] font-bold leading-none text-graphite-200">
                        {hall.code}
                      </span>
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold leading-5 text-graphite-950">
                        <span className="sr-only">Salon {hall.code}: </span>
                        {hall.name}
                      </span>
                      <span className="block text-xs text-graphite-500">
                        {count > 0 ? `${count} stand` : 'Stand bekleniyor'}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </Container>

      {/* Güven ilkeleri */}
      <section aria-labelledby="ilkeler" className="bg-graphite-950 text-white">
        <Container className="py-14">
          <h2 id="ilkeler" className="text-2xl font-bold tracking-tight">
            Güven ilkelerimiz
          </h2>
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {principles.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-xl border border-graphite-800 bg-graphite-900 p-6">
                <Icon aria-hidden="true" className="h-6 w-6 text-copper-400" />
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-graphite-300">{text}</p>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {rulesPublished && (
              <Link
                href={routes.listingRules()}
                className="inline-flex min-h-11 items-center gap-1 font-semibold text-copper-400 hover:underline"
              >
                İlan kuralları <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            )}
            <Link
              href={routes.about()}
              className="inline-flex min-h-11 items-center gap-1 font-semibold text-copper-400 hover:underline"
            >
              Hakkımızda <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </section>
      {/* Nasıl çalışır? */}
      <section aria-labelledby="nasil-calisir" className="border-y border-stone-200 bg-white">
        <Container className="py-14">
          <SectionHeading
            id="nasil-calisir"
            title="Nasıl ilan verilir?"
            description="Fuar standı, iş ilanı, aday profili ve market ilanları aynı yoldan yayımlanır."
          />
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="rounded-xl border border-stone-200 bg-stone-50 p-5">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-copper-600 font-bold text-white"
                >
                  {index + 1}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-graphite-950">{step.title}</h3>
                <p className="mt-1 text-sm leading-6 text-graphite-600">{step.text}</p>
              </li>
            ))}
          </ol>
          <Link
            href={routes.postListing()}
            className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-md bg-copper-600 px-5 font-semibold text-white hover:bg-copper-700"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            İlan ver
          </Link>
        </Container>
      </section>
    </>
  );
}
