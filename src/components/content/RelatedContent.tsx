import Link from 'next/link';
import { BookA, BookOpen, Calculator } from 'lucide-react';
import type { Article, CalculatorContent, Term } from '@/lib/content';

interface RelatedContentProps {
  calculators?: CalculatorContent[];
  terms?: Term[];
  articles?: Article[];
}

/** İçerikler arası bağlantılar: hesaplayıcı ↔ makale ↔ sözlük */
export function RelatedContent({ calculators = [], terms = [], articles = [] }: RelatedContentProps) {
  if (calculators.length + terms.length + articles.length === 0) return null;
  return (
    <section aria-labelledby="ilgili-icerik" className="no-print mt-12">
      <h2 id="ilgili-icerik" className="text-2xl font-bold tracking-tight text-graphite-950">
        İlgili içerikler
      </h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {calculators.length > 0 && (
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-graphite-600">
              <Calculator aria-hidden="true" className="h-4 w-4 text-copper-600" />
              Hesaplayıcılar
            </h3>
            <ul className="mt-3 space-y-1">
              {calculators.map((item) => (
                <li key={item.slug}>
                  <Link href={item.url} className="inline-flex min-h-10 items-center font-medium text-copper-700 hover:underline">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        {articles.length > 0 && (
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-graphite-600">
              <BookOpen aria-hidden="true" className="h-4 w-4 text-copper-600" />
              Makaleler
            </h3>
            <ul className="mt-3 space-y-1">
              {articles.map((item) => (
                <li key={item.slug}>
                  <Link href={item.url} className="inline-flex min-h-10 items-center font-medium text-copper-700 hover:underline">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        {terms.length > 0 && (
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-graphite-600">
              <BookA aria-hidden="true" className="h-4 w-4 text-copper-600" />
              Sözlük
            </h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {terms.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={item.url}
                    className="inline-flex min-h-10 items-center rounded-md border border-stone-200 bg-stone-50 px-3 text-sm font-medium text-graphite-800 hover:border-copper-300 hover:text-copper-800"
                  >
                    {item.term}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
