import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { routes } from '@/i18n/routes';
import { categoryCounts, getCategories } from '@/lib/content';
import { pageMetadata } from '@/lib/seo/metadata';

const title = 'Konular';
const description =
  'Madencilik yöntemleri, tahkimat, havalandırma, nakliyat, jeoloji, cevher hazırlama, üretim planlama ve mevzuat konularındaki tüm makale, hesaplayıcı ve terimler.';

export const metadata = pageMetadata({ title, description, path: routes.topics() });

export default function TopicsPage() {
  const categories = getCategories();
  return (
    <>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={[{ name: title, href: routes.topics() }]}
      />
      <Container className="py-10">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const counts = categoryCounts(category.slug);
            return (
              <li key={category.slug}>
                <Link
                  href={routes.topic(category.slug)}
                  className="flex h-full flex-col rounded-xl border border-stone-200 bg-white p-5 shadow-sm hover:border-copper-300"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-graphite-900 text-copper-400">
                    <CategoryIcon icon={category.icon} className="h-5 w-5" />
                  </span>
                  <h2 className="mt-4 text-lg font-semibold text-graphite-950">{category.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-graphite-600">{category.description}</p>
                  <p className="mt-auto pt-4 text-xs font-medium text-graphite-500">
                    {counts.articles} makale · {counts.calculators} hesaplayıcı · {counts.terms}{' '}
                    terim
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </>
  );
}
