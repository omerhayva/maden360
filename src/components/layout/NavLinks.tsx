'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { mainNav, sectorNav, type NavItem } from '@/i18n/navigation';
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

function Items({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return items.map((item) => {
    const active = isActivePath(pathname, item.href);
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          aria-current={active ? 'page' : undefined}
          className={`relative inline-flex min-h-12 items-center rounded-md px-3 text-[0.95rem] font-medium transition-colors hover:bg-graphite-800 hover:text-white ${
            active
              ? 'text-white after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-copper-400'
              : 'text-graphite-200'
          }`}
        >
          {item.label}
        </Link>
      </li>
    );
  });
}

/** Masaüstü ana menü bağlantıları: bilgi ve araçlar | sektör ağı */
export function NavLinks() {
  const pathname = usePathname() ?? '/';
  return (
    <div className="flex items-center gap-2">
      <ul className="flex items-center gap-1">
        <Items items={mainNav} pathname={pathname} />
      </ul>
      <span aria-hidden="true" className="mx-2 h-6 w-px bg-graphite-700" />
      <ul className="flex items-center gap-1" aria-label="Sektör ağı">
        <Items items={sectorNav} pathname={pathname} />
      </ul>
    </div>
  );
}
