'use client';

import Link from 'next/link';
import { Filter } from 'lucide-react';
import { useMemo, useState } from 'react';
import { foldTurkish, initialLetter, letterAnchor, TURKISH_ALPHABET } from '@/lib/text';

export interface GlossaryItem {
  slug: string;
  term: string;
  english?: string;
  abbreviation?: string;
  aliases: string[];
  definition: string;
  url: string;
  isPublished: boolean;
}

/** Harf dizinli sözlük listesi; üstteki kutuyla anında süzülür (JavaScript kapalıyken tam liste görünür). */
export function GlossaryList({ items }: { items: GlossaryItem[] }) {
  const [filter, setFilter] = useState('');
  const folded = foldTurkish(filter.trim());

  const visible = useMemo(
    () =>
      folded
        ? items.filter((item) =>
            foldTurkish(
              [item.term, item.english, item.abbreviation, ...item.aliases]
                .filter(Boolean)
                .join(' '),
            ).includes(folded),
          )
        : items,
    [items, folded],
  );

  const groups = useMemo(() => {
    const map = new Map<string, GlossaryItem[]>();
    for (const item of visible) {
      const letter = initialLetter(item.term);
      map.set(letter, [...(map.get(letter) ?? []), item]);
    }
    return map;
  }, [visible]);

  const letters = [...TURKISH_ALPHABET, '#'];
  const allLetters = new Set(items.map((item) => initialLetter(item.term)));

  return (
    <div>
      <div className="no-print sticky top-16 z-10 -mx-4 border-b border-stone-200 bg-stone-100/95 px-4 py-3 sm:mx-0 sm:rounded-xl sm:border sm:bg-white sm:px-4">
        <label htmlFor="sozluk-suzgec" className="sr-only">
          Sözlükte süz
        </label>
        <div className="relative">
          <Filter
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-graphite-500"
          />
          <input
            id="sozluk-suzgec"
            type="search"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Terim, İngilizce karşılık veya kısaltma yazın"
            autoComplete="off"
            className="min-h-11 w-full rounded-md border border-graphite-300 bg-white pl-9 pr-3 text-base focus:border-copper-500 focus:outline-none"
          />
        </div>
        <nav aria-label="Harf dizini" className="mt-3 overflow-x-auto">
          <ul className="flex min-w-max gap-1">
            {letters
              .filter((letter) => letter !== '#' || allLetters.has('#'))
              .map((letter) => {
                const enabled = groups.has(letter);
                return (
                  <li key={letter}>
                    {enabled ? (
                      <a
                        href={`#${letterAnchor(letter)}`}
                        className="inline-flex h-9 min-w-9 items-center justify-center rounded-md px-1 text-sm font-semibold text-graphite-800 hover:bg-copper-50 hover:text-copper-800"
                      >
                        {letter}
                      </a>
                    ) : (
                      <span
                        aria-hidden="true"
                        className="inline-flex h-9 min-w-9 items-center justify-center text-sm text-graphite-300"
                      >
                        {letter}
                      </span>
                    )}
                  </li>
                );
              })}
          </ul>
        </nav>
      </div>

      <p role="status" aria-live="polite" className="mt-4 text-sm text-graphite-600">
        {folded ? `${visible.length} terim bulundu` : `${items.length} terim`}
      </p>

      {visible.length === 0 && (
        <p className="mt-4 rounded-xl border border-dashed border-graphite-300 bg-white p-6 text-graphite-700">
          “{filter}” ile eşleşen terim yok. Tüm sitede aramak için{' '}
          <Link
            href={`/ara?q=${encodeURIComponent(filter)}`}
            className="font-semibold text-copper-700 hover:underline"
          >
            arama sayfasını
          </Link>{' '}
          kullanın.
        </p>
      )}

      <div className="mt-2 space-y-8">
        {[...groups.entries()].map(([letter, groupItems]) => (
          <section key={letter} aria-labelledby={letterAnchor(letter)}>
            <h2
              id={letterAnchor(letter)}
              className="scroll-mt-48 border-b border-stone-300 pb-1 text-2xl font-bold text-copper-700"
            >
              {letter}
            </h2>
            <dl className="mt-3 divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
              {groupItems.map((item) => (
                <div
                  key={item.slug}
                  className="p-4 sm:grid sm:grid-cols-[minmax(0,16rem)_1fr] sm:gap-6"
                >
                  <dt>
                    <Link
                      href={item.url}
                      className="text-base font-semibold text-graphite-950 hover:text-copper-800 hover:underline"
                    >
                      {item.term}
                    </Link>
                    {(item.english || item.abbreviation) && (
                      <span className="block text-sm text-graphite-500">
                        {item.abbreviation && (
                          <span className="font-medium">{item.abbreviation} · </span>
                        )}
                        {item.english && (
                          <span lang="en" className="italic">
                            {item.english}
                          </span>
                        )}
                      </span>
                    )}
                    {!item.isPublished && (
                      <span className="mt-1 inline-block rounded bg-amber-50 px-1.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-300">
                        İncelemede
                      </span>
                    )}
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-graphite-700 sm:mt-0">
                    {item.definition}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}
