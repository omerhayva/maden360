import Link from 'next/link';
import { LogoMark, Wordmark } from '@/components/brand/Logo';
import { siteConfig } from '@/config/site';
import { mainNav, trustNav } from '@/i18n/navigation';
import { optionalPageFiles, routes } from '@/i18n/routes';
import { getOptionalPage } from '@/lib/content';

const linkClass =
  'inline-flex min-h-9 items-center text-sm text-graphite-700 underline-offset-4 pointer-coarse:min-h-11 ui-hover:text-graphite-950 ui-hover:underline';

/** Altbilgi: açık zemin, kısa açıklama, bölüm ve kurumsal bağlantılar. */
export function SiteFooter() {
  const year = new Date().getFullYear();
  const rulesPublished = Boolean(getOptionalPage(optionalPageFiles.listingRules));
  const privacyPublished = Boolean(getOptionalPage(optionalPageFiles.privacy));
  const sectionLinks = [
    ...mainNav,
    { href: routes.candidates(), label: 'İş Arayanlar' },
    { href: routes.postListing(), label: 'İlan ver' },
  ];
  const trustLinks = [
    ...trustNav,
    ...(rulesPublished ? [{ href: routes.listingRules(), label: 'İlan kuralları' }] : []),
    ...(privacyPublished ? [{ href: routes.privacy(), label: 'KVKK aydınlatma metni' }] : []),
  ];
  return (
    <footer className="no-print border-t border-stone-300 bg-white text-graphite-700">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.6fr_1fr_1fr] lg:px-8">
        <div>
          <Link
            href={routes.home()}
            className="inline-flex min-h-11 items-center gap-2 rounded-sm text-graphite-950"
          >
            <LogoMark className="h-7 w-7 text-copper-700" />
            <Wordmark className="text-xl font-bold" />
          </Link>
          <p className="mt-3 max-w-md text-sm leading-6">{siteConfig.footerNote}</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-graphite-600">
            İlanlar ve stand bilgileri sahiplerinin beyanıdır. {siteConfig.name} alım satıma ve işe
            alıma taraf değildir, kimseden ödeme almaz.
          </p>
        </div>
        <nav aria-label="Bölümler">
          <h2 className="text-sm font-semibold text-graphite-950">Bölümler</h2>
          <ul className="mt-2 space-y-0.5">
            {sectionLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Kurumsal">
          <h2 className="text-sm font-semibold text-graphite-950">Kurumsal</h2>
          <ul className="mt-2 space-y-0.5">
            {trustLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-stone-200 bg-stone-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 text-xs leading-5 text-graphite-600 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {year} {siteConfig.name}
          </p>
          <p>Mevzuatın güncel metni için Resmî Gazete ve mevzuat.gov.tr esas alınır.</p>
        </div>
      </div>
    </footer>
  );
}
