import Link from 'next/link';
import { Suspense } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { ListingBrowser, StaticListingGrid } from '@/components/listings/ListingBrowser';
import { CareerTabs, HeaderActions, SubmissionsClosedNote } from '@/components/listings/SectionNav';
import { EmptyState } from '@/components/ui/EmptyState';
import { routes } from '@/i18n/routes';
import { areSubmissionsOpen, getCandidates, getPosition } from '@/lib/content';
import { isPreviewMode } from '@/lib/content/visibility';
import { availabilityLabels, type Availability } from '@/lib/listings/options';
import { candidateItem, facetFilter } from '@/lib/listings/view';
import { pageMetadata } from '@/lib/seo/metadata';

const title = 'Aday Profilleri';
const description =
  'Madencilik sektöründe iş arayan mühendis, tekniker, operatör ve saha çalışanlarının profilleri. Adayların kimlik ve iletişim bilgileri yayımlanmaz.';

// Kişisel verileri korumak için aday sayfaları arama motorlarında dizinlenmez.
export const metadata = pageMetadata({
  title: 'Aday profilleri: madencilikte iş arayanlar',
  description,
  path: routes.candidates(),
  noindex: true,
});

export default function CandidatesPage() {
  const items = getCandidates().map(candidateItem);
  const open = areSubmissionsOpen();
  const filters = [
    facetFilter(items, {
      id: 'meslek',
      label: 'Meslek',
      allLabel: 'Tüm meslekler',
      labelFor: (slug) => getPosition(slug)?.name ?? slug,
    }),
    facetFilter(items, {
      id: 'il',
      label: 'Tercih edilen il',
      allLabel: 'Tüm iller',
      wildcards: true,
    }),
    facetFilter(items, {
      id: 'hazir',
      label: 'Başlama',
      allLabel: 'Tümü',
      sort: false,
      labelFor: (value) => availabilityLabels[value as Availability] ?? value,
    }),
  ];
  const empty = (
    <EmptyState title="Şu an yayında aday profili yok">
      {open ? (
        <>
          İş mi arıyorsunuz?{' '}
          <Link
            href={routes.postListing('aday-profili')}
            className="font-semibold text-copper-700 hover:underline"
          >
            Profilinizi oluşturun
          </Link>
          ; iletişim bilgileriniz gizli kalır.
        </>
      ) : (
        'Aday profili başvuruları yakında açılacak.'
      )}
    </EmptyState>
  );

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={[{ name: title, href: routes.candidates() }]}
      >
        <CareerTabs active="candidates" />
        {open ? (
          <HeaderActions
            primary={{ href: routes.postListing('aday-profili'), label: 'Aday profili oluştur' }}
            secondary={
              <Link
                href={routes.postListing('is-ilani')}
                className="inline-flex min-h-11 items-center font-semibold text-copper-700 hover:underline"
              >
                İşçi arıyorum: ilan ver
              </Link>
            }
          />
        ) : (
          <SubmissionsClosedNote />
        )}
      </PageHeader>
      <Container className="space-y-8 py-10">
        <p className="flex max-w-3xl items-start gap-3 rounded-xl border border-stone-200 bg-white p-4 text-sm leading-6 text-graphite-700">
          <ShieldCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-copper-600" />
          <span>
            Adayların adı ve iletişim bilgileri yayımlanmaz. Bir adayla görüşmek isterseniz profil
            sayfasındaki “İletişim talebi gönder” düğmesini kullanın; talebinizi editörlerimiz adaya
            iletir.
          </span>
        </p>
        <section aria-labelledby="adaylar">
          <h2 id="adaylar" className="mb-5 text-2xl font-bold tracking-tight text-graphite-950">
            İş arayanlar
          </h2>
          <Suspense fallback={<StaticListingGrid items={items} empty={empty} />}>
            <ListingBrowser
              items={items}
              filters={filters}
              searchLabel="Meslek, beceri veya belge ara"
              searchPlaceholder="Ör. ekskavatör, ateşleyici, AutoCAD"
              noun="aday"
              showExpired={isPreviewMode()}
              empty={empty}
            />
          </Suspense>
        </section>
      </Container>
    </>
  );
}
