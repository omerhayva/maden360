import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Mail, Plus } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { FairPlan } from '@/components/listings/FairPlan';
import { ListingBrowser, StaticListingGrid } from '@/components/listings/ListingBrowser';
import { HeaderActions } from '@/components/listings/SectionNav';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { TextLink } from '@/components/ui/TextLink';
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
    title: `Salon ${hall.code}: ${hall.name} firmaları`,
    description: hall.description,
    path: routes.hall(hall.slug),
  });
}

export default async function HallPage({ params }: Props) {
  const hall = getHall((await params).slug);
  if (!hall) notFound();
  const items = getStandsByHall(hall.slug).map(standItem);
  const open = areSubmissionsOpen();
  const halls = getHalls();
  const empty = (
    <EmptyState
      title="Bu salonda henüz stand açan firma yok"
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
        : 'Stand başvuruları yakında açılacak. Aşağıdaki plandan diğer salonlara geçebilirsiniz.'}
    </EmptyState>
  );

  return (
    <>
      <PageHeader
        photo="fuar"
        title={`Salon ${hall.code}: ${hall.name}`}
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
      <Container className="space-y-10 py-8 lg:py-10">
        <section aria-labelledby="salon-standlari">
          <h2
            id="salon-standlari"
            className="mb-4 text-2xl leading-tight font-semibold text-graphite-950"
          >
            Bu salondaki firmalar
          </h2>
          <Suspense fallback={<StaticListingGrid items={items} empty={empty} />}>
            <ListingBrowser
              items={items}
              filters={[facetFilter(items, { id: 'il', label: 'İl', allLabel: 'Tüm iller' })]}
              searchLabel="Bu salonda ara"
              searchPlaceholder="Firma, ürün veya marka"
              noun="firma"
              showExpired={isPreviewMode()}
              empty={empty}
            />
          </Suspense>
        </section>
        <section aria-labelledby="salon-plani">
          <SectionHeading id="salon-plani" title="Salon planı" />
          <div className="mt-4">
            <FairPlan
              halls={halls}
              current={hall.slug}
              counts={Object.fromEntries(
                halls.map((other) => [other.slug, getStandsByHall(other.slug).length]),
              )}
              extra={
                <>
                  <span className="font-semibold text-graphite-950">Fuaye</span>
                  <TextLink href={routes.fair()} className="-my-2">
                    Tüm firmalar
                  </TextLink>
                </>
              }
            />
          </div>
        </section>
      </Container>
    </>
  );
}
