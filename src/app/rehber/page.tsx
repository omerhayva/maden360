import Link from 'next/link';
import { BookA, BookOpen, Calculator } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { routes } from '@/i18n/routes';
import { getGuide, type GuideItem } from '@/lib/content';
import { pageMetadata } from '@/lib/seo/metadata';

const title = 'Sektör Rehberi';
const description =
  'Maden türleri ve grupları, üretim yöntemleri, cevherden ürüne süreçler, görev ve sorumluluklar ile temel teknik kavramlar için başlangıç rehberi.';

export const metadata = pageMetadata({ title, description, path: routes.guide() });

const itemMeta: Record<GuideItem['type'], { label: string; icon: typeof BookOpen }> = {
  makale: { label: 'Makale', icon: BookOpen },
  sozluk: { label: 'Terim', icon: BookA },
  hesaplama: { label: 'Hesaplayıcı', icon: Calculator },
};

export default function GuidePage() {
  const sections = getGuide().filter((section) => section.items.length > 0);
  return (
    <>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={[{ name: title, href: routes.guide() }]}
      >
        {sections.length > 0 && (
          <nav aria-label="Rehber bölümleri" className="mt-6">
            <ul className="flex flex-wrap gap-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="inline-flex min-h-10 items-center rounded-full border border-stone-300 bg-stone-50 px-3 text-sm font-medium text-graphite-800 hover:border-copper-400 hover:text-copper-800"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </PageHeader>
      <Container className="space-y-10 py-10">
        {sections.length === 0 && (
          <EmptyState title="Rehber hazırlanıyor">
            Rehber bölümleri, içerikler yayımlandıkça burada görünecek.
          </EmptyState>
        )}
        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`${section.id}-baslik`}
            className="scroll-mt-24"
          >
            <h2
              id={`${section.id}-baslik`}
              className="text-2xl font-bold tracking-tight text-graphite-950"
            >
              {section.title}
            </h2>
            <p className="mt-2 max-w-3xl text-graphite-600">{section.description}</p>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {section.items.map((item) => {
                const meta = itemMeta[item.type];
                const Icon = meta.icon;
                return (
                  <li key={`${item.type}:${item.slug}`}>
                    <Link
                      href={item.url}
                      className="flex h-full gap-3 rounded-xl border border-stone-200 bg-white p-4 hover:border-copper-300"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-copper-700">
                        <Icon aria-hidden="true" className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold uppercase tracking-wide text-graphite-500">
                          {meta.label}
                        </span>
                        <span className="block font-semibold text-graphite-950">{item.title}</span>
                        <span className="mt-1 line-clamp-2 block text-sm leading-6 text-graphite-600">
                          {item.summary}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </Container>
    </>
  );
}
