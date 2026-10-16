import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { LogoMark, Wordmark } from '@/components/brand/Logo';
import { SearchForm } from '@/components/search/SearchForm';
import { ButtonLink, IconLink } from '@/components/ui/Button';
import { siteConfig } from '@/config/site';
import { routes } from '@/i18n/routes';
import { MobileMenu } from './MobileMenu';
import { NavLinks } from './NavLinks';

/** Üst bilgi (yapışkan, 4rem): logo, ana menü, arama ve "İlan ver". */
export function SiteHeader() {
  return (
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

        <nav aria-label="Ana menü" className="ml-4 hidden lg:block">
          <NavLinks />
        </nav>

        <div className="ml-auto hidden w-full max-w-xs md:block">
          <SearchForm variant="header" id="header-search" />
        </div>

        {/* Görünürlük kapsayıcıda: düğmenin kendi "inline-flex" sınıfıyla çakışmasın */}
        <div className="hidden shrink-0 lg:block">
          <ButtonLink href={routes.postListing()} size="sm" icon={Plus}>
            İlan ver
          </ButtonLink>
        </div>

        <IconLink
          href={routes.search()}
          label="Ara"
          icon={Search}
          variant="ghost-inverse"
          className="ml-auto md:hidden"
        />
        <MobileMenu />
      </div>
    </header>
  );
}
