import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FlaskConical } from 'lucide-react';
import { CalculatorWidget } from '@/components/calculator/CalculatorWidget';
import { FormulaList, InputsTable } from '@/components/calculator/FormulaList';
import {
  EditorialMeta,
  ReviewInfo,
  StatusNotice,
  CorrectionNotice,
} from '@/components/content/Editorial';
import { Prose } from '@/components/content/Prose';
import { RelatedContent } from '@/components/content/RelatedContent';
import { SourceList } from '@/components/content/SourceList';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Container } from '@/components/layout/Container';
import { JsonLd } from '@/components/seo/JsonLd';
import { Callout } from '@/components/ui/Callout';
import { getCalculatorDefinition } from '@/calculators/registry';
import { routes } from '@/i18n/routes';
import {
  getCalculator,
  getCalculators,
  getCategory,
  relatedArticlesFor,
  resolvePeople,
  resolveSources,
  resolveTerms,
} from '@/lib/content';
import { pageMetadata } from '@/lib/seo/metadata';
import { slugParams } from '@/lib/static-params';
import { calculatorSchema } from '@/lib/seo/structured-data';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return slugParams(getCalculators().map((calculator) => calculator.slug));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const calculator = getCalculator((await params).slug);
  if (!calculator) return {};
  return pageMetadata({
    title: calculator.seoTitle ?? calculator.title,
    description: calculator.seoDescription ?? calculator.summary,
    path: calculator.url,
    noindex: calculator.status !== 'published',
    keywords: calculator.keywords,
  });
}

export default async function CalculatorPage({ params }: Props) {
  const calculator = getCalculator((await params).slug);
  if (!calculator) notFound();
  const definition = getCalculatorDefinition(calculator.slug);
  if (!definition) notFound();

  const category = getCategory(calculator.category);
  const authors = resolvePeople(calculator.authors);
  const reviewers = resolvePeople(calculator.reviewers);
  const editorial = { ...calculator, authors, reviewers };

  return (
    <>
      <div className="border-b border-stone-200 bg-white">
        <Container className="py-8 lg:py-10">
          <Breadcrumbs
            items={[
              { name: 'Hesaplamalar', href: routes.calculators() },
              { name: calculator.shortTitle, href: calculator.url },
            ]}
          />
          <div className="mt-5 max-w-3xl">
            {category && (
              <Link
                href={routes.topic(category.slug)}
                className="text-sm font-semibold uppercase tracking-wide text-copper-700 hover:underline"
              >
                {category.name}
              </Link>
            )}
            <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-graphite-950 sm:text-4xl">
              {calculator.title}
            </h1>
            <p className="mt-4 text-base leading-7 text-graphite-700 sm:text-lg sm:leading-8">
              {calculator.summary}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-md bg-stone-100 px-3 py-1.5 text-sm text-graphite-700">
              <FlaskConical aria-hidden="true" className="h-4 w-4 text-copper-600" />
              Hesap motoru sürüm {definition.version} · bilinen örneklerle test edilir
            </div>
            <EditorialMeta data={editorial} />
            <StatusNotice status={calculator.status} aiAssisted={calculator.aiAssisted} />
            <CorrectionNotice corrections={calculator.corrections} />
          </div>
        </Container>
      </div>

      <Container className="py-8 lg:py-10">
        <CalculatorWidget slug={calculator.slug} />

        <Callout variant="safety" title="Kullanım notu" className="mt-6">
          Sonuçlar girdilerin doğruluğuna ve aşağıdaki varsayımlara bağlıdır. Bu araç bilgilendirme
          ve ön değerlendirme amaçlıdır; işletme, tasarım ve güvenlik kararları yetkili mühendis
          değerlendirmesiyle ve ilgili mevzuata göre verilmelidir.
        </Callout>

        <div className="mt-12 max-w-4xl space-y-12">
          <section aria-labelledby="formuller">
            <h2 id="formuller" className="text-2xl font-bold tracking-tight text-graphite-950">
              Formüller
            </h2>
            <div className="mt-4">
              <FormulaList definition={definition} />
            </div>
          </section>

          <section aria-labelledby="varsayimlar">
            <h2 id="varsayimlar" className="text-2xl font-bold tracking-tight text-graphite-950">
              Varsayımlar ve sınırlar
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-stone-200 bg-white p-5">
                <h3 className="font-semibold text-graphite-950">Varsayımlar</h3>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-graphite-700 marker:text-copper-500">
                  {definition.assumptions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-stone-200 bg-white p-5">
                <h3 className="font-semibold text-graphite-950">Sınırlar</h3>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-graphite-700 marker:text-copper-500">
                  {definition.limitations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section aria-labelledby="girdiler-birimler">
            <h2
              id="girdiler-birimler"
              className="text-2xl font-bold tracking-tight text-graphite-950"
            >
              Girdiler ve birimler
            </h2>
            <p className="mt-2 text-sm text-graphite-600">
              Ondalık ayırıcı olarak virgül veya nokta kullanabilirsiniz (2,65 veya 2.65). Binlik
              ayırıcı kullanmanız gerekmez.
            </p>
            <InputsTable definition={definition} />
          </section>

          <Prose html={calculator.html} />
        </div>

        <div className="max-w-4xl">
          <SourceList sources={resolveSources(calculator)} />
          <ReviewInfo
            data={editorial}
            pageTitle={calculator.title}
            pagePath={calculator.url}
            engineVersion={definition.version}
          />
          <RelatedContent
            terms={resolveTerms(calculator.relatedTerms)}
            articles={relatedArticlesFor(calculator)}
          />
        </div>
      </Container>

      <JsonLd data={calculatorSchema(calculator)} />
    </>
  );
}
