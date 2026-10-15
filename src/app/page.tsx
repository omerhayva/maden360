import Link from 'next/link';
import { ArrowRight, BookA, ClipboardCheck, Library, Sigma } from 'lucide-react';
import { ArticleCard, CalculatorCard } from '@/components/content/Cards';
import { Container } from '@/components/layout/Container';
import { SearchForm } from '@/components/search/SearchForm';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { siteConfig } from '@/config/site';
import { plannedCalculators } from '@/config/roadmap';
import { routes } from '@/i18n/routes';
import {
  categoryCounts,
  getArticles,
  getCalculators,
  getCategories,
  getCategory,
  getTerms,
} from '@/lib/content';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata({
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  path: routes.home(),
  absoluteTitle: true,
});

const principles = [
  {
    icon: Library,
    title: 'Her bilgi kaynağına bağlı',
    text: 'Teknik iddialar numaralı kaynaklarla desteklenir. Resmî kurum ve mevzuat kaynakları önceliklidir; erişim tarihleri gösterilir.',
  },
  {
    icon: ClipboardCheck,
    title: 'Teknik inceleme ve tarih',
    text: 'Her içerikte yazar, teknik inceleyen, ilk yayın ve son gözden geçirme tarihi yer alır. İncelenmeyen içerik yayımlanmaz.',
  },
  {
    icon: Sigma,
    title: 'Açık formül, test edilmiş hesap',
    text: 'Hesaplayıcılar formülü, birimleri, varsayımları ve sınırları açıkça gösterir; bilinen örneklerle otomatik test edilir.',
  },
];

export default function HomePage() {
  const calculators = getCalculators();
  const articles = getArticles().slice(0, 6);
  const categories = getCategories();
  const terms = getTerms().slice(0, 14);

  return (
    <>
      {/* Hero */}
      <section className="contour-bg relative overflow-hidden bg-graphite-900 text-white">
        <Container className="relative py-14 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-copper-400">
            Türkiye madencilik bilgi ve hesaplama platformu
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Madencilik için kaynaklı bilgi, test edilmiş hesaplamalar
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-graphite-200">
            Maden mühendisleri, teknikerler, cevher hazırlama çalışanları, öğrenciler ve saha
            ekipleri için formülleri açıklanmış hesaplayıcılar, kaynak gösterilen teknik rehberler
            ve madencilik sözlüğü.
          </p>
          <div className="mt-8 max-w-2xl">
            <SearchForm variant="hero" id="hero-search" />
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-graphite-300">Sık arananlar:</span>
              {siteConfig.popularSearches.map((term) => (
                <Link
                  key={term}
                  href={routes.search(term)}
                  className="inline-flex min-h-9 items-center rounded-full border border-graphite-600 px-3 text-graphite-100 hover:border-copper-400 hover:text-white"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Hesaplayıcılar */}
      <Container className="py-14">
        <section aria-labelledby="hesaplayicilar">
          <SectionHeading
            id="hesaplayicilar"
            title="Hesaplayıcılar"
            description="Birimleri ve varsayımları açık, hatalı girdiye karşı korumalı, otomatik testli araçlar."
            href={routes.calculators()}
            linkLabel="Tüm hesaplayıcılar"
          />
          {calculators.length > 0 ? (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {calculators.map((calculator) => (
                <li key={calculator.slug}>
                  <CalculatorCard
                    title={calculator.shortTitle}
                    summary={calculator.summary}
                    url={calculator.url}
                    status={calculator.status}
                    categoryName={getCategory(calculator.category)?.name}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6">
              <EmptyState title="Hesaplayıcılar teknik incelemede">
                İlk dört hesaplayıcı (tonaj–hacim, dekapaj oranı, kütle verimi ve kazanım, vardiya
                performansı) formül ve kaynak incelemesi tamamlandığında burada yayımlanacak.
              </EmptyState>
            </div>
          )}
          <p className="mt-4 text-sm text-graphite-600">
            Yakında: {plannedCalculators.map((item) => item.title.split(' (')[0]).join(' · ')}
          </p>
        </section>
      </Container>

      {/* Konular */}
      <section aria-labelledby="konular" className="border-y border-stone-200 bg-white">
        <Container className="py-14">
          <SectionHeading
            id="konular"
            title="Konulara göre göz atın"
            description="Yöntemlerden mevzuata, madenciliğin temel alanları."
            href={routes.topics()}
            linkLabel="Tüm konular"
          />
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => {
              const counts = categoryCounts(category.slug);
              const total = counts.articles + counts.calculators + counts.terms;
              return (
                <li key={category.slug}>
                  <Link
                    href={routes.topic(category.slug)}
                    className="flex h-full min-h-16 items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4 hover:border-copper-300 hover:bg-white"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-graphite-900 text-copper-400">
                      <CategoryIcon icon={category.icon} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-graphite-950">{category.name}</span>
                      <span className="block text-xs text-graphite-500">
                        {total > 0 ? `${total} içerik` : 'Hazırlanıyor'}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      {/* Makaleler */}
      <Container className="py-14">
        <section aria-labelledby="son-makaleler">
          <SectionHeading
            id="son-makaleler"
            title="Bilgi merkezinden"
            description="Kaynak gösterilen, teknik incelemeden geçen rehber makaleler."
            href={routes.articles()}
            linkLabel="Tüm makaleler"
          />
          {articles.length > 0 ? (
            <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
          ) : (
            <div className="mt-6">
              <EmptyState title="Makaleler teknik incelemede">
                İlk makaleler kaynak doğrulaması ve uzman incelemesi tamamlandığında yayımlanacak.
              </EmptyState>
            </div>
          )}
        </section>
      </Container>

      {/* Güven ilkeleri */}
      <section aria-labelledby="ilkeler" className="bg-graphite-950 text-white">
        <Container className="py-14">
          <h2 id="ilkeler" className="text-2xl font-bold tracking-tight">
            Güvenilirlik ilkelerimiz
          </h2>
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {principles.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-xl border border-graphite-800 bg-graphite-900 p-6">
                <Icon aria-hidden="true" className="h-6 w-6 text-copper-400" />
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-graphite-300">{text}</p>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link
              href={routes.sourcePolicy()}
              className="inline-flex min-h-11 items-center gap-1 font-semibold text-copper-400 hover:underline"
            >
              Kaynak politikası <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              href={routes.correctionPolicy()}
              className="inline-flex min-h-11 items-center gap-1 font-semibold text-copper-400 hover:underline"
            >
              Düzeltme politikası <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </section>

      {/* Sözlük */}
      <Container className="py-14">
        <section aria-labelledby="sozlukten">
          <SectionHeading
            id="sozlukten"
            title="Madencilik sözlüğü"
            description="Resmî tanımlar ve İngilizce karşılıklarıyla terimler."
            href={routes.glossary()}
            linkLabel="Sözlüğe git"
          />
          {terms.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-2">
              {terms.map((term) => (
                <li key={term.slug}>
                  <Link
                    href={term.url}
                    className="inline-flex min-h-10 items-center gap-2 rounded-md border border-stone-200 bg-white px-3 text-sm font-medium text-graphite-800 hover:border-copper-300 hover:text-copper-800"
                  >
                    <BookA aria-hidden="true" className="h-4 w-4 text-copper-600" />
                    {term.term}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6">
              <EmptyState title="Sözlük teknik incelemede">
                Terimler incelendikçe burada yayımlanacak.
              </EmptyState>
            </div>
          )}
        </section>
      </Container>
    </>
  );
}
