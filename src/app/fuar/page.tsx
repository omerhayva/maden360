import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowDown, ChevronRight, Mail, Plus, Tent } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { SafetyNotice } from '@/components/listings/Detail';
import { ListingBrowser, StaticListingGrid } from '@/components/listings/ListingBrowser';
import { HeaderActions, SubmissionsClosedNote } from '@/components/listings/SectionNav';
import { ButtonLink } from '@/components/ui/Button';
import { iconTile, tileClasses } from '@/components/ui/card';
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
    <EmptyState
      title="Henüz yayımlanmış stand yok"
      icon={<Tent aria-hidden="true" />}
      actions={
        open ? (
          <ButtonLink href={routes.postListing('fuar-standi')} variant="secondary" icon={Plus}>
            Stand başvurusu yapın
          </ButtonLink>
        ) : (
          <ButtonLink href={routes.contact()} variant="secondary" icon={Mail}>
            Bize ulaşın
          </ButtonLink>
        )
      }
    >
      Sanal fuar yeni açılıyor.{' '}
      {open
        ? 'Firmanızı tanıtmak için stand başvurusu yapın; başvurular editör kontrolünden sonra yayımlanır.'
        : 'Stand başvuruları yakında açılacak; firmanızı şimdiden tanıtmak isterseniz bize yazın.'}
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
              <ButtonLink href="#salonlar" variant="secondary" iconEnd={ArrowDown}>
                Salonları gezin
              </ButtonLink>
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
                  <Link href={routes.hall(hall.slug)} className={tileClasses({ align: 'start' })}>
                    <span className={`${iconTile} h-12 w-12 flex-col`}>
                      <CategoryIcon icon={hall.icon} className="h-5 w-5" />
                      <span className="text-[0.65rem] font-bold leading-none text-graphite-200">
                        {hall.code}
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-graphite-950 group-hover:text-copper-800">
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
                    <ChevronRight
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 self-center text-graphite-400 group-hover:text-copper-600"
                    />
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
