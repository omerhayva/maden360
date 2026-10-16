import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';
import { routes } from '@/i18n/routes';
import { breadcrumbSchema, type Crumb } from '@/lib/seo/structured-data';

const tones = {
  light: {
    list: 'text-graphite-600',
    separator: 'text-graphite-400',
    current: 'text-graphite-800',
    link: 'ui-hover:text-copper-700',
  },
  /** Koyu, fotoğraflı başlıklar (metin renkleri photos.test.ts ile denetlenir) */
  inverse: {
    list: 'text-graphite-200',
    separator: 'text-graphite-400',
    current: 'text-white',
    link: 'ui-hover:text-white',
  },
} as const;

/** Konum yolu; son öğe geçerli sayfadır. Yapılandırılmış veri olarak da yayımlanır. */
export function Breadcrumbs({
  items,
  tone = 'light',
}: {
  items: Crumb[];
  tone?: keyof typeof tones;
}) {
  const all: Crumb[] = [{ name: 'Ana sayfa', href: routes.home() }, ...items];
  const colors = tones[tone];
  return (
    <nav aria-label="Konum" className="no-print text-sm">
      <ol className={`flex flex-wrap items-center gap-x-1 gap-y-1 ${colors.list}`}>
        {all.map((crumb, index) => {
          const last = index === all.length - 1;
          return (
            <li key={crumb.href} className="inline-flex items-center gap-1">
              {index > 0 && (
                <ChevronRight aria-hidden="true" className={`h-3.5 w-3.5 ${colors.separator}`} />
              )}
              {last ? (
                <span aria-current="page" className={`font-medium ${colors.current}`}>
                  {crumb.name}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className={`-my-1 inline-block rounded py-1 underline-offset-4 ui-hover:underline ${colors.link}`}
                >
                  {crumb.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
      <JsonLd data={breadcrumbSchema(all)} />
    </nav>
  );
}
