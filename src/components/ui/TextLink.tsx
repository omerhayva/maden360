import Link from 'next/link';
import { ArrowDown, ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { isInternalHref } from '@/lib/href';
import { textLinkClasses } from './styles';

/**
 * Oklu metin bağlantısı ("Tümünü gör →", "Salonları gezin ↓"). Başka bir yere götürdüğü için
 * bağlantıdır; düğme görünümü yalnızca sayfanın ana eylemlerinde kullanılır.
 */
export function ArrowLink({
  href,
  children,
  tone = 'light',
  size = 'sm',
  direction = 'right',
  className,
}: {
  href: string;
  children: ReactNode;
  tone?: 'light' | 'inverse';
  size?: 'sm' | 'md';
  /** "down": aynı sayfada aşağıdaki bölüme götürür */
  direction?: 'right' | 'down';
  className?: string;
}) {
  const Icon = direction === 'down' ? ArrowDown : ArrowRight;
  const classes = textLinkClasses({ tone, size, className });
  const content = (
    <>
      {children}
      <Icon aria-hidden="true" />
    </>
  );
  return isInternalHref(href) ? (
    <Link href={href} className={classes}>
      {content}
    </Link>
  ) : (
    <a href={href} className={classes}>
      {content}
    </a>
  );
}
