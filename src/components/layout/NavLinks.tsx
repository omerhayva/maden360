'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { mainNav } from '@/i18n/navigation';

export function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Masaüstü ana menü bağlantıları (etkin sayfa işaretlenir). */
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
              className={`relative inline-flex min-h-11 items-center rounded-md px-3 text-[0.95rem] font-medium transition-colors hover:bg-graphite-800 hover:text-white ${
                active
                  ? 'text-white after:absolute after:inset-x-3 after:-bottom-[0.6rem] after:h-0.5 after:rounded-full after:bg-copper-400'
                  : 'text-graphite-200'
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
