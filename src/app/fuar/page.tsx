import { Suspense } from 'react';
import { Mail, Plus } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { SafetyNotice } from '@/components/listings/Detail';
import { FairPlan } from '@/components/listings/FairPlan';
import { ListingBrowser, StaticListingGrid } from '@/components/listings/ListingBrowser';
import { HeaderActions, SubmissionsClosedNote } from '@/components/listings/SectionNav';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { TextLink } from '@/components/ui/TextLink';
import { routes } from '@/i18n/routes';
import { areSubmissionsOpen, getHall, getHalls, getStands, getStandsByHall } from '@/lib/content';
import { isPreviewMode } from '@/lib/content/visibility';
import { facetFilter, standItem } from '@/lib/listings/view';
import { pageMetadata } from '@/lib/seo/metadata';

const title = 'Sanal Fuar';
const description =
  'Madencilik tedarikçileri ve hizmet firmaları faaliyet alanlarına göre salonlarda. Firma sayfalarında ürünler, markalar ve iletişim bilgileri yer alır.';

export const metadata = pageMetadata({
  title: 'Sanal Fuar: madencilik tedarikçileri ve hizmet firmaları',
  description:
    'İş makinesi, kırma-eleme, sondaj, delme-patlatma, İSG, laboratuvar, mühendislik ve yedek parça firmaları. Ürünler, markalar ve iletişim bilgileri.',
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
        return hall ? `Salon ${hall.code}: ${hall.name}` : slug;
      },
    }),
    facetFilter(items, { id: 'il', label: 'İl', allLabel: 'Tüm iller' }),
  ];
  const empty = (
    <EmptyState
      title="Henüz stand açan firma yok"
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
        ? 'Firmanızı tanıtmak için stand başvurusu yapın. Başvurunuzu editör okuyup yayımlar.'
        : 'Stand başvuruları yakında açılacak. Firmanızı şimdiden tanıtmak isterseniz bize yazın.'}
    </EmptyState>
  );

  return (
    <>
      <PageHeader
        photo="fuar"
        title={title}
        description={description}
        breadcrumbs={[{ name: title, href: routes.fair() }]}
      >
        {open ? (
          <HeaderActions
            primary={{ href: routes.postListing('fuar-standi'), label: 'Stand açın' }}
          />
        ) : (
          <SubmissionsClosedNote />
        )}
      </PageHeader>

      <Container className="space-y-10 py-8 lg:py-10">
        <section aria-labelledby="salonlar">
          <SectionHeading
            id="salonlar"
            title="Salon planı"
            description="Bir firma en çok üç salonda yer alabilir."
          />
          <div className="mt-5">
            <FairPlan
              halls={halls}
              counts={Object.fromEntries(
                halls.map((hall) => [hall.slug, getStandsByHall(hall.slug).length]),
              )}
              extra={
                <>
                  <span className="font-semibold text-graphite-950">Fuaye</span>
                  {open ? (
                    <TextLink href={routes.postListing('fuar-standi')} className="-my-2">
                      Stand başvurusu
                    </TextLink>
                  ) : (
                    <span className="text-graphite-700">Giriş</span>
                  )}
                </>
              }
            />
          </div>
        </section>

        <section aria-labelledby="standlar">
          <h2 id="standlar" className="mb-4 text-2xl leading-tight font-semibold text-graphite-950">
            Firmalar
          </h2>
          <Suspense fallback={<StaticListingGrid items={items} empty={empty} />}>
            <ListingBrowser
              items={items}
              filters={filters}
              searchLabel="Firma, ürün veya marka ara"
              searchPlaceholder="Ör. sondaj, konkasör"
              noun="firma"
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
