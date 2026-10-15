import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { LogoMark, Wordmark } from '@/components/brand/Logo';
import { SearchForm } from '@/components/search/SearchForm';
import { siteConfig } from '@/config/site';
import { routes } from '@/i18n/routes';
import { MobileMenu } from './MobileMenu';
import { NavLinks } from './NavLinks';

/**
 * Üst bilgi: logo, arama ve "İlan ver" (yapışkan, 4rem); masaüstünde altında ana menü
 * satırı. Menü satırı sayfayla birlikte kayar, böylece yapışkan alan dar kalır.
 */
export function SiteHeader() {
  return (
    <>
      <header className="no-print sticky top-0 z-40 border-b border-graphite-800 bg-graphite-950 text-white">
        <div className="relative mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            href={routes.home()}
            className="flex shrink-0 items-center gap-2.5 rounded-md py-1"
            aria-label={`${siteConfig.name} ana sayfa`}
          >
            <LogoMark className="h-8 w-8" />
            <Wordmark className="text-lg font-bold tracking-tight" />
          </Link>

          <div className="ml-auto hidden w-full max-w-md md:block">
            <SearchForm variant="header" id="header-search" />
          </div>

          <Link
            href={routes.postListing()}
            className="hidden min-h-10 shrink-0 items-center gap-1.5 rounded-md bg-copper-600 px-3.5 text-sm font-semibold text-white hover:bg-copper-700 lg:inline-flex"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            İlan ver
          </Link>

          <Link
            href={routes.search()}
            className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-md text-graphite-100 hover:bg-graphite-800 md:hidden"
          >
            <Search aria-hidden="true" className="h-5 w-5" />
            <span className="sr-only">Ara</span>
          </Link>
          <MobileMenu />
        </div>
      </header>
      <nav
        aria-label="Ana menü"
        className="no-print hidden border-b border-graphite-800 bg-graphite-900 lg:block"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-6">
          <NavLinks />
        </div>
      </nav>
    </>
  );
}
