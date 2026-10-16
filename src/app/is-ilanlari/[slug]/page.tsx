import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Briefcase, ExternalLink, Mail, MapPin, Phone } from 'lucide-react';
import { Prose } from '@/components/content/Prose';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Container } from '@/components/layout/Container';
import {
  BulletList,
  FactList,
  ListingMetaFooter,
  ListingPreviewNotice,
  SafetyNotice,
  SideCard,
} from '@/components/listings/Detail';
import { ExampleBadge, ListingStatusBadge } from '@/components/listings/ListingBadges';
import { JsonLd } from '@/components/seo/JsonLd';
import { routes } from '@/i18n/routes';
import { getJob, getJobs, getPosition, getStand } from '@/lib/content';
import { formatDate } from '@/lib/format';
import { telHref } from '@/lib/listings/contact';
import { isExpired, todayInTurkey } from '@/lib/listings/dates';
import { formatSalary } from '@/lib/listings/format';
import { employmentTypeLabels, siteTypeLabels } from '@/lib/listings/options';
import { locationOf } from '@/lib/listings/view';
import { pageMetadata } from '@/lib/seo/metadata';
import { jobPostingSchema } from '@/lib/seo/structured-data';
import { slugParams } from '@/lib/static-params';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return slugParams(getJobs().map((job) => job.slug));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const job = getJob((await params).slug);
  if (!job) return {};
  return pageMetadata({
    title: job.seoTitle ?? `${job.title} — ${job.city}`,
    description: job.seoDescription ?? job.summary,
    path: job.url,
    noindex: job.status !== 'published' || job.example,
    keywords: job.keywords,
  });
}

const buttonClass =
  'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-copper-600 px-4 font-semibold text-white hover:bg-copper-700';

export default async function JobPage({ params }: Props) {
  const job = getJob((await params).slug);
  if (!job) notFound();

  const position = getPosition(job.position);
  const stand = getStand(job.employer.stand);
  const expiredAtBuild = isExpired(job.expiresAt, todayInTurkey());
  const subject = `Başvuru: ${job.title}${job.ref ? ` (${job.ref})` : ''}`;

  return (
    <>
      <div className="border-b border-stone-200 bg-white">
        <Container className="py-8 lg:py-10">
          <Breadcrumbs
            items={[
              { name: 'İş İlanları', href: routes.jobs() },
              { name: job.title, href: job.url },
            ]}
          />
          <div className="mt-5 max-w-3xl">
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-copper-700">
              <Briefcase aria-hidden="true" className="h-4 w-4" />
              {position?.name ?? job.position}
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-graphite-950 sm:text-4xl">
              {job.title}
            </h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-graphite-700">
              {stand ? (
                <Link href={stand.url} className="font-semibold text-copper-700 hover:underline">
                  {job.employer.name}
                </Link>
              ) : (
                <span className="font-semibold">{job.employer.name}</span>
              )}
              <span className="inline-flex items-center gap-1">
                <MapPin aria-hidden="true" className="h-4 w-4 text-copper-600" />
                {locationOf(job)}
              </span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <ListingStatusBadge status={job.status} />
              <ExampleBadge example={job.example} />
            </div>
            <p className="mt-4 text-lg leading-8 text-graphite-700">{job.summary}</p>
            <ListingPreviewNotice
              status={job.status}
              example={job.example}
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
                { label: 'Çalışma yeri', value: siteTypeLabels[job.siteType] },
                { label: 'Çalışma şekli', value: employmentTypeLabels[job.employmentType] },
                { label: 'Vardiya düzeni', value: job.shift },
                {
                  label: 'Alınacak kişi',
                  value: job.openings > 1 ? `${job.openings} kişi` : '1 kişi',
                },
                {
                  label: 'Deneyim',
                  value: job.experienceYears ? `En az ${job.experienceYears} yıl` : undefined,
                },
                { label: 'Eğitim', value: job.education },
                { label: 'Ücret', value: job.salary ? formatSalary(job.salary) : undefined },
                {
                  label: 'Son başvuru',
                  value: job.expiresAt ? formatDate(job.expiresAt) : undefined,
                },
              ]}
            />

            <section aria-labelledby="is-tanimi" className="mt-10">
              <h2 id="is-tanimi" className="text-2xl font-bold tracking-tight text-graphite-950">
                İş tanımı
              </h2>
              <Prose html={job.html} className="mt-4" />
            </section>
            <BulletList id="nitelikler" title="Aranan nitelikler" items={job.requirements} />
            <BulletList id="belgeler" title="İstenen belgeler" items={job.certificates} />
            <BulletList id="yan-haklar" title="Yan haklar" items={job.benefits} />

            <ListingMetaFooter
              refCode={job.ref}
              postedAt={job.postedAt}
              updatedAt={job.updatedAt}
              moderatedAt={job.moderatedAt}
              expiresAt={job.expiresAt}
              expiryLabel="Son başvuru"
              title={job.title}
              path={job.url}
            />
          </div>

          <aside className="mt-10 space-y-5 lg:mt-0" aria-label="Başvuru">
            <SideCard title="Nasıl başvurulur?" id="basvuru">
              {job.apply.method === 'eposta' && (
                <a
                  href={`mailto:${job.apply.value}?subject=${encodeURIComponent(subject)}`}
                  className={buttonClass}
                >
                  <Mail aria-hidden="true" className="h-4 w-4" />
                  E-postayla başvur
                </a>
              )}
              {job.apply.method === 'url' && (
                <a
                  href={job.apply.value}
                  rel="nofollow ugc noopener noreferrer"
                  className={buttonClass}
                >
                  Başvuru sayfasına git
                  <ExternalLink aria-hidden="true" className="h-4 w-4" />
                </a>
              )}
              {job.apply.method === 'telefon' && (
                <a href={telHref(job.apply.value)} className={buttonClass}>
                  <Phone aria-hidden="true" className="h-4 w-4" />
                  {job.apply.value}
                </a>
              )}
              {job.apply.method === 'eposta' && (
                <p className="mt-2 break-all text-sm text-graphite-700">{job.apply.value}</p>
              )}
              {job.apply.note && (
                <p className="mt-3 text-sm leading-6 text-graphite-700">{job.apply.note}</p>
              )}
            </SideCard>
            <SafetyNotice variant="job" />
          </aside>
        </div>
      </Container>

      {job.status === 'published' && !job.example && !expiredAtBuild && (
        <JsonLd data={jobPostingSchema(job, position?.name ?? job.position)} />
      )}
    </>
  );
}
