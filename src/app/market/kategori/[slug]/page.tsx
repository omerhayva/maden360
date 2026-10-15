import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { NoticeBox, SafetyNotice } from '@/components/listings/Detail';
import { ListingBrowser, StaticListingGrid } from '@/components/listings/ListingBrowser';
import { HeaderActions } from '@/components/listings/SectionNav';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { EmptyState } from '@/components/ui/EmptyState';
import { routes } from '@/i18n/routes';
import {
  areSubmissionsOpen,
  getMarketCategories,
  getMarketCategory,
  getMarketListingsByCategory,
  resolveSources,
} from '@/lib/content';
import { isPreviewMode } from '@/lib/content/visibility';
import { marketTypeLabels, type MarketType } from '@/lib/listings/options';
import { facetFilter, marketItem } from '@/lib/listings/view';
import { pageMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getMarketCategories().map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = getMarketCategory((await params).slug);
  if (!category) return {};
  return pageMetadata({
    title: `${category.name} ilanları — Market`,
    description: category.description,
    path: routes.marketCategory(category.slug),
  });
}

export default async function MarketCategoryPage({ params }: Props) {
  const category = getMarketCategory((await params).slug);
  if (!category) notFound();
  const items = getMarketListingsByCategory(category.slug).map(marketItem);
  const open = areSubmissionsOpen();
  const others = getMarketCategories().filter((other) => other.slug !== category.slug);
  const empty = (
    <EmptyState title="Bu kategoride şu an ilan yok">
      {open ? (
        <>
          <Link
            href={routes.postListing('market-ilani')}
            className="font-semibold text-copper-700 hover:underline"
          >
            İlan verin
          </Link>{' '}
          veya diğer kategorilere göz atın.
        </>
      ) : (
        'Market ilanı başvuruları yakında açılacak.'
      )}
    </EmptyState>
  );

  return (
    <>
      <PageHeader
        eyebrow="Market kategorisi"
        title={category.name}
        description={category.description}
        breadcrumbs={[
          { name: 'Market', href: routes.market() },
          { name: category.name, href: routes.marketCategory(category.slug) },
        ]}
      >
        {open && (
          <HeaderActions
            primary={{ href: routes.postListing('market-ilani'), label: 'Bu kategoride ilan ver' }}
          />
        )}
      </PageHeader>
      <Container className="space-y-10 py-10">
        {category.notice && (
          <NoticeBox
            title={category.notice.title}
            text={category.notice.text}
            sources={resolveSources(category.notice)}
          />
        )}
        <section aria-labelledby="kategori-ilanlari">
          <h2
            id="kategori-ilanlari"
            className="mb-5 text-2xl font-bold tracking-tight text-graphite-950"
          >
            İlanlar
          </h2>
          <Suspense fallback={<StaticListingGrid items={items} empty={empty} />}>
            <ListingBrowser
              items={items}
              filters={[
                facetFilter(items, {
                  id: 'tur',
                  label: 'İlan türü',
                  allLabel: 'Tümü',
                  sort: false,
                  labelFor: (value) => marketTypeLabels[value as MarketType] ?? value,
                }),
                facetFilter(items, { id: 'il', label: 'İl', allLabel: 'Tüm iller' }),
              ]}
              searchLabel="Bu kategoride ara"
              searchPlaceholder="Ürün, marka veya hizmet"
              noun="ilan"
              showExpired={isPreviewMode()}
              empty={empty}
            />
          </Suspense>
        </section>
        <SafetyNotice variant="market" />
        <nav aria-labelledby="diger-kategoriler">
          <h2 id="diger-kategoriler" className="text-lg font-bold text-graphite-950">
            Diğer kategoriler
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {others.map((other) => (
              <li key={other.slug}>
                <Link
                  href={routes.marketCategory(other.slug)}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-stone-300 bg-white px-3 text-sm font-medium text-graphite-800 hover:border-copper-400"
                >
                  <CategoryIcon icon={other.icon} className="h-4 w-4 text-copper-600" />
                  {other.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </>
  );
}
