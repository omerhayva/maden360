'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { BookA, BookOpen, Briefcase, Calculator, Search, SearchX, Store, Tent } from 'lucide-react';
import type MiniSearch from 'minisearch';
import { useEffect, useMemo, useRef, useState } from 'react';
import { siteConfig } from '@/config/site';
import { routes } from '@/i18n/routes';
import { todayInTurkey } from '@/lib/listings/dates';
import {
  createSearchIndex,
  hasSearchableTerms,
  runSearch,
  SEARCH_DOC_TYPES,
  typeLabels,
  withoutExpired,
  type SearchDocType,
  type SearchDocument,
} from '@/lib/search/engine';

/** Arama dizini derleme sırasında üretilir: /arama-dizini.json */
const INDEX_URL = '/arama-dizini.json';

let indexPromise: Promise<MiniSearch<SearchDocument>> | null = null;

function loadIndex(): Promise<MiniSearch<SearchDocument>> {
  if (!indexPromise) {
    indexPromise = fetch(INDEX_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<SearchDocument[]>;
      })
      .then((documents) => createSearchIndex(documents))
      .catch((error: unknown) => {
        indexPromise = null;
        throw error;
      });
  }
  return indexPromise;
}

const typeIcons: Record<SearchDocType, typeof Calculator> = {
  hesaplama: Calculator,
  makale: BookOpen,
  terim: BookA,
  stand: Tent,
  'is-ilani': Briefcase,
  market: Store,
};

const FILTERS: { value: 'tum' | SearchDocType; label: string }[] = [
  { value: 'tum', label: 'Tümü' },
  { value: 'hesaplama', label: 'Hesaplayıcılar' },
  { value: 'makale', label: 'Makaleler' },
  { value: 'terim', label: 'Sözlük' },
  { value: 'stand', label: 'Fuar' },
  { value: 'is-ilani', label: 'İş ilanları' },
  { value: 'market', label: 'Market' },
];

const LISTING_FILTERS = new Set<string>(['stand', 'is-ilani', 'market']);

