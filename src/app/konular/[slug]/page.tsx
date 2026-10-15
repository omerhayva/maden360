import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleCard, CalculatorCard, TermCard } from '@/components/content/Cards';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { routes } from '@/i18n/routes';
import {
  getArticlesByCategory,
  getCalculators,
  getCategories,
  getCategory,
  getTerms,
} from '@/lib/content';
import { pageMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getCategories().map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = getCategory((await params).slug);
  if (!category) return {};
  return pageMetadata({
    title: `${category.name}: makaleler, hesaplayıcılar ve terimler`,
    description: category.description,
    path: routes.topic(category.slug),
  });
}

export default async function TopicPage({ params }: Props) {
  const category = getCategory((await params).slug);
  if (!category) notFound();

  const articles = getArticlesByCategory(category.slug);
  const calculators = getCalculators().filter(
    (calculator) => calculator.category === category.slug,
  );
  const terms = getTerms().filter((term) => term.category === category.slug);
  const isEmpty = articles.length + calculators.length + terms.length === 0;

  return (
    <>
      <PageHeader
        eyebrow="Konu"
        title={category.name}
        description={category.description}
        breadcrumbs={[
          { name: 'Konular', href: routes.topics() },
          { name: category.name, href: routes.topic(category.slug) },
        ]}
      />
      <Container className="space-y-12 py-10">
        {isEmpty && (
          <EmptyState title="Bu konuda yayımlanmış içerik henüz yok">
            İçerikler teknik incelemeden geçtikçe burada listelenecek.{' '}
            <Link href={routes.topics()} className="font-semibold text-copper-700 hover:underline">
              Diğer konulara göz atın
            </Link>
            .
          </EmptyState>
        )}
        {calculators.length > 0 && (
          <section aria-labelledby="konu-hesaplayicilar">
            <h2
              id="konu-hesaplayicilar"
              className="text-2xl font-bold tracking-tight text-graphite-950"
            >
              Hesaplayıcılar
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {calculators.map((calculator) => (
                <li key={calculator.slug}>
                  <CalculatorCard
                    title={calculator.title}
                    summary={calculator.summary}
                    url={calculator.url}
                    status={calculator.status}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
        {articles.length > 0 && (
          <section aria-labelledby="konu-makaleler">
            <h2 id="konu-makaleler" className="text-2xl font-bold tracking-tight text-graphite-950">
              Makaleler
            </h2>
            <ul className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <li key={article.slug}>
                  <ArticleCard
                    title={article.title}
                    summary={article.summary}
                    url={article.url}
                    status={article.status}
                    readingMinutes={article.readingMinutes}
                    reviewedAt={article.reviewedAt}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
        {terms.length > 0 && (
          <section aria-labelledby="konu-terimler">
            <h2 id="konu-terimler" className="text-2xl font-bold tracking-tight text-graphite-950">
              Sözlük terimleri
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {terms.map((term) => (
                <li key={term.slug}>
                  <TermCard
                    term={term.term}
                    english={term.english}
                    definition={term.definition}
                    url={term.url}
                    status={term.status}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>
    </>
  );
}
