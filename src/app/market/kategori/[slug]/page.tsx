import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Mail, Plus } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { NoticeBox, SafetyNotice } from '@/components/listings/Detail';
import { ListingBrowser, StaticListingGrid } from '@/components/listings/ListingBrowser';
import { HeaderActions } from '@/components/listings/SectionNav';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { routes } from '@/i18n/routes';
import {
  areSubmissionsOpen,
  getMarketCategories,
  getMarketCategory,
  getMarketListingsByCategory,
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
    title: `Market: ${category.name} ilanları`,
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
    <EmptyState
      title="Bu kategoride şu an ilan yok"
      actions={
        open ? (
          <ButtonLink href={routes.postListing('market-ilani')} variant="secondary" icon={Plus}>
            İlan verin
          </ButtonLink>
        ) : (
          <ButtonLink href={routes.contact()} variant="secondary" icon={Mail}>
            Bize ulaşın
          </ButtonLink>
        )
      }
    >
      {open
        ? 'Bu kategoride ilk ilanı siz verebilir veya aşağıdaki diğer kategorilere göz atabilirsiniz.'
        : 'Market ilanı başvuruları yakında açılacak. Aşağıdaki diğer kategorilere göz atabilirsiniz.'}
    </EmptyState>
  );

  return (
    <>
      <PageHeader
        photo="market"
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
      <Container className="space-y-10 py-8 lg:py-10">
        {category.notice && (
          <NoticeBox
            title={category.notice.title}
            text={category.notice.text}
            references={category.notice.references}
          />
        )}
        <section aria-labelledby="kategori-ilanlari">
          <h2 id="kategori-ilanlari" className="sr-only">
            {category.name} ilanları
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
          <h2 id="diger-kategoriler" className="text-xl font-semibold text-graphite-950">
            Diğer kategoriler
          </h2>
          <ul className="mt-2 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((other) => (
              <li key={other.slug} className="border-b border-stone-300">
                <Link
                  href={routes.marketCategory(other.slug)}
                  className="flex min-h-12 items-center py-3 font-medium text-graphite-950 underline-offset-4 ui-hover:underline"
                >
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
