import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  CorrectionNotice,
  EditorialMeta,
  ReviewInfo,
  StatusNotice,
} from '@/components/content/Editorial';
import { Prose } from '@/components/content/Prose';
import { RelatedContent } from '@/components/content/RelatedContent';
import { SourceList } from '@/components/content/SourceList';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Container } from '@/components/layout/Container';
import { JsonLd } from '@/components/seo/JsonLd';
import { routes } from '@/i18n/routes';
import {
  backlinksForTerm,
  getCategory,
  getTerm,
  getTerms,
  resolveArticles,
  resolveCalculators,
  resolvePeople,
  resolveSources,
  resolveTerms,
} from '@/lib/content';
import { pageMetadata } from '@/lib/seo/metadata';
import { slugParams } from '@/lib/static-params';
import { termSchema } from '@/lib/seo/structured-data';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return slugParams(getTerms().map((term) => term.slug));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const term = getTerm((await params).slug);
  if (!term) return {};
  return pageMetadata({
    title: term.seoTitle ?? `${term.term} nedir?`,
    description: term.seoDescription ?? term.definition,
    path: term.url,
    noindex: term.status !== 'published',
    keywords: [term.term, term.english, ...term.aliases].filter((value): value is string =>
      Boolean(value),
    ),
  });
}

function uniqueBySlug<T extends { slug: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => (seen.has(item.slug) ? false : (seen.add(item.slug), true)));
}

export default async function TermPage({ params }: Props) {
  const term = getTerm((await params).slug);
  if (!term) notFound();

  const category = term.category ? getCategory(term.category) : undefined;
  const authors = resolvePeople(term.authors);
  const reviewers = resolvePeople(term.reviewers);
  const editorial = { ...term, authors, reviewers };
  const backlinks = backlinksForTerm(term.slug);

  return (
    <>
      <div className="border-b border-stone-200 bg-white">
        <Container className="py-8 lg:py-10">
          <Breadcrumbs
            items={[
              { name: 'Sözlük', href: routes.glossary() },
              { name: term.term, href: term.url },
            ]}
          />
          <div className="mt-5 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-copper-700">
              Madencilik sözlüğü
              {category && (
                <>
                  {' · '}
                  <Link href={routes.topic(category.slug)} className="hover:underline">
                    {category.name}
                  </Link>
                </>
              )}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-graphite-950 sm:text-4xl">
              {term.term}
            </h1>
            {(term.english || term.abbreviation || term.aliases.length > 0) && (
              <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-graphite-600">
                {term.english && (
                  <div className="flex gap-1.5">
                    <dt className="font-medium">İngilizce:</dt>
                    <dd lang="en" className="italic">
                      {term.english}
                    </dd>
                  </div>
                )}
                {term.abbreviation && (
                  <div className="flex gap-1.5">
                    <dt className="font-medium">Kısaltma:</dt>
                    <dd>{term.abbreviation}</dd>
                  </div>
                )}
                {term.aliases.length > 0 && (
                  <div className="flex gap-1.5">
                    <dt className="font-medium">Diğer adlar:</dt>
                    <dd>{term.aliases.join(', ')}</dd>
                  </div>
                )}
              </dl>
            )}
            <p className="mt-5 border-l-4 border-copper-500 pl-4 text-lg leading-8 text-graphite-900">
              {term.definition}
            </p>
            <EditorialMeta data={editorial} />
            <StatusNotice status={term.status} aiAssisted={term.aiAssisted} />
            <CorrectionNotice corrections={term.corrections} />
          </div>
        </Container>
      </div>

      <Container className="py-8 lg:py-10">
        <div className="max-w-3xl">
          {term.body.trim().length > 0 && <Prose html={term.html} />}
          <SourceList sources={resolveSources(term)} />
          <ReviewInfo data={editorial} pageTitle={term.term} pagePath={term.url} />
          <RelatedContent
            calculators={uniqueBySlug([
              ...resolveCalculators(term.relatedCalculators),
              ...backlinks.calculators,
            ])}
            articles={uniqueBySlug([
              ...resolveArticles(term.relatedArticles),
              ...backlinks.articles,
            ]).slice(0, 6)}
            terms={resolveTerms(term.relatedTerms)}
          />
        </div>
      </Container>

      <JsonLd data={termSchema(term)} />
    </>
  );
}
