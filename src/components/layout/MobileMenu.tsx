'use client';

import Form from 'next/form';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Plus, Search, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { ButtonLink, IconButton } from '@/components/ui/Button';
import { inputClasses } from '@/components/ui/styles';
import { mainNav, trustNav } from '@/i18n/navigation';
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
      {/* Ad sabit kalır ("Menü"); açık/kapalı durumu aria-expanded ile bildirilir (WAI-ARIA APG) */}
      <IconButton
        ref={buttonRef}
        label="Menü"
        icon={open ? X : Menu}
        variant="subtle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="aria-expanded:bg-stone-200"
      />

      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-stone-300 bg-white shadow-lg"
      >
        <div className="mx-auto max-w-7xl px-4 pb-6 pt-4 sm:px-6">
          <Form
            action={routes.search()}
            role="search"
            aria-label="Mobil arama"
            className="md:hidden"
          >
            <label htmlFor="mobile-search" className="sr-only">
              Firma, iş ilanı veya ürün ara
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-graphite-500"
              />
              <input
                id="mobile-search"
                name="q"
                type="search"
                enterKeyHint="search"
                placeholder="Firma, iş ilanı, ürün ara"
                className={inputClasses({ size: 'lg', className: 'pl-10 pr-3' })}
              />
            </div>
          </Form>

          <nav aria-label="Mobil ana menü" className="mt-4">
            <ul className="divide-y divide-stone-200">
              {mainNav.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={`-mx-2 flex min-h-14 flex-col justify-center rounded-sm px-2 py-2 transition-colors duration-100 ui-hover:bg-stone-100 ui-active:bg-stone-200 ${active ? 'text-copper-700' : 'text-graphite-950'}`}
                    >
                      <span className="text-base font-semibold">{item.label}</span>
                      {item.description && (
                        <span className="text-sm text-graphite-600">{item.description}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <ButtonLink
            href={routes.postListing()}
            size="lg"
            width="full"
            icon={Plus}
            className="mt-5"
          >
            İlan ver
          </ButtonLink>

          <nav aria-label="Kurumsal bağlantılar" className="mt-4 border-t border-stone-200 pt-4">
            <ul className="grid grid-cols-2 gap-x-4">
              {trustNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex min-h-11 items-center text-sm text-graphite-700 underline-offset-4 ui-hover:text-graphite-950 ui-hover:underline"
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
