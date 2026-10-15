import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  CorrectionNotice,
  EditorialMeta,
  LegalInfo,
  ReviewInfo,
  StatusNotice,
} from '@/components/content/Editorial';
import { Prose } from '@/components/content/Prose';
import { RelatedContent } from '@/components/content/RelatedContent';
import { SourceList } from '@/components/content/SourceList';
import { MobileTableOfContents, TableOfContents } from '@/components/content/TableOfContents';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Container } from '@/components/layout/Container';
import { JsonLd } from '@/components/seo/JsonLd';
import { routes } from '@/i18n/routes';
import {
  getArticle,
  getArticles,
  getCategory,
  relatedArticlesFor,
  resolveCalculators,
  resolvePeople,
  resolveSources,
  resolveTerms,
} from '@/lib/content';
import { pageMetadata } from '@/lib/seo/metadata';
import { slugParams } from '@/lib/static-params';
import { articleSchema } from '@/lib/seo/structured-data';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return slugParams(getArticles().map((article) => article.slug));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = getArticle((await params).slug);
  if (!article) return {};
  return pageMetadata({
    title: article.seoTitle ?? article.title,
    description: article.seoDescription ?? article.summary,
    path: article.url,
    type: 'article',
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt ?? article.reviewedAt,
    noindex: article.status !== 'published',
    keywords: article.keywords,
  });
}

export default async function ArticlePage({ params }: Props) {
  const article = getArticle((await params).slug);
  if (!article) notFound();

  const category = getCategory(article.category);
  const authors = resolvePeople(article.authors);
  const reviewers = resolvePeople(article.reviewers);
  const sources = resolveSources(article);
  const editorial = { ...article, authors, reviewers };
  const toc = [
    ...article.toc,
    { id: 'kaynaklar', text: 'Kaynaklar', depth: 2 as const },
    { id: 'inceleme-bilgisi', text: 'İnceleme ve sürüm bilgisi', depth: 2 as const },
  ];

  return (
    <>
      <div className="border-b border-stone-200 bg-white">
        <Container className="py-8 lg:py-10">
          <Breadcrumbs
            items={[
              { name: 'Bilgi Merkezi', href: routes.articles() },
              ...(category ? [{ name: category.name, href: routes.topic(category.slug) }] : []),
              { name: article.title, href: article.url },
            ]}
          />
          <div className="mt-5 max-w-3xl">
            {category && (
              <Link
                href={routes.topic(category.slug)}
                className="text-sm font-semibold uppercase tracking-wide text-copper-700 hover:underline"
              >
                {category.name}
              </Link>
            )}
            <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-graphite-950 sm:text-4xl">
              {article.title}
            </h1>
            <p className="mt-4 text-base leading-7 text-graphite-700 sm:text-lg sm:leading-8">
              {article.summary}
            </p>
            <EditorialMeta data={editorial} readingMinutes={article.readingMinutes} />
            <StatusNotice status={article.status} aiAssisted={article.aiAssisted} />
            <CorrectionNotice corrections={article.corrections} />
          </div>
        </Container>
      </div>

      <Container className="py-8 lg:py-12">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-12">
          <div className="min-w-0">
            <MobileTableOfContents entries={toc} />
            <LegalInfo instruments={article.legal} />
            <Prose html={article.html} className="mt-6" />
            <SourceList sources={sources} />
            <ReviewInfo data={editorial} pageTitle={article.title} pagePath={article.url} />
            <RelatedContent
              calculators={resolveCalculators(article.relatedCalculators)}
              terms={resolveTerms(article.relatedTerms)}
              articles={relatedArticlesFor(article)}
            />
          </div>
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <TableOfContents entries={toc} />
            </div>
          </aside>
        </div>
      </Container>

      <JsonLd
        data={articleSchema(
          article,
          authors,
          reviewers,
          sources.map((item) => item.source),
        )}
      />
    </>
  );
}
