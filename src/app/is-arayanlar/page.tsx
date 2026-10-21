import { Suspense } from 'react';
import { Mail, Plus } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { ListingBrowser, StaticListingGrid } from '@/components/listings/ListingBrowser';
import { CareerTabs, HeaderActions, SubmissionsClosedNote } from '@/components/listings/SectionNav';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { routes } from '@/i18n/routes';
import { areSubmissionsOpen, getCandidates, getJobs, getPosition } from '@/lib/content';
import { isPreviewMode } from '@/lib/content/visibility';
import { availabilityLabels, type Availability } from '@/lib/listings/options';
import { candidateItem, facetFilter } from '@/lib/listings/view';
import { pageMetadata } from '@/lib/seo/metadata';

const title = 'İş Arayanlar';
const description =
  'Madencilikte iş arayan mühendis, tekniker ve operatörlerin profilleri. Adayların adı ve iletişim bilgileri yayımlanmaz.';

// Kişisel verileri korumak için aday sayfaları arama motorlarında dizinlenmez.
export const metadata = pageMetadata({
  title: 'İş arayanlar: madencilikte iş arayan mühendis, tekniker ve operatörler',
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
    <EmptyState
      title="Şu an yayında aday profili yok"
      actions={
        open ? (
          <ButtonLink href={routes.postListing('aday-profili')} variant="secondary" icon={Plus}>
            Profilinizi oluşturun
          </ButtonLink>
        ) : (
          <ButtonLink href={routes.contact()} variant="secondary" icon={Mail}>
            Bize ulaşın
          </ButtonLink>
        )
      }
    >
      {open
        ? 'İş arıyorsanız profilinizi oluşturun. Adınız ve iletişim bilgileriniz gizli kalır.'
        : 'Aday profili başvuruları yakında açılacak.'}
    </EmptyState>
  );

  return (
    <>
      <PageHeader
        photo="is-arayanlar"
        title={title}
        description={description}
        breadcrumbs={[{ name: title, href: routes.candidates() }]}
      >
        <CareerTabs
          active="candidates"
          counts={{ jobs: getJobs().length, candidates: items.length }}
        />
        {open ? (
          <HeaderActions
            primary={{ href: routes.postListing('aday-profili'), label: 'Aday profili oluştur' }}
            secondary={
              <ButtonLink href={routes.postListing('is-ilani')} variant="inverse">
                Eleman arıyorum, ilan ver
              </ButtonLink>
            }
          />
        ) : (
          <SubmissionsClosedNote />
        )}
      </PageHeader>
      <Container className="space-y-6 py-8 lg:py-10">
        <p className="max-w-3xl border-l-2 border-copper-700 pl-3 text-sm leading-6 text-graphite-700">
          Bir adayla görüşmek için profil sayfasındaki “İletişim talebi gönder” düğmesini kullanın.
          Talebinizi editör adaya iletir, aday isterse size döner.
        </p>
        <section aria-labelledby="adaylar">
          <h2 id="adaylar" className="sr-only">
            Aday profilleri
          </h2>
          <Suspense fallback={<StaticListingGrid items={items} empty={empty} />}>
            <ListingBrowser
              items={items}
              filters={filters}
              searchLabel="Meslek, beceri veya belge ara"
              searchPlaceholder="Ör. operatör, AutoCAD"
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
