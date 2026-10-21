import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { Prose } from '@/components/content/Prose';
import { Callout } from '@/components/ui/Callout';
import { optionalPageFiles } from '@/i18n/routes';
import { getOptionalPage } from '@/lib/content';
import { statusLabels } from '@/lib/content/visibility';
import { formatDate } from '@/lib/format';
import { pageMetadata } from '@/lib/seo/metadata';
import { slugParams } from '@/lib/static-params';

/**
 * Yayın durumuna bağlı sayfalar (ilan kuralları, KVKK aydınlatma metni).
 * Yalnızca "published" olduklarında üretim derlemesine girerler; önizlemede her zaman görünürler.
 * Statik klasörü olan sayfalar (hakkimizda, iletisim vb.) bu rotadan önce eşleşir.
 */

type Props = { params: Promise<{ sayfa: string }> };

export const dynamicParams = false;

const SLUGS = Object.values(optionalPageFiles);

export function generateStaticParams() {
  return slugParams(SLUGS.filter((slug) => getOptionalPage(slug))).map(({ slug }) => ({
    sayfa: slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sayfa } = await params;
  const page = SLUGS.includes(sayfa) ? getOptionalPage(sayfa) : undefined;
  if (!page) return {};
  return pageMetadata({
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? page.summary,
    path: `/${page.slug}`,
    noindex: page.status !== 'published',
  });
}

export default async function OptionalPage({ params }: Props) {
  const { sayfa } = await params;
  const page = SLUGS.includes(sayfa) ? getOptionalPage(sayfa) : undefined;
  if (!page) notFound();
  return (
    <>
      <PageHeader
        title={page.title}
        description={page.summary}
        breadcrumbs={[{ name: page.title, href: `/${page.slug}` }]}
      />
      <Container className="py-10">
        <div className="max-w-3xl">
          {page.status !== 'published' && (
            <Callout
              variant="warning"
              title={`Önizleme: bu sayfa yayımlanmadı (${statusLabels[page.status].toLocaleLowerCase('tr')})`}
              className="mb-8"
            >
              Sayfa yayımlanana kadar ilan başvuru formları üretim sitesinde kapalı kalır.
              Yayımlamadan önce metni hukuki açıdan gözden geçirin ve köşeli parantez içindeki
              alanları doldurun.
            </Callout>
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
