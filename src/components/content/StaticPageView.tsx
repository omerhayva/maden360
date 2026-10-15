import type { Metadata } from 'next';
import { Mail } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
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

/** Hakkımızda, kaynak politikası, düzeltme politikası ve iletişim sayfaları */
export function StaticPageView({ pageKey }: { pageKey: StaticPageKey }) {
  const page = getPage(staticPageFiles[pageKey]);
  const path = routes[pageKey]();
  return (
    <>
      <PageHeader title={page.title} description={page.summary} breadcrumbs={[{ name: page.title, href: path }]} />
      <Container className="py-10">
        <div className="max-w-3xl">
          {pageKey === 'contact' && (
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="mb-8 flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-5 hover:border-copper-300"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-graphite-900 text-copper-400">
                <Mail aria-hidden="true" className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm text-graphite-600">E-posta</span>
                <span className="block text-lg font-semibold text-graphite-950">{siteConfig.contactEmail}</span>
              </span>
            </a>
          )}
          <Prose html={page.html} />
          <p className="mt-10 border-t border-stone-200 pt-4 text-sm text-graphite-600">
            Son güncelleme: {formatDate(page.updatedAt)}
          </p>
        </div>
      </Container>
    </>
  );
}
