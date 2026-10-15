import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowDown } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { SafetyNotice } from '@/components/listings/Detail';
import { ListingBrowser, StaticListingGrid } from '@/components/listings/ListingBrowser';
import { HeaderActions, SubmissionsClosedNote } from '@/components/listings/SectionNav';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { routes } from '@/i18n/routes';
import { areSubmissionsOpen, getHall, getHalls, getStands, getStandsByHall } from '@/lib/content';
import { isPreviewMode } from '@/lib/content/visibility';
import { facetFilter, standItem } from '@/lib/listings/view';
import { pageMetadata } from '@/lib/seo/metadata';

const title = 'Sanal Fuar';
const description =
  'Madencilik tedarikçileri ve hizmet firmaları salon salon: iş makineleri, kırma-eleme, sondaj, delme-patlatma, İSG, laboratuvar, mühendislik ve yedek parça firmalarının ürün ve hizmetleri.';

export const metadata = pageMetadata({
  title: 'Sanal Fuar: madencilik tedarikçileri ve hizmet firmaları',
  description,
  path: routes.fair(),
});

export default function FairPage() {
  const halls = getHalls();
  const items = getStands().map(standItem);
  const open = areSubmissionsOpen();
  const filters = [
    facetFilter(items, {
      id: 'salon',
      label: 'Salon',
      allLabel: 'Tüm salonlar',
      sort: false,
      labelFor: (slug) => {
        const hall = getHall(slug);
        return hall ? `${hall.code} · ${hall.name}` : slug;
      },
    }),
    facetFilter(items, { id: 'il', label: 'İl', allLabel: 'Tüm iller' }),
  ];
  const empty = (
    <EmptyState title="Henüz yayımlanmış stand yok">
      Sanal fuar yeni açılıyor.{' '}
      {open ? (
        <>
          Firmanızı tanıtmak için{' '}
          <Link
            href={routes.postListing('fuar-standi')}
            className="font-semibold text-copper-700 hover:underline"
          >
            stand başvurusu yapın
          </Link>
          .
        </>
      ) : (
        'Stand başvuruları yakında açılacak.'
      )}
    </EmptyState>
  );

  return (
    <>
      <PageHeader
        eyebrow="Tedarikçiler ve hizmet firmaları"
        title={title}
        description={description}
        breadcrumbs={[{ name: title, href: routes.fair() }]}
      >
        {open ? (
          <HeaderActions
            primary={{ href: routes.postListing('fuar-standi'), label: 'Stand açın' }}
            secondary={
              <a
                href="#salonlar"
                className="inline-flex min-h-11 items-center gap-1 font-semibold text-copper-700 hover:underline"
              >
                Salonları gezin <ArrowDown aria-hidden="true" className="h-4 w-4" />
              </a>
            }
          />
        ) : (
          <SubmissionsClosedNote />
        )}
      </PageHeader>

      <Container className="space-y-14 py-10">
        <section aria-labelledby="salonlar">
          <SectionHeading
            id="salonlar"
            title="Salonlar"
            description="Firmalar faaliyet alanlarına göre salonlarda yer alır; bir firma en fazla üç salonda bulunabilir."
          />
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {halls.map((hall) => {
              const count = getStandsByHall(hall.slug).length;
              return (
                <li key={hall.slug}>
                  <Link
                    href={routes.hall(hall.slug)}
                    className="flex h-full gap-4 rounded-xl border border-stone-200 bg-white p-4 hover:border-copper-300"
                  >
                    <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-graphite-900 text-copper-400">
                      <CategoryIcon icon={hall.icon} className="h-5 w-5" />
                      <span className="text-[0.65rem] font-bold leading-none text-graphite-200">
                        {hall.code}
                      </span>
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-graphite-950">
                        <span className="sr-only">Salon {hall.code}: </span>
                        {hall.name}
                      </span>
                      <span className="mt-1 block text-sm leading-5 text-graphite-600">
                        {hall.description}
                      </span>
                      <span className="mt-2 block text-xs font-semibold text-copper-700">
                        {count > 0 ? `${count} stand` : 'Stand bekleniyor'}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="standlar">
          <h2 id="standlar" className="mb-5 text-2xl font-bold tracking-tight text-graphite-950">
            Tüm standlar
          </h2>
          <Suspense fallback={<StaticListingGrid items={items} empty={empty} />}>
            <ListingBrowser
              items={items}
              filters={filters}
              searchLabel="Firma, ürün veya marka ara"
              searchPlaceholder="Ör. karotlu sondaj, konkasör, gaz dedektörü"
              noun="stand"
              showExpired={isPreviewMode()}
              empty={empty}
            />
          </Suspense>
        </section>

        <SafetyNotice variant="stand" />
      </Container>
    </>
  );
}
