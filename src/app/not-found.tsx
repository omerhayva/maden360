import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { SearchForm } from '@/components/search/SearchForm';
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
              <Link
                href={item.href}
                className="flex min-h-14 flex-col justify-center rounded-xl border border-stone-200 bg-white px-4 py-3 hover:border-copper-300"
              >
                <span className="font-semibold text-graphite-950">{item.label}</span>
                {item.description && (
                  <span className="text-sm text-graphite-600">{item.description}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-graphite-600">
          Bir bağlantının hatalı olduğunu düşünüyorsanız{' '}
          <Link href={routes.contact()} className="font-semibold text-copper-700 hover:underline">
            bize bildirin
          </Link>
          .
        </p>
      </div>
    </Container>
  );
}
