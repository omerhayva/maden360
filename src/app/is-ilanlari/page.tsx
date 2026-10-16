import { Suspense } from 'react';
import { Briefcase, Mail, Plus, UserSearch } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { SafetyNotice } from '@/components/listings/Detail';
import { ListingBrowser, StaticListingGrid } from '@/components/listings/ListingBrowser';
import { CareerTabs, HeaderActions, SubmissionsClosedNote } from '@/components/listings/SectionNav';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { routes } from '@/i18n/routes';
import { areSubmissionsOpen, getJobs, getPosition } from '@/lib/content';
import { isPreviewMode } from '@/lib/content/visibility';
import {
  employmentTypeLabels,
  siteTypeLabels,
  type EmploymentType,
  type SiteType,
} from '@/lib/listings/options';
import { facetFilter, jobItem } from '@/lib/listings/view';
import { pageMetadata } from '@/lib/seo/metadata';

const title = 'İş İlanları';
const description =
  'Madencilik iş ilanları: maden ve jeoloji mühendisi, tekniker, iş makinesi operatörü, sondör, ateşleyici ve iş güvenliği uzmanı arayan işverenler.';

export const metadata = pageMetadata({
  title: 'Madencilik iş ilanları',
  description,
  path: routes.jobs(),
});

export default function JobsPage() {
  const items = getJobs().map(jobItem);
  const open = areSubmissionsOpen();
  const filters = [
    facetFilter(items, {
      id: 'meslek',
      label: 'Meslek',
      allLabel: 'Tüm meslekler',
      labelFor: (slug) => getPosition(slug)?.name ?? slug,
    }),
    facetFilter(items, { id: 'il', label: 'İl', allLabel: 'Tüm iller' }),
    facetFilter(items, {
      id: 'yer',
      label: 'Çalışma yeri',
      allLabel: 'Tümü',
      labelFor: (value) => siteTypeLabels[value as SiteType] ?? value,
    }),
    facetFilter(items, {
      id: 'sekil',
      label: 'Çalışma şekli',
      allLabel: 'Tümü',
      labelFor: (value) => employmentTypeLabels[value as EmploymentType] ?? value,
    }),
  ];
  const empty = (
    <EmptyState
      title="Şu an yayında iş ilanı yok"
      icon={<Briefcase aria-hidden="true" />}
      actions={
        open ? (
          <>
            <ButtonLink href={routes.postListing('is-ilani')} variant="secondary" icon={Plus}>
              İş ilanı ver
            </ButtonLink>
            <ButtonLink
              href={routes.postListing('aday-profili')}
              variant="secondary"
              icon={UserSearch}
            >
              Aday profili oluştur
            </ButtonLink>
          </>
        ) : (
          <ButtonLink href={routes.contact()} variant="secondary" icon={Mail}>
            Bize ulaşın
          </ButtonLink>
        )
      }
    >
      {open
        ? 'İşçi arıyorsanız ilk ilanı siz verin; iş arıyorsanız aday profili oluşturabilirsiniz.'
        : 'İlan başvuruları yakında açılacak.'}
    </EmptyState>
  );

  return (
    <>
      <PageHeader
        photo="is-ilanlari"
        title={title}
        description={description}
        breadcrumbs={[{ name: title, href: routes.jobs() }]}
      >
        <CareerTabs active="jobs" />
        {open ? (
          <HeaderActions
            primary={{ href: routes.postListing('is-ilani'), label: 'İş ilanı ver' }}
            secondary={
              <ButtonLink
                href={routes.postListing('aday-profili')}
                variant="inverse"
                icon={UserSearch}
              >
                İş arıyorum: profil oluştur
              </ButtonLink>
            }
          />
        ) : (
          <SubmissionsClosedNote />
        )}
      </PageHeader>
      <Container className="space-y-10 py-10">
        <section aria-labelledby="acik-pozisyonlar">
          <h2
            id="acik-pozisyonlar"
            className="heading-accent mb-5 text-2xl font-bold tracking-tight text-graphite-950"
          >
            Açık pozisyonlar
          </h2>
          <Suspense fallback={<StaticListingGrid items={items} empty={empty} />}>
            <ListingBrowser
              items={items}
              filters={filters}
              searchLabel="Pozisyon, firma veya belge ara"
              searchPlaceholder="Ör. maden mühendisi, operatör, ateşleyici"
              noun="ilan"
              showExpired={isPreviewMode()}
              empty={empty}
            />
          </Suspense>
        </section>
        <SafetyNotice variant="job" />
      </Container>
    </>
  );
}
