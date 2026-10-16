import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MessageSquareText, UserSearch } from 'lucide-react';
import { Prose } from '@/components/content/Prose';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Container } from '@/components/layout/Container';
import {
  BulletList,
  FactList,
  ListingMetaFooter,
  ListingPreviewNotice,
  RelayContact,
  SideCard,
} from '@/components/listings/Detail';
import { ExampleBadge, ListingStatusBadge } from '@/components/listings/ListingBadges';
import { MobileActionBar } from '@/components/listings/MobileActionBar';
import { routes } from '@/i18n/routes';
import { getCandidate, getCandidates, getPosition } from '@/lib/content';
import { isExpired, todayInTurkey } from '@/lib/listings/dates';
import { availabilityLabels, employmentTypeLabels, siteTypeLabels } from '@/lib/listings/options';
import { pageMetadata } from '@/lib/seo/metadata';
import { slugParams } from '@/lib/static-params';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return slugParams(getCandidates().map((candidate) => candidate.slug));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const candidate = getCandidate((await params).slug);
  if (!candidate) return {};
  return pageMetadata({
    title: `${candidate.headline} (${candidate.ref ?? 'aday profili'})`,
    description: candidate.summary,
    path: candidate.url,
    // Kişisel verileri korumak için aday profilleri arama motorlarında dizinlenmez.
    noindex: true,
  });
}

export default async function CandidatePage({ params }: Props) {
  const candidate = getCandidate((await params).slug);
  if (!candidate) notFound();
  const position = getPosition(candidate.position);
  const expiredAtBuild = isExpired(candidate.expiresAt, todayInTurkey());

  return (
    <>
      <div className="border-b border-stone-200 bg-white">
        <Container className="py-8 lg:py-10">
          <Breadcrumbs
            items={[
              { name: 'Aday Profilleri', href: routes.candidates() },
              { name: candidate.ref ?? candidate.headline, href: candidate.url },
            ]}
          />
          <div className="mt-5 max-w-3xl">
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-copper-700">
              <UserSearch aria-hidden="true" className="h-4 w-4" />
              {position?.name ?? candidate.position}
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-graphite-950 sm:text-4xl">
              {candidate.headline}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {candidate.ref && (
                <span className="font-mono text-sm text-graphite-600">{candidate.ref}</span>
              )}
              <ListingStatusBadge status={candidate.status} />
              <ExampleBadge example={candidate.example} />
            </div>
            <p className="mt-4 text-lg leading-8 text-graphite-700">{candidate.summary}</p>
            <ListingPreviewNotice
              status={candidate.status}
              example={candidate.example}
              expiredAtBuild={expiredAtBuild}
            />
          </div>
        </Container>
      </div>

      <Container className="py-8 lg:py-12">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
          <div className="min-w-0">
            <FactList
              facts={[
                {
                  label: 'Deneyim',
                  value:
                    candidate.experienceYears > 0
                      ? `${candidate.experienceYears} yıl`
                      : 'Yeni mezun / deneyimsiz',
                },
                { label: 'Eğitim', value: candidate.education },
                { label: 'Tercih edilen iller', value: candidate.preferredCities.join(', ') },
                {
                  label: 'Çalışma yeri tercihi',
                  value:
                    candidate.siteTypes.map((type) => siteTypeLabels[type]).join(', ') || undefined,
                },
                {
                  label: 'Çalışma şekli tercihi',
                  value:
                    candidate.employmentTypes
                      .map((type) => employmentTypeLabels[type])
                      .join(', ') || undefined,
                },
                { label: 'Başlama', value: availabilityLabels[candidate.availability] },
                { label: 'Yabancı dil', value: candidate.languages.join(', ') || undefined },
              ]}
            />
            {candidate.html && (
              <section aria-labelledby="hakkinda" className="mt-10">
                <h2 id="hakkinda" className="text-2xl font-bold tracking-tight text-graphite-950">
                  Aday hakkında
                </h2>
                <Prose html={candidate.html} className="mt-4" />
              </section>
            )}
            <BulletList id="belgeler" title="Belgeler" items={candidate.certificates} />
            <BulletList
              id="beceriler"
              title="Beceriler ve deneyim alanları"
              items={candidate.skills}
            />
            <ListingMetaFooter
              refCode={candidate.ref}
              postedAt={candidate.postedAt}
              updatedAt={candidate.updatedAt}
              moderatedAt={candidate.moderatedAt}
              expiresAt={candidate.expiresAt}
              expiryLabel="Profil geçerliliği"
              title={candidate.headline}
              path={candidate.url}
            />
          </div>
          <aside className="mt-10 space-y-5 lg:mt-0" aria-label="Adayla iletişim">
            <SideCard title="Adayla iletişim" id="iletisim">
              <RelayContact
                refCode={candidate.ref}
                description="Adayın adı ve iletişim bilgileri gizlidir. Talebinizi editörlerimiz adaya iletir; aday uygun görürse sizinle iletişime geçer."
              />
            </SideCard>
          </aside>
        </div>
      </Container>

      <MobileActionBar href="#iletisim" label="Adayla iletişime geç" icon={MessageSquareText} />
    </>
  );
}
