'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { listPanel, panel } from '@/components/ui/card';
import { Select } from '@/components/ui/Select';
import { inputClasses } from '@/components/ui/styles';
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
  gridClassName = listPanel,
  empty,
  cardHeading = 'h3',
}: ListingBrowserProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const query = searchParams.get('q') ?? '';
  const [input, setInput] = useState(query);
  const [lastQuery, setLastQuery] = useState(query);
  // Mobilde açılır listeler "Süzgeçler" düğmesinin arkasında; bağlantıda süzgeç varsa açık başlar
  const [filtersOpen, setFiltersOpen] = useState(() =>
    filters.some((filter) => Boolean(searchParams.get(filter.id))),
  );
  const filtersId = useId();
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

  const resetFilters = () => {
    setInput('');
    updateUrl({ q: '', ...Object.fromEntries(filters.map((filter) => [filter.id, ''])) });
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
  const activeFilterCount = filters.filter((filter) => selected[filter.id]).length;
  const active = Boolean(query.trim()) || activeFilterCount > 0;

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
        className={`${panel} p-4`}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <label htmlFor="ilan-arama" className="text-sm font-medium text-graphite-900">
              {searchLabel}
            </label>
            <div className="relative mt-1.5">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-500"
              />
              <input
                id="ilan-arama"
                type="search"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={searchPlaceholder}
                autoComplete="off"
                enterKeyHint="search"
                className={inputClasses({ size: 'md', className: 'pl-9 pr-3' })}
              />
            </div>
          </div>
          {filters.length > 0 && (
            <div className="sm:hidden">
              <Button
                variant="secondary"
                width="full"
                icon={SlidersHorizontal}
                iconEnd={ChevronDown}
                aria-expanded={filtersOpen}
                aria-controls={filtersId}
                onClick={() => setFiltersOpen((value) => !value)}
                className="aria-expanded:[&>svg:last-child]:rotate-180"
              >
                <span className="flex-1 text-left">
                  Süzgeçler
                  {activeFilterCount > 0 && (
                    <span className="ml-1.5 rounded-xs bg-graphite-900 px-1.5 py-0.5 text-xs text-white tabular-nums">
                      {activeFilterCount}
                      <span className="sr-only"> etkin</span>
                    </span>
                  )}
                </span>
              </Button>
            </div>
          )}
          {/* "contents": açılır listeler ızgaranın doğrudan öğeleri gibi dizilir */}
          <div id={filtersId} className={filtersOpen ? 'contents' : 'contents max-sm:hidden'}>
            {filters.map((filter) => (
              <div key={filter.id}>
                <label
                  htmlFor={`suzgec-${filter.id}`}
                  className="text-sm font-medium text-graphite-900"
                >
                  {filter.label}
                </label>
                <Select
                  id={`suzgec-${filter.id}`}
                  size="md"
                  value={selected[filter.id] ?? ''}
                  onChange={(event) => updateUrl({ [filter.id]: event.target.value })}
                  wrapperClassName="mt-1.5"
                >
                  <option value="">{filter.allLabel}</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            ))}
          </div>
        </div>
      </form>

      {/* Sabit yükseklik: "Süzgeçleri temizle" belirip kaybolunca liste kaymaz */}
      <div className="mt-4 flex min-h-10 flex-wrap items-center justify-between gap-2 pointer-coarse:min-h-11">
        <p role="status" aria-live="polite" className="text-sm text-graphite-700">
          {active ? `${visible.length} ${noun} bulundu` : `${live.length} ${noun}`}
        </p>
        {active && (
          <Button variant="ghost" size="sm" icon={X} onClick={resetFilters}>
            Süzgeçleri temizle
          </Button>
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
        <div
          className={`${panel} mt-3 flex flex-col items-start gap-3 p-5 text-graphite-700 sm:flex-row sm:items-center sm:justify-between`}
        >
          <p>Bu süzgeçlerle eşleşen {noun} yok. Süzgeçleri değiştirin veya temizleyin.</p>
          <Button variant="secondary" size="sm" icon={X} onClick={resetFilters}>
            Süzgeçleri temizle
          </Button>
        </div>
      )}
    </div>
  );
}

/** JavaScript yüklenmeden (ve arama motorlarında) görünen tam liste */
export function StaticListingGrid({
  items,
  gridClassName = listPanel,
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
