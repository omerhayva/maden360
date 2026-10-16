import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Mail, Plus } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { ListingBrowser, StaticListingGrid } from '@/components/listings/ListingBrowser';
import { HeaderActions } from '@/components/listings/SectionNav';
import { ButtonLink } from '@/components/ui/Button';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { EmptyState } from '@/components/ui/EmptyState';
import { chipClasses } from '@/components/ui/styles';
import { routes } from '@/i18n/routes';
import { areSubmissionsOpen, getHall, getHalls, getStandsByHall } from '@/lib/content';
import { isPreviewMode } from '@/lib/content/visibility';
import { facetFilter, standItem } from '@/lib/listings/view';
import { pageMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getHalls().map((hall) => ({ slug: hall.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const hall = getHall((await params).slug);
  if (!hall) return {};
  return pageMetadata({
    title: `${hall.name} firmaları — Sanal Fuar Salon ${hall.code}`,
    description: hall.description,
    path: routes.hall(hall.slug),
  });
}

export default async function HallPage({ params }: Props) {
  const hall = getHall((await params).slug);
  if (!hall) notFound();
  const items = getStandsByHall(hall.slug).map(standItem);
  const open = areSubmissionsOpen();
  const others = getHalls().filter((other) => other.slug !== hall.slug);
  const empty = (
    <EmptyState
      title="Bu salonda henüz stand yok"
      icon={<CategoryIcon icon={hall.icon} />}
      actions={
        open ? (
          <ButtonLink href={routes.postListing('fuar-standi')} variant="secondary" icon={Plus}>
            Stand açın
          </ButtonLink>
        ) : (
          <ButtonLink href={routes.contact()} variant="secondary" icon={Mail}>
            Bize ulaşın
          </ButtonLink>
        )
      }
    >
      {open
        ? 'Bu alanda faaliyet gösteriyorsanız stand açarak firmanızı tanıtın.'
        : 'Stand başvuruları yakında açılacak. Aşağıdaki diğer salonlara göz atabilirsiniz.'}
    </EmptyState>
  );

  return (
    <>
      <PageHeader
        photo="fuar"
        eyebrow={`Sanal Fuar · Salon ${hall.code}`}
        title={hall.name}
        description={hall.description}
        breadcrumbs={[
          { name: 'Sanal Fuar', href: routes.fair() },
          { name: `Salon ${hall.code}`, href: routes.hall(hall.slug) },
        ]}
      >
        {open && (
          <HeaderActions
            primary={{ href: routes.postListing('fuar-standi'), label: 'Bu salonda stand açın' }}
          />
        )}
      </PageHeader>
      <Container className="space-y-12 py-10">
        <section aria-labelledby="salon-standlari">
          <h2
            id="salon-standlari"
            className="heading-accent mb-5 text-2xl font-bold tracking-tight text-graphite-950"
          >
            Salondaki standlar
          </h2>
          <Suspense fallback={<StaticListingGrid items={items} empty={empty} />}>
            <ListingBrowser
              items={items}
              filters={[facetFilter(items, { id: 'il', label: 'İl', allLabel: 'Tüm iller' })]}
              searchLabel="Bu salonda ara"
              searchPlaceholder="Firma, ürün veya marka"
              noun="stand"
              showExpired={isPreviewMode()}
              empty={empty}
            />
          </Suspense>
        </section>
        <nav aria-labelledby="diger-salonlar">
          <h2 id="diger-salonlar" className="text-lg font-bold text-graphite-950">
            Diğer salonlar
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {others.map((other) => (
              <li key={other.slug}>
                <Link href={routes.hall(other.slug)} className={chipClasses()}>
                  <CategoryIcon icon={other.icon} className="text-copper-600" />
                  {other.code} · {other.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </>
  );
}
