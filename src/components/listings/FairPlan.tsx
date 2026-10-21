import Link from 'next/link';
import type { ReactNode } from 'react';
import { routes } from '@/i18n/routes';
import type { Hall } from '@/lib/content/schemas';

/**
 * Sanal fuarın salon planı: fuar girişindeki kat planı gibi, salonlar harf koduyla (A, B, C...)
 * duvarlarla ayrılmış hücrelerde. Her hücre salon sayfasına götürür. Planın son hücresi salon
 * değildir: `extra` ile verilen kısa bağlantı veya not (ör. "Tüm firmalar") için ayrılır ve
 * son sırayı doldurur; böylece yan yana kalan boşluk duvar renginde görünmez.
 *
 * Görsel yapı bilgi taşır: harf kodu salonun adıdır (fuar ziyaretçileri salonları böyle bulur),
 * kalın dış çizgi fuar alanının sınırıdır. Salon sayfalarında o salon, fuar haritalarındaki gibi
 * "Buradasınız" notuyla işaretlenir (`current`).
 */
export function FairPlan({
  halls,
  counts,
  extra,
  current,
  label = 'Salon planı',
}: {
  halls: Hall[];
  /** Salon başına yayındaki stand sayısı */
  counts: Record<string, number>;
  /** Planın son hücresi (bağlantı veya kısa not) */
  extra?: ReactNode;
  /** Bulunulan salonun kısa adı (salon sayfalarında) */
  current?: string;
  label?: string;
}) {
  const total = halls.length + (extra ? 1 : 0);
  const smSpan = total % 2 === 1 ? 'col-span-2' : '';
  const lgRemainder = total % 4;
  const lgSpan =
    lgRemainder === 0
      ? 'lg:col-span-1'
      : { 1: 'lg:col-span-4', 2: 'lg:col-span-3', 3: 'lg:col-span-2' }[lgRemainder];
  return (
    <ul
      aria-label={label}
      className="grid grid-cols-2 gap-px overflow-hidden rounded-xs border-2 border-graphite-800 bg-graphite-300 lg:grid-cols-4"
    >
      {halls.map((hall) => {
        const count = counts[hall.slug] ?? 0;
        const here = hall.slug === current;
        return (
          <li key={hall.slug} className="flex">
            <Link
              href={routes.hall(hall.slug)}
              aria-current={here ? 'page' : undefined}
              className={`group flex min-h-24 w-full gap-3 px-3 py-3 [-webkit-tap-highlight-color:transparent] transition-colors duration-100 focus-visible:z-10 focus-visible:-outline-offset-4 sm:px-4 lg:min-h-28 lg:flex-col lg:gap-0 ${
                here
                  ? 'bg-graphite-900 text-white'
                  : 'bg-white ui-hover:bg-copper-50 ui-active:bg-copper-100'
              }`}
            >
              <span
                aria-hidden="true"
                className={`w-6 shrink-0 text-3xl leading-none font-semibold [font-stretch:75%] lg:w-auto ${here ? 'text-copper-300' : 'text-copper-700'}`}
              >
                {hall.code}
              </span>
              <span className="flex min-w-0 flex-1 flex-col lg:mt-2">
                <span
                  className={`text-sm leading-5 font-semibold underline-offset-4 group-hover:underline ${here ? 'text-white' : 'text-graphite-950'}`}
                >
                  <span className="sr-only">Salon {hall.code}: </span>
                  {hall.name}
                </span>
                {(here || count > 0) && (
                  <span
                    className={`mt-auto pt-1 text-xs tabular-nums ${here ? 'text-graphite-100' : 'text-graphite-600'}`}
                  >
                    {here ? 'Buradasınız' : `${count} firma`}
                  </span>
                )}
              </span>
            </Link>
          </li>
        );
      })}
      {extra && (
        <li className={`flex bg-stone-100 ${smSpan} ${lgSpan}`}>
          <div className="flex w-full flex-col justify-center px-3 py-3 text-sm sm:px-4">
            {extra}
          </div>
        </li>
      )}
    </ul>
  );
}
