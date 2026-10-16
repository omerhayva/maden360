import Link from 'next/link';
import { LogoMark, Wordmark } from '@/components/brand/Logo';
import { siteConfig } from '@/config/site';
import { mainNav, trustNav } from '@/i18n/navigation';
import { optionalPageFiles, routes } from '@/i18n/routes';
import { getOptionalPage } from '@/lib/content';

export function SiteFooter() {
  const year = new Date().getFullYear();
  const rulesPublished = Boolean(getOptionalPage(optionalPageFiles.listingRules));
  const privacyPublished = Boolean(getOptionalPage(optionalPageFiles.privacy));
  const sectorLinks = [
    ...mainNav,
    { href: routes.candidates(), label: 'Aday Profilleri' },
    { href: routes.postListing(), label: 'İlan ver' },
  ];
  const trustLinks = [
    ...trustNav,
    ...(rulesPublished ? [{ href: routes.listingRules(), label: 'İlan kuralları' }] : []),
    ...(privacyPublished ? [{ href: routes.privacy(), label: 'KVKK aydınlatma metni' }] : []),
  ];
  return (
    <footer className="no-print mt-16 bg-graphite-950 text-graphite-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.6fr_1fr_1fr] lg:px-8">
        <div>
          <Link href={routes.home()} className="inline-flex items-center gap-2.5 text-white">
            <LogoMark className="h-8 w-8" />
            <Wordmark className="text-lg font-bold tracking-tight" />
          </Link>
          <p className="mt-4 max-w-md text-sm leading-6">{siteConfig.description}</p>
          <p className="mt-4 max-w-md text-xs leading-5 text-graphite-400">
            Fuar standları ve ilanlar, sahiplerinin beyanıdır ve editör kontrolünden sonra
            yayımlanır; {siteConfig.name} alım-satıma ve işe alıma taraf değildir, ödeme almaz.
          </p>
        </div>
        <nav aria-label="Sektör ağı">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white">Sektör ağı</h2>
          <ul className="mt-3 space-y-1">
            {sectorLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-9 items-center text-sm hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Kurumsal">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white">Kurumsal</h2>
          <ul className="mt-3 space-y-1">
            {trustLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-9 items-center text-sm hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-graphite-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-graphite-400 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {year} {siteConfig.name}
          </p>
          <p>Mevzuatın güncel ve resmî metni için Resmî Gazete ve mevzuat.gov.tr esas alınır.</p>
        </div>
      </div>
    </footer>
  );
}
