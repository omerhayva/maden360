import Link from 'next/link';
import { Suspense } from 'react';
import { Mail, Plus } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { SafetyNotice } from '@/components/listings/Detail';
import { ListingBrowser, StaticListingGrid } from '@/components/listings/ListingBrowser';
import { HeaderActions, SubmissionsClosedNote } from '@/components/listings/SectionNav';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { routes } from '@/i18n/routes';
import {
  areSubmissionsOpen,
  getMarketCategories,
  getMarketCategory,
  getMarketListings,
  getMarketListingsByCategory,
} from '@/lib/content';
import { isPreviewMode } from '@/lib/content/visibility';
import { marketTypeLabels, type MarketType } from '@/lib/listings/options';
import { facetFilter, marketItem } from '@/lib/listings/view';
import { pageMetadata } from '@/lib/seo/metadata';

const title = 'Market';
const description =
  'Satılık ve kiralık iş makineleri, tesis ekipmanı ve yedek parça. Sondaj ve nakliye gibi hizmetler, cevher alım satımı, ruhsat ve rödövans ilanları.';

export const metadata = pageMetadata({
  title: 'Market: madencilik ekipmanı, hizmet, cevher ve saha ilanları',
  description:
    'Satılık ve kiralık iş makineleri, kırma-eleme tesisleri, yedek parça, sondaj hizmetleri, cevher alım satımı, ruhsat ve rödövans ilanları.',
  path: routes.market(),
});

export default function MarketPage() {
  const categories = getMarketCategories();
  const items = getMarketListings().map(marketItem);
  const open = areSubmissionsOpen();
  const filters = [
    facetFilter(items, {
      id: 'kategori',
      label: 'Kategori',
      allLabel: 'Tüm kategoriler',
      sort: false,
      labelFor: (slug) => getMarketCategory(slug)?.name ?? slug,
    }),
    facetFilter(items, {
      id: 'tur',
      label: 'İlan türü',
      allLabel: 'Tümü',
      sort: false,
      labelFor: (value) => marketTypeLabels[value as MarketType] ?? value,
    }),
    facetFilter(items, { id: 'il', label: 'İl', allLabel: 'Tüm iller' }),
  ];
  const empty = (
    <EmptyState
      title="Şu an yayında market ilanı yok"
      actions={
        open ? (
          <ButtonLink href={routes.postListing('market-ilani')} variant="secondary" icon={Plus}>
            İlk ilanı siz verin
          </ButtonLink>
        ) : (
          <ButtonLink href={routes.contact()} variant="secondary" icon={Mail}>
            Bize ulaşın
          </ButtonLink>
        )
      }
    >
      {open
        ? 'Satmak, kiralamak veya aramak istediğiniz ekipman, parça, hizmet ya da saha mı var? İlk ilanı siz verin.'
        : 'Market ilanı başvuruları yakında açılacak.'}
    </EmptyState>
  );

  return (
    <>
      <PageHeader
        photo="market"
        title={title}
        description={description}
        breadcrumbs={[{ name: title, href: routes.market() }]}
      >
        {open ? (
          <HeaderActions
            primary={{ href: routes.postListing('market-ilani'), label: 'Market ilanı ver' }}
          />
        ) : (
          <SubmissionsClosedNote />
        )}
      </PageHeader>

      <Container className="space-y-10 py-8 lg:py-10">
        <section aria-labelledby="ilanlar">
          <h2 id="ilanlar" className="sr-only">
            Market ilanları
          </h2>
          <Suspense fallback={<StaticListingGrid items={items} empty={empty} />}>
            <ListingBrowser
              items={items}
              filters={filters}
              searchLabel="Ürün, marka veya hizmet ara"
              searchPlaceholder="Ör. ekskavatör, krom"
              noun="ilan"
              showExpired={isPreviewMode()}
              empty={empty}
            />
          </Suspense>
        </section>

        <section aria-labelledby="kategoriler">
          <SectionHeading id="kategoriler" title="Kategoriler" />
          <ul className="mt-4 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const count = getMarketListingsByCategory(category.slug).length;
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
        </section>

        <SafetyNotice variant="market" />
      </Container>
    </>
  );
}
