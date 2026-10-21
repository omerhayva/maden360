import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { SearchForm } from '@/components/search/SearchForm';
import { listPanel } from '@/components/ui/card';
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
        <h1 className="text-3xl leading-tight font-semibold text-graphite-950 sm:text-4xl">
          Sayfa bulunamadı
        </h1>
        <p className="mt-3 text-lg leading-8 text-graphite-700">
          Bu adreste bir sayfa yok (hata 404). Sayfa taşınmış, kaldırılmış ya da henüz yayımlanmamış
          olabilir. Arama yapabilir veya aşağıdaki bölümlerden birine geçebilirsiniz.
        </p>
        <div className="mt-8">
          <SearchForm id="not-found-search" />
        </div>
        <ul className={`mt-8 ${listPanel}`}>
          {mainNav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group block px-4 py-3 transition-colors duration-100 ui-hover:bg-stone-50 ui-active:bg-stone-100"
              >
                <span className="block font-semibold text-graphite-950 underline-offset-4 group-hover:underline">
                  {item.label}
                </span>
                {item.description && (
                  <span className="block text-sm text-graphite-600">{item.description}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-graphite-600">
          Bir bağlantının hatalı olduğunu düşünüyorsanız{' '}
          <Link
            href={routes.contact()}
            className="font-medium text-copper-700 underline underline-offset-4 ui-hover:text-copper-900"
          >
            bize bildirin
          </Link>
          .
        </p>
      </div>
    </Container>
  );
}
