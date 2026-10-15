import Link from 'next/link';
import { CircleCheck, ShieldCheck, TriangleAlert } from 'lucide-react';
import { CalculatorCard } from '@/components/content/Cards';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { plannedCalculators } from '@/config/roadmap';
import { routes } from '@/i18n/routes';
import { getCalculators, getCategory } from '@/lib/content';
import { pageMetadata } from '@/lib/seo/metadata';

const title = 'Hesaplamalar';
const description =
  'Tonaj–hacim, dekapaj oranı, kütle verimi ve metal kazanımı, vardiya üretim performansı: formülleri, birimleri ve varsayımları açık, test edilmiş madencilik hesaplayıcıları.';

export const metadata = pageMetadata({ title, description, path: routes.calculators() });

const qualityRules = [
  'Formül, semboller ve birimler açıkça gösterilir.',
  'Eksik, geçersiz ve sıfıra bölme oluşturan girdiler engellenir.',
  'Farklı bazlar (ör. ton ve m³) karıştırılmaz; dönüşüm yoğunlukla açıkça yapılır.',
  'Her araç bilinen örneklerle otomatik test edilir; sürüm numarası sayfada yazar.',
];

export default function CalculatorsPage() {
  const calculators = getCalculators();
  return (
    <>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={[{ name: title, href: routes.calculators() }]}
      />
      <Container className="py-10">
        {calculators.length > 0 ? (
          <>
            <h2 className="sr-only">Hesaplayıcılar</h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          </>
        ) : (
          <EmptyState title="Hesaplayıcılar teknik incelemede">
            Formül ve kaynak incelemesi tamamlandığında ilk dört hesaplayıcı burada yayımlanacak.
          </EmptyState>
        )}

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <section
            aria-labelledby="kalite"
            className="rounded-xl border border-stone-200 bg-white p-6"
          >
            <h2 id="kalite" className="flex items-center gap-2 text-xl font-bold text-graphite-950">
              <ShieldCheck aria-hidden="true" className="h-5 w-5 text-copper-600" />
              Hesaplayıcılarımızı nasıl doğruluyoruz?
            </h2>
            <ul className="mt-4 space-y-2">
              {qualityRules.map((rule) => (
                <li key={rule} className="flex gap-2 text-sm leading-6 text-graphite-700">
                  <CircleCheck
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700"
                  />
                  {rule}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-graphite-600">
              Ayrıntılar:{' '}
              <Link
                href={routes.sourcePolicy()}
                className="font-semibold text-copper-700 hover:underline"
              >
                Kaynak politikası
              </Link>
            </p>
          </section>

          <section
            aria-labelledby="yol-haritasi"
            className="rounded-xl border border-stone-200 bg-white p-6"
          >
            <h2 id="yol-haritasi" className="text-xl font-bold text-graphite-950">
              Planlanan hesaplayıcılar
            </h2>
            <ul className="mt-4 divide-y divide-stone-200">
              {plannedCalculators.map((item) => (
                <li key={item.title} className="py-3">
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-graphite-900">
                    {item.title}
                    <span className="text-xs font-medium text-graphite-500">{item.category}</span>
                  </p>
                  <p className="mt-1 flex gap-1.5 text-sm leading-6 text-graphite-600">
                    {item.safetyCritical && (
                      <TriangleAlert
                        aria-label="Güvenlikle ilişkili"
                        className="mt-1 h-4 w-4 shrink-0 text-amber-600"
                      />
                    )}
                    {item.note}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </Container>
    </>
  );
}
