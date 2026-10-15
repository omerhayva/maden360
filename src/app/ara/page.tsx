import { Suspense } from 'react';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchClient } from '@/components/search/SearchClient';
import { routes } from '@/i18n/routes';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata({
  title: 'Arama',
  description: 'Hesaplayıcılarda, bilgi merkezindeki makalelerde ve madencilik sözlüğünde arayın.',
  path: routes.search(),
  // Arama sonuç sayfaları arama motorlarında dizine eklenmez.
  noindex: true,
});

function SearchFallback() {
  return (
    <div aria-hidden="true">
      <div className="h-14 w-full animate-pulse rounded-lg border border-graphite-200 bg-white" />
      <div className="mt-6 h-4 w-48 rounded bg-stone-200" />
    </div>
  );
}

export default function SearchPage() {
  return (
    <>
      <PageHeader
        title="Arama"
        description="Hesaplayıcılarda, makalelerde ve sözlükte arayın. Türkçe karakter kullanmadan da arama yapabilirsiniz."
        breadcrumbs={[{ name: 'Arama', href: routes.search() }]}
      />
      <Container className="py-8">
        <div className="max-w-4xl">
          <Suspense fallback={<SearchFallback />}>
            <SearchClient />
          </Suspense>
        </div>
      </Container>
    </>
  );
}
