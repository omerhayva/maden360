'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { mainNav } from '@/i18n/navigation';
import { routes } from '@/i18n/routes';

export function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  if (pathname === href || pathname.startsWith(`${href}/`)) return true;
  // Aday profilleri, iş ilanları bölümünün parçasıdır
  return (
    href === routes.jobs() &&
    (pathname === routes.candidates() || pathname.startsWith(`${routes.candidates()}/`))
  );
}

/** Masaüstü ana menü bağlantıları (etkin bölüm işaretlenir). */
export function NavLinks() {
  const pathname = usePathname() ?? '/';
  return (
    <ul className="flex items-center gap-1">
      {mainNav.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`relative inline-flex min-h-11 items-center rounded-sm px-3 text-[0.95rem] font-medium whitespace-nowrap transition-colors duration-100 ui-hover:bg-stone-100 ui-hover:text-graphite-950 ui-active:bg-stone-200 ${
                active
                  ? 'text-graphite-950 after:absolute after:inset-x-3 after:-bottom-[0.6rem] after:h-0.5 after:bg-copper-700'
                  : 'text-graphite-700'
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
