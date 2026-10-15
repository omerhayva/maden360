'use client';

import Form from 'next/form';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Plus, Search, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { mainNav, sectorNav, trustNav, type NavItem } from '@/i18n/navigation';
import { routes } from '@/i18n/routes';
import { isActivePath } from './NavLinks';

/** Mobil ve tablet menüsü: büyük dokunma alanları, Escape ile kapanır. */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState<string | null>(null);
  const pathname = usePathname() ?? '/';
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Sayfa değişince menüyü kapat
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-md text-graphite-100 hover:bg-graphite-800"
      >
        {open ? (
          <X aria-hidden="true" className="h-6 w-6" />
        ) : (
          <Menu aria-hidden="true" className="h-6 w-6" />
        )}
        <span className="sr-only">{open ? 'Menüyü kapat' : 'Menüyü aç'}</span>
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-graphite-800 bg-graphite-950 shadow-xl"
      >
        <div className="mx-auto max-w-7xl px-4 pb-6 pt-4 sm:px-6">
          <Form
            action={routes.search()}
            role="search"
            aria-label="Mobil arama"
            className="md:hidden"
          >
            <label htmlFor="mobile-search" className="sr-only">
              Hesaplayıcı, makale veya terim ara
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-graphite-400"
              />
              <input
                id="mobile-search"
                name="q"
                type="search"
                enterKeyHint="search"
                placeholder="Hesaplayıcı, makale, terim ara"
                className="min-h-12 w-full rounded-md border border-graphite-700 bg-graphite-900 pl-10 pr-3 text-base text-white placeholder:text-graphite-400"
              />
            </div>
          </Form>

          <nav aria-label="Mobil ana menü" className="mt-4 space-y-5">
            <NavGroup title="Bilgi ve araçlar" items={mainNav} pathname={pathname} />
            <NavGroup title="Sektör ağı" items={sectorNav} pathname={pathname} />
          </nav>

          <Link
            href={routes.postListing()}
            className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-md bg-copper-600 px-4 font-semibold text-white hover:bg-copper-700"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            İlan ver
          </Link>

          <nav aria-label="Kurumsal bağlantılar" className="mt-4 border-t border-graphite-800 pt-4">
            <ul className="grid grid-cols-2 gap-x-4">
              {trustNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex min-h-11 items-center text-sm text-graphite-300 hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}

function NavGroup({
  title,
  items,
  pathname,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-graphite-400">{title}</p>
      <ul className="mt-1 divide-y divide-graphite-800">
        {items.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-14 flex-col justify-center py-2 ${active ? 'text-copper-400' : 'text-white'}`}
              >
                <span className="text-base font-semibold">{item.label}</span>
                {item.description && (
                  <span className="text-sm text-graphite-400">{item.description}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
