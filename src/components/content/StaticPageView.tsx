import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { panel } from '@/components/ui/card';
import { siteConfig } from '@/config/site';
import { routes, staticPageFiles, type StaticPageKey } from '@/i18n/routes';
import { getPage } from '@/lib/content';
import { formatDate } from '@/lib/format';
import { pageMetadata } from '@/lib/seo/metadata';
import { Prose } from './Prose';

export function staticPageMetadata(key: StaticPageKey): Metadata {
  const page = getPage(staticPageFiles[key]);
  return pageMetadata({
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? page.summary,
    path: routes[key](),
  });
}

/** Hakkımızda ve iletişim sayfaları */
export function StaticPageView({ pageKey }: { pageKey: StaticPageKey }) {
  const page = getPage(staticPageFiles[pageKey]);
  const path = routes[pageKey]();
  return (
    <>
      <PageHeader title={page.title} description={page.summary} breadcrumbs={[{ name: page.title, href: path }]} />
      <Container className="py-8 lg:py-10">
        <div className="max-w-3xl">
          {pageKey === 'contact' && (
            <p className={`${panel} mb-8 px-5 py-4`}>
              <span className="block text-sm text-graphite-600">E-posta</span>
              <a
                href={`mailto:${siteConfig.contactEmail}`}
                className="inline-flex min-h-11 items-center text-lg font-semibold break-all text-copper-700 underline underline-offset-4 ui-hover:text-copper-900"
              >
                {siteConfig.contactEmail}
              </a>
            </p>
          )}
          <Prose html={page.html} />
          <p className="mt-10 border-t border-stone-300 pt-4 text-sm text-graphite-600">
            Son güncelleme: {formatDate(page.updatedAt)}
          </p>
        </div>
      </Container>
    </>
  );
}