export function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const query = searchParams.get('q') ?? '';
  const filterParam = searchParams.get('tur');
  const filter: 'tum' | SearchDocType = SEARCH_DOC_TYPES.includes(filterParam as SearchDocType)
    ? (filterParam as SearchDocType)
    : 'tum';

  const [input, setInput] = useState(query);
  const [lastQuery, setLastQuery] = useState(query);
  const [index, setIndex] = useState<MiniSearch<SearchDocument> | null>(null);
  const [loadError, setLoadError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Üst menüden yeni arama yapılırsa kutuyu URL ile eşitle
  if (query !== lastQuery) {
    setLastQuery(query);
    setInput(query);
  }

  useEffect(() => {
    let cancelled = false;
    loadIndex()
      .then((loaded) => {
        if (!cancelled) setIndex(loaded);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateUrl = (nextQuery: string, nextFilter: typeof filter) => {
    const params = new URLSearchParams();
    if (nextQuery.trim()) params.set('q', nextQuery.trim());
    if (nextFilter !== 'tum') params.set('tur', nextFilter);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // Yazarken kısa gecikmeyle URL'yi güncelle (sonuçlar URL'deki sorgudan hesaplanır)
  useEffect(() => {
    if (input.trim() === query.trim()) return;
    const timer = window.setTimeout(() => updateUrl(input, filter), 250);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- yalnızca kullanıcı girdisi değiştiğinde
  }, [input]);

  const outcome = useMemo(() => {
    if (!index) return { hits: [], relaxed: false };
    const result = runSearch(index, query);
    return { ...result, hits: withoutExpired(result.hits, todayInTurkey()) };
  }, [index, query]);
  const counts = useMemo(() => {
    const result = Object.fromEntries([
      ['tum', outcome.hits.length],
      ...SEARCH_DOC_TYPES.map((type) => [type, 0]),
    ]) as Record<'tum' | SearchDocType, number>;
    for (const hit of outcome.hits) result[hit.type] += 1;
    return result;
  }, [outcome]);
  const visibleHits =
    filter === 'tum' ? outcome.hits : outcome.hits.filter((hit) => hit.type === filter);
  const trimmed = query.trim();
  const searchable = hasSearchableTerms(trimmed);

  return (
    <div>
      <form
        role="search"
        aria-label="Arama"
        onSubmit={(event) => {
          event.preventDefault();
          updateUrl(input, filter);
          inputRef.current?.blur();
        }}
      >
        <label htmlFor="arama-kutusu" className="sr-only">
          Aranacak kelime
        </label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-4 h-5 w-5 text-graphite-500"
          />
          <input
            ref={inputRef}
            id="arama-kutusu"
            type="search"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            autoComplete="off"
            enterKeyHint="search"
            placeholder="Örn. dekapaj oranı, tenör, uzunayak"
            className="min-h-14 w-full rounded-lg border border-graphite-300 bg-white pl-11 pr-24 text-lg text-graphite-950 shadow-sm placeholder:text-graphite-500 focus:border-copper-500 focus:outline-none"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 inline-flex min-h-11 items-center rounded-md bg-copper-600 px-4 font-semibold text-white hover:bg-copper-700"
          >
            Ara
          </button>
        </div>
      </form>

      {trimmed && searchable && index && (
        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Sonuç türü">
          {FILTERS.filter(
            // İlan türleri yalnızca sonuç varsa gösterilir
            (item) =>
              !LISTING_FILTERS.has(item.value) || counts[item.value] > 0 || filter === item.value,
          ).map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={filter === item.value}
              onClick={() => updateUrl(query, item.value)}
              className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold ${
                filter === item.value
                  ? 'border-graphite-900 bg-graphite-900 text-white'
                  : 'border-graphite-300 bg-white text-graphite-800 hover:border-copper-400'
              }`}
            >
              {item.label}
              <span className={filter === item.value ? 'text-copper-300' : 'text-graphite-500'}>
                {counts[item.value]}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-6">
        <p role="status" aria-live="polite" className="text-sm text-graphite-600">
          {loadError
            ? ''
            : !trimmed
              ? ''
              : !index
                ? 'Arama dizini yükleniyor…'
                : !searchable
                  ? ''
                  : outcome.hits.length > 0
                    ? `“${trimmed}” için ${outcome.hits.length} sonuç${outcome.relaxed ? ' (tüm kelimeleri içeren sonuç bulunamadı; benzer sonuçlar gösteriliyor)' : ''}`
                    : `“${trimmed}” için sonuç bulunamadı`}
        </p>

        {loadError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            Arama dizini yüklenemedi. İnternet bağlantınızı kontrol edip sayfayı yenileyin.
          </div>
        )}

        {!trimmed && <SearchSuggestions />}

        {trimmed && !searchable && (
          <p className="mt-4 text-graphite-700">
            Aramanız yalnızca “ve, nedir, nasıl” gibi genel kelimeler içeriyor. Lütfen bir teknik
            terim ekleyin.
          </p>
        )}

        {trimmed && searchable && index && outcome.hits.length === 0 && (
          <NoResults query={trimmed} />
        )}

        {visibleHits.length > 0 && (
          <ol className="mt-4 space-y-3">
            {visibleHits.map((hit) => {
              const Icon = typeIcons[hit.type];
              return (
                <li
                  key={hit.id}
                  className="relative rounded-xl border border-stone-200 bg-white p-4 hover:border-copper-300 sm:p-5"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-graphite-500">
                    <Icon aria-hidden="true" className="h-4 w-4 text-copper-600" />
                    <span>{typeLabels[hit.type]}</span>
                    {hit.category && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{hit.category}</span>
                      </>
                    )}
                  </div>
                  <h2 className="mt-1.5 text-lg font-semibold text-graphite-950">
                    <Link
                      href={hit.url}
                      className="after:absolute after:inset-0 hover:text-copper-800 focus-visible:outline-none"
                    >
                      {hit.title}
                    </Link>
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-graphite-600">
                    {hit.summary}
                  </p>
                </li>
              );
            })}
          </ol>
        )}

        {trimmed && searchable && index && outcome.hits.length > 0 && visibleHits.length === 0 && (
          <p className="mt-4 text-graphite-700">
            Bu türde sonuç yok. “Tümü” sekmesine dönebilirsiniz.
          </p>
        )}
      </div>
    </div>
  );
}

function SearchSuggestions() {
  return (
    <div className="mt-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-graphite-500">
        Sık aranan
      </h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {siteConfig.popularSearches.map((term) => (
          <li key={term}>
            <Link
              href={routes.search(term)}
              className="inline-flex min-h-10 items-center rounded-full border border-graphite-300 bg-white px-4 text-sm font-medium text-graphite-800 hover:border-copper-400 hover:text-copper-800"
            >
              {term}
            </Link>
          </li>
        ))}
      </ul>
      <BrowseLinks />
    </div>
  );
}

function BrowseLinks() {
  const links = [
    { href: routes.calculators(), label: 'Tüm hesaplayıcılar', icon: Calculator },
    { href: routes.articles(), label: 'Bilgi merkezi', icon: BookOpen },
    { href: routes.glossary(), label: 'Madencilik sözlüğü', icon: BookA },
  ];
  return (
    <ul className="mt-8 grid gap-3 sm:grid-cols-3">
      {links.map(({ href, label, icon: Icon }) => (
        <li key={href}>
          <Link
            href={href}
            className="flex min-h-14 items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 font-semibold text-graphite-900 hover:border-copper-300 hover:text-copper-800"
          >
            <Icon aria-hidden="true" className="h-5 w-5 text-copper-600" />
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function NoResults({ query }: { query: string }) {
  const mailto = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(`İçerik önerisi: ${query}`)}`;
  return (
    <div className="mt-4 rounded-xl border border-dashed border-graphite-300 bg-white p-6">
      <div className="flex items-start gap-3">
        <SearchX aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0 text-copper-600" />
        <div>
          <h2 className="text-lg font-semibold text-graphite-950">Sonuç bulunamadı</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-graphite-700">
            <li>Yazımı kontrol edin veya Türkçe karakter kullanmadan deneyin (ör. “kazanim”).</li>
            <li>Daha genel ya da farklı bir terim deneyin (ör. “verim” yerine “kazanım”).</li>
            <li>İngilizce karşılığıyla arayın (ör. “stripping ratio”, “recovery”).</li>
          </ul>
          <p className="mt-3 text-sm text-graphite-700">
            Aradığınız konu henüz yoksa{' '}
            <a href={mailto} className="font-semibold text-copper-700 hover:underline">
              bize önerin
            </a>
            .
          </p>
        </div>
      </div>
      <BrowseLinks />
    </div>
  );
}
