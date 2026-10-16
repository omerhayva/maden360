import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { SearchForm } from '@/components/search/SearchForm';
import { tileClasses } from '@/components/ui/card';
import { mainNav } from '@/i18n/navigation';
import { routes } from '@/i18n/routes';

export const metadata = {
  title: 'Sayfa bulunamadı',
  description: 'Aradığınız sayfa bulunamadı. Arama yapabilir veya ana bölümlere göz atabilirsiniz.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <Container className="py-16 sm:py-24">
      <div data-not-found="true" hidden />
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-copper-700">Hata 404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-graphite-950 sm:text-4xl">
          Sayfa bulunamadı
        </h1>
        <p className="mt-4 text-lg leading-8 text-graphite-700">
          Aradığınız sayfa taşınmış, kaldırılmış ya da henüz yayımlanmamış olabilir. Aşağıdan arama
          yapabilir veya ana bölümlere göz atabilirsiniz.
        </p>
        <div className="mt-8">
          <SearchForm id="not-found-search" />
        </div>
        <ul className="mt-8 grid gap-3 sm:grid-cols-3">
          {mainNav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={`${tileClasses()} min-h-16`}>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-graphite-950 group-hover:text-copper-800">
                    {item.label}
                  </span>
                  {item.description && (
                    <span className="block text-sm text-graphite-600">{item.description}</span>
                  )}
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-graphite-400 group-hover:text-copper-600"
                />
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-graphite-600">
          Bir bağlantının hatalı olduğunu düşünüyorsanız{' '}
          <Link
            href={routes.contact()}
            className="font-semibold text-copper-700 underline underline-offset-4 ui-hover:text-copper-800"
          >
            bize bildirin
          </Link>
          .
        </p>
      </div>
    </Container>
  );
}
