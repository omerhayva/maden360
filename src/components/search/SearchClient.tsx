'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import type MiniSearch from 'minisearch';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, IconButton } from '@/components/ui/Button';
import { Facts } from '@/components/listings/ListingCards';
import { listPanel, listRow, panel, stretchedLink } from '@/components/ui/card';
import { chipClasses, inputClasses } from '@/components/ui/styles';
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

const FILTERS: { value: 'tum' | SearchDocType; label: string }[] = [
  { value: 'tum', label: 'Tümü' },
  { value: 'stand', label: 'Fuar' },
  { value: 'is-ilani', label: 'İş ilanları' },
  { value: 'market', label: 'Market' },
];

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
            placeholder="Örn. ekskavatör, kırıcı"
            className={inputClasses({
              size: 'xl',
              className: `pl-11 sm:text-lg [&::-webkit-search-cancel-button]:appearance-none ${input ? 'pr-36' : 'pr-24'}`,
            })}
          />
          {/* Konum kapsayıcıda: düğmelerin kendi "relative" sınıfıyla çakışmasın */}
          <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
            {input && (
              <IconButton
                label="Aramayı temizle"
                icon={X}
                variant="subtle"
                onClick={() => {
                  setInput('');
                  updateUrl('', filter);
                  inputRef.current?.focus();
                }}
              />
            )}
            <Button type="submit">Ara</Button>
          </div>
        </div>
      </form>

      {trimmed && searchable && index && (
        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Sonuç türü">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={filter === item.value}
              onClick={() => updateUrl(query, item.value)}
              className={`${chipClasses({ selected: filter === item.value })} cursor-pointer`}
            >
              {item.label}
              <span
                className={`rounded-xs px-1.5 text-xs tabular-nums ${
                  filter === item.value
                    ? 'bg-graphite-700 text-white'
                    : 'bg-stone-100 text-graphite-700'
                }`}
              >
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
                    ? `“${trimmed}” için ${outcome.hits.length} sonuç${outcome.relaxed ? ' (tüm kelimeleri içeren sonuç yok, benzer sonuçlar gösteriliyor)' : ''}`
                    : `“${trimmed}” için sonuç bulunamadı`}
        </p>

        {loadError && (
          <div className="mt-4 rounded-sm border border-red-300 bg-red-50 p-4 text-sm text-red-900">
            Arama dizini yüklenemedi. İnternet bağlantınızı kontrol edip sayfayı yenileyin.
          </div>
        )}

        {!trimmed && index && <SearchSuggestions hasDocuments={index.documentCount > 0} />}

        {trimmed && !searchable && (
          <p className="mt-4 text-graphite-700">
            Aramanız yalnızca “ve, nedir, nasıl” gibi genel kelimeler içeriyor. Lütfen aradığınız
            ürünü, mesleği veya firma adını ekleyin.
          </p>
        )}

        {trimmed && searchable && index && outcome.hits.length === 0 && <NoResults />}

        {visibleHits.length > 0 && (
          <ol className={`mt-4 ${listPanel}`}>
            {visibleHits.map((hit) => (
              <li key={hit.id} className={listRow}>
                <h2 className="text-lg leading-snug font-semibold text-graphite-950">
                  <Link href={hit.url} className={stretchedLink}>
                    {hit.title}
                  </Link>
                </h2>
                <Facts
                  items={[typeLabels[hit.type], hit.category]}
                  label="Sonuç türü"
                  className="mt-1"
                />
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-graphite-700">
                  {hit.summary}
                </p>
              </li>
            ))}
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

function SearchSuggestions({ hasDocuments }: { hasDocuments: boolean }) {
  if (!hasDocuments) {
    return (
      <div className="mt-2">
        <p className="text-graphite-700">
          Henüz yayımlanmış ilan yok. İlk ilanlar editör onayından geçtikçe burada aranabilir
          olacak.{' '}
          <Link
            href={routes.postListing()}
            className="font-medium text-copper-700 underline underline-offset-4 ui-hover:text-copper-900"
          >
            İlan verin
          </Link>
          .
        </p>
        <BrowseLinks />
      </div>
    );
  }
  return (
    <div className="mt-2">
      <h2 className="text-base font-semibold text-graphite-950">Sık arananlar</h2>
      <ul className="mt-2 flex flex-wrap gap-2">
        {siteConfig.popularSearches.map((term) => (
          <li key={term}>
            <Link href={routes.search(term)} className={chipClasses()}>
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
    { href: routes.jobs(), label: 'İş ilanları' },
    { href: routes.market(), label: 'Market' },
    { href: routes.fair(), label: 'Sanal Fuar' },
  ];
  return (
    <ul className={`mt-8 ${listPanel} sm:grid sm:grid-cols-3 sm:divide-x sm:divide-y-0`}>
      {links.map(({ href, label }) => (
        <li key={href}>
          <Link
            href={href}
            className="flex min-h-12 items-center px-4 py-3 font-semibold text-graphite-950 underline-offset-4 transition-colors duration-100 ui-hover:bg-stone-50 ui-hover:underline ui-active:bg-stone-100"
          >
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function NoResults() {
  return (
    <div className={`${panel} mt-4 p-5`}>
      <div>
        <div>
          <h2 className="text-lg font-semibold text-graphite-950">Sonuç bulunamadı</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-graphite-700">
            <li>Yazımı kontrol edin veya Türkçe karakter kullanmadan deneyin (ör. “kirici”).</li>
            <li>Daha genel bir kelime deneyin (ör. marka ve model yerine “ekskavatör”).</li>
            <li>
              Aşağıdaki bölümlere göz atın. İlanları il, kategori ve türe göre süzebilirsiniz.
            </li>
          </ul>
          <p className="mt-3 text-sm text-graphite-700">
            Aradığınızı bulamadıysanız{' '}
            <Link
              href={routes.postListing()}
              className="font-medium text-copper-700 underline underline-offset-4 ui-hover:text-copper-900"
            >
              “Aranıyor” ilanı veya aday profili gönderebilirsiniz
            </Link>
            .
          </p>
        </div>
      </div>
      <BrowseLinks />
    </div>
  );
}
