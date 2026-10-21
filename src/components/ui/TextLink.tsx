import Link from 'next/link';
import type { ReactNode } from 'react';
import { isInternalHref } from '@/lib/href';
import { textLinkClasses } from './styles';

/**
 * Bölüm bağlantısı ("Tüm iş ilanları (4)"). Başka bir sayfaya götürdüğü için bağlantıdır;
 * düğme görünümü yalnızca sayfanın ana eylemlerinde kullanılır. Ok simgesi eklenmez: bağlantı
 * metni nereye gidildiğini söyler.
 */
export function TextLink({
  href,
  children,
  tone = 'light',
  size = 'sm',
  className,
}: {
  href: string;
  children: ReactNode;
  tone?: 'light' | 'inverse';
  size?: 'sm' | 'md';
  className?: string;
}) {
  const classes = textLinkClasses({ tone, size, className });
  return isInternalHref(href) ? (
    <Link href={href} className={classes}>
      {children}
    </Link>
  ) : (
    <a href={href} className={classes}>
      {children}
    </a>
  );
}
