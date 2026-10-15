'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { isExpired, todayInTurkey } from '@/lib/listings/dates';
import type { Option } from '@/lib/listings/options';
import { foldTurkish } from '@/lib/text';
import { ListingCard, type ListingCardData } from './ListingCards';

export interface BrowserItem {
  key: string;
  expiresAt?: string;
  /** foldTurkish ile katlanmış arama metni */
  searchText: string;
  facets: Record<string, string | string[]>;
  card: ListingCardData;
}

export interface FacetFilter {
  /** URL parametresi ve facets anahtarı */
  id: string;
  label: string;
  allLabel: string;
  options: Option[];
  /** Bu değerlere sahip öğeler her seçimle eşleşir (ör. "Türkiye geneli") */
  wildcards?: string[];
}

interface ListingBrowserProps {
  items: BrowserItem[];
  filters: FacetFilter[];
  searchLabel: string;
  searchPlaceholder: string;
  /** Sonuç sayısında kullanılan ad: "ilan", "stand", "aday" */
  noun: string;
  /** Önizlemede süresi dolmuş ilanlar da gösterilir */
  showExpired: boolean;
  gridClassName?: string;
  /** Hiç ilan yokken gösterilecek içerik */
  empty: ReactNode;
  /** Kart başlıklarının düzeyi (bölüm başlığı h2 ise h3) */
  cardHeading?: 'h2' | 'h3';
}

function matchesFacet(
  value: string | string[] | undefined,
  selected: string,
  wildcards: string[] = [],
): boolean {
  if (!selected) return true;
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return values.includes(selected) || values.some((item) => wildcards.includes(item));
}

/**
 * İlan listelerinde anında süzme: arama kutusu ve açılır listeler. Süzgeçler URL'ye
 * yazılır (paylaşılabilir bağlantı). JavaScript kapalıyken tüm liste görünür.
 */
export function ListingBrowser({
  items,
  filters,
  searchLabel,
  searchPlaceholder,
  noun,
  showExpired,
  gridClassName = 'grid gap-4 md:grid-cols-2 lg:grid-cols-3',
  empty,
  cardHeading = 'h3',
}: ListingBrowserProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const query = searchParams.get('q') ?? '';
  const [input, setInput] = useState(query);
  const [lastQuery, setLastQuery] = useState(query);
  const today = useMemo(() => todayInTurkey(), []);

  if (query !== lastQuery) {
    setLastQuery(query);
    setInput(query);
  }

  const selected = Object.fromEntries(
    filters.map((filter) => [filter.id, searchParams.get(filter.id) ?? '']),
  );

  const updateUrl = (changes: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value.trim()) params.set(key, value.trim());
      else params.delete(key);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  useEffect(() => {
    if (input.trim() === query.trim()) return;
    const timer = window.setTimeout(() => updateUrl({ q: input }), 250);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- yalnızca kullanıcı girdisi değiştiğinde
  }, [input]);

  const live = useMemo(
    () => items.filter((item) => showExpired || !isExpired(item.expiresAt, today)),
    [items, showExpired, today],
  );

  const tokens = foldTurkish(query.trim()).split(/\s+/).filter(Boolean);
  const visible = live.filter(
    (item) =>
      tokens.every((token) => item.searchText.includes(token)) &&
      filters.every((filter) =>
        matchesFacet(item.facets[filter.id], selected[filter.id] ?? '', filter.wildcards),
      ),
  );
  const active = Boolean(query.trim()) || filters.some((filter) => selected[filter.id]);

  if (live.length === 0) return <>{empty}</>;

  return (
    <div>
      <form
        role="search"
        aria-label={searchLabel}
        onSubmit={(event) => {
          event.preventDefault();
          updateUrl({ q: input });
        }}
        className="rounded-xl border border-stone-200 bg-white p-4"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <label htmlFor="ilan-arama" className="text-sm font-medium text-graphite-900">
              {searchLabel}
            </label>
            <div className="relative mt-1.5">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-graphite-500"
              />
              <input
                id="ilan-arama"
                type="search"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={searchPlaceholder}
                autoComplete="off"
                enterKeyHint="search"
                className="min-h-11 w-full rounded-md border border-graphite-300 bg-white pl-9 pr-3 text-base focus:border-copper-600 focus:outline-none"
              />
            </div>
          </div>
          {filters.map((filter) => (
            <div key={filter.id}>
              <label
                htmlFor={`suzgec-${filter.id}`}
                className="text-sm font-medium text-graphite-900"
              >
                {filter.label}
              </label>
              <select
                id={`suzgec-${filter.id}`}
                value={selected[filter.id] ?? ''}
                onChange={(event) => updateUrl({ [filter.id]: event.target.value })}
                className="mt-1.5 min-h-11 w-full rounded-md border border-graphite-300 bg-white px-2 text-base text-graphite-900 focus:border-copper-600 focus:outline-none"
              >
                <option value="">{filter.allLabel}</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p role="status" aria-live="polite" className="text-sm text-graphite-700">
          {active ? `${visible.length} ${noun} bulundu` : `${live.length} ${noun}`}
        </p>
        {active && (
          <button
            type="button"
            onClick={() => {
              setInput('');
              updateUrl({ q: '', ...Object.fromEntries(filters.map((filter) => [filter.id, ''])) });
            }}
            className="inline-flex min-h-10 items-center gap-1 rounded-md px-2 text-sm font-semibold text-copper-700 hover:bg-copper-50"
          >
            <X aria-hidden="true" className="h-4 w-4" />
            Süzgeçleri temizle
          </button>
        )}
      </div>

      {visible.length > 0 ? (
        <ul className={`mt-3 ${gridClassName}`}>
          {visible.map((item) => (
            <li key={item.key}>
              <ListingCard data={item.card} headingLevel={cardHeading} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 rounded-xl border border-dashed border-graphite-300 bg-white p-6 text-graphite-700">
          Bu süzgeçlerle eşleşen {noun} yok. Süzgeçleri temizleyip yeniden deneyin.
        </p>
      )}
    </div>
  );
}

/** JavaScript yüklenmeden (ve arama motorlarında) görünen tam liste */
export function StaticListingGrid({
  items,
  gridClassName = 'grid gap-4 md:grid-cols-2 lg:grid-cols-3',
  empty,
  cardHeading = 'h3',
}: {
  items: BrowserItem[];
  gridClassName?: string;
  empty: ReactNode;
  cardHeading?: 'h2' | 'h3';
}) {
  if (items.length === 0) return <>{empty}</>;
  return (
    <ul className={gridClassName}>
      {items.map((item) => (
        <li key={item.key}>
          <ListingCard data={item.card} headingLevel={cardHeading} />
        </li>
      ))}
    </ul>
  );
}
