import Form from 'next/form';
import { Search } from 'lucide-react';
import { routes } from '@/i18n/routes';

interface SearchFormProps {
  /** "header": koyu üst menü için kompakt; "hero": ana sayfa için büyük; "light": açık zemin */
  variant?: 'header' | 'hero' | 'light';
  defaultValue?: string;
  id?: string;
  autoFocus?: boolean;
  /** Ekran okuyucular için form etiketi (sayfadaki diğer arama formlarından farklı olmalı) */
  label?: string;
}

/**
 * Site geneli arama formu. JavaScript kapalıyken de çalışır (GET /ara?q=...);
 * açıkken sayfa yenilenmeden arama sayfasına geçer.
 */
export function SearchForm({
  variant = 'light',
  defaultValue,
  id = 'site-search',
  autoFocus,
  label,
}: SearchFormProps) {
  const isHeader = variant === 'header';
  const isHero = variant === 'hero';
  const formLabel =
    label ?? (isHeader ? 'Site içi arama' : isHero ? 'Ana sayfa araması' : 'Arama formu');
  return (
    <Form action={routes.search()} role="search" aria-label={formLabel} className="w-full">
      <div className="relative flex w-full items-center">
        <label htmlFor={id} className="sr-only">
          Hesaplayıcı, makale veya terim ara
        </label>
        <Search
          aria-hidden="true"
          className={`pointer-events-none absolute left-3 ${isHero ? 'h-5 w-5' : 'h-4 w-4'} ${
            isHeader ? 'text-graphite-400' : 'text-graphite-500'
          }`}
        />
        <input
          id={id}
          name="q"
          type="search"
          defaultValue={defaultValue}
          autoFocus={autoFocus}
          autoComplete="off"
          enterKeyHint="search"
          placeholder={isHero ? 'Örn. dekapaj oranı, grizu' : 'Hesaplayıcı, makale, terim ara'}
          className={
            isHeader
              ? 'min-h-10 w-full rounded-md border border-graphite-700 bg-graphite-900 pl-9 pr-3 text-[0.95rem] text-white placeholder:text-graphite-400 focus:border-copper-400 focus:outline-none focus-visible:outline-copper-400'
              : isHero
                ? 'min-h-14 w-full rounded-lg border border-graphite-300 bg-white pl-11 pr-28 text-base text-graphite-950 shadow-sm placeholder:text-graphite-500 focus:border-copper-500 focus:outline-none sm:text-lg'
                : 'min-h-12 w-full rounded-lg border border-graphite-300 bg-white pl-9 pr-24 text-base text-graphite-950 placeholder:text-graphite-500 focus:border-copper-500 focus:outline-none'
          }
        />
        {!isHeader && (
          <button
            type="submit"
            className={`absolute right-1.5 inline-flex items-center rounded-md bg-copper-600 px-4 font-semibold text-white hover:bg-copper-700 ${
              isHero ? 'min-h-11 text-base' : 'min-h-9 text-sm'
            }`}
          >
            Ara
          </button>
        )}
      </div>
    </Form>
  );
}
