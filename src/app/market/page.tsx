import Link from 'next/link';
import { Suspense } from 'react';
import { Mail, Plus, Store } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { SafetyNotice } from '@/components/listings/Detail';
import { ListingBrowser, StaticListingGrid } from '@/components/listings/ListingBrowser';
import { HeaderActions, SubmissionsClosedNote } from '@/components/listings/SectionNav';
import { ButtonLink } from '@/components/ui/Button';
import { iconTile, tileLink } from '@/components/ui/card';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
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
  'Madencilik ekipmanı, yedek parça, hizmet, cevher ve saha ilanları: satılık ve kiralık iş makineleri, kırma-eleme tesisleri, sondaj hizmetleri, cevher alım-satımı ve rödövans.';

export const metadata = pageMetadata({
  title: 'Market: madencilik ekipmanı, hizmet, cevher ve saha ilanları',
  description,
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
      icon={<Store aria-hidden="true" />}
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
        eyebrow="Ekipman · Yedek parça · Hizmet · Cevher · Saha"
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

      <Container className="space-y-14 py-10">
        <section aria-labelledby="kategoriler">
          <SectionHeading id="kategoriler" title="Kategoriler" />
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((category) => {
              const count = getMarketListingsByCategory(category.slug).length;
              return (
                <li key={category.slug}>
                  <Link
                    href={routes.marketCategory(category.slug)}
                    className={`${tileLink} min-h-16`}
                  >
                    <span className={`${iconTile} h-10 w-10`}>
                      <CategoryIcon icon={category.icon} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold leading-5 text-graphite-950 group-hover:text-copper-800">
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
        </section>

        <section aria-labelledby="ilanlar">
          <h2
            id="ilanlar"
            className="heading-accent mb-5 text-2xl font-bold tracking-tight text-graphite-950"
          >
            Tüm ilanlar
          </h2>
          <Suspense fallback={<StaticListingGrid items={items} empty={empty} />}>
            <ListingBrowser
              items={items}
              filters={filters}
              searchLabel="Ürün, marka veya hizmet ara"
              searchPlaceholder="Ör. ekskavatör, konkasör, krom, rödövans"
              noun="ilan"
              showExpired={isPreviewMode()}
              empty={empty}
            />
          </Suspense>
        </section>

        <SafetyNotice variant="market" />
      </Container>
    </>
  );
}
