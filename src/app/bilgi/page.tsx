import Link from 'next/link';
import { ArticleCard } from '@/components/content/Cards';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { EmptyState } from '@/components/ui/EmptyState';
import { routes } from '@/i18n/routes';
import { categoryCounts, getArticles, getCategories, getCategory } from '@/lib/content';
import { pageMetadata } from '@/lib/seo/metadata';

const title = 'Bilgi Merkezi';
const description =
  'Madencilik yöntemleri, tahkimat, havalandırma, nakliyat, jeoloji, cevher hazırlama, üretim planlama ve mevzuat üzerine kaynaklı teknik makaleler.';

export const metadata = pageMetadata({ title, description, path: routes.articles() });

export default function ArticlesPage() {
  const articles = getArticles();
  const categories = getCategories();
  return (
    <>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={[{ name: title, href: routes.articles() }]}
      >
        <nav aria-label="Konular" className="mt-6">
          <ul className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const count = categoryCounts(category.slug).articles;
              return (
                <li key={category.slug}>
                  <Link
                    href={routes.topic(category.slug)}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full border border-stone-300 bg-stone-50 px-3 text-sm font-medium text-graphite-800 hover:border-copper-400 hover:text-copper-800"
                  >
                    <CategoryIcon icon={category.icon} className="h-4 w-4 text-copper-600" />
                    {category.name}
                    <span className="text-graphite-500">{count}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </PageHeader>
      <Container className="py-10">
        {articles.length > 0 ? (
          <>
            <h2 className="sr-only">Tüm makaleler</h2>
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <li key={article.slug}>
                  <ArticleCard
                    title={article.title}
                    summary={article.summary}
                    url={article.url}
                    categoryName={getCategory(article.category)?.name}
                    status={article.status}
                    readingMinutes={article.readingMinutes}
                    reviewedAt={article.reviewedAt}
                  />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <EmptyState title="Henüz yayımlanmış makale yok">
            Makaleler kaynak doğrulaması ve teknik inceleme tamamlandıkça burada listelenecek. Bu
            sürede{' '}
            <Link
              href={routes.glossary()}
              className="font-semibold text-copper-700 hover:underline"
            >
              sözlüğe
            </Link>{' '}
            ve{' '}
            <Link
              href={routes.calculators()}
              className="font-semibold text-copper-700 hover:underline"
            >
              hesaplayıcılara
            </Link>{' '}
            göz atabilirsiniz.
          </EmptyState>
        )}
      </Container>
    </>
  );
}
