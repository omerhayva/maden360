import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';
import { routes } from '@/i18n/routes';
import { breadcrumbSchema, type Crumb } from '@/lib/seo/structured-data';

/** Konum yolu; son öğe geçerli sayfadır. Yapılandırılmış veri olarak da yayımlanır. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ name: 'Ana sayfa', href: routes.home() }, ...items];
  return (
    <nav aria-label="Konum" className="no-print text-sm">
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 text-graphite-600">
        {all.map((crumb, index) => {
          const last = index === all.length - 1;
          return (
            <li key={crumb.href} className="inline-flex items-center gap-1">
              {index > 0 && (
                <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 text-graphite-400" />
              )}
              {last ? (
                <span aria-current="page" className="font-medium text-graphite-800">
                  {crumb.name}
                </span>
              ) : (
                <Link href={crumb.href} className="rounded hover:text-copper-700 hover:underline">
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
