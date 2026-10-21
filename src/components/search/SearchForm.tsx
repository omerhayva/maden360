import Form from 'next/form';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { inputClasses } from '@/components/ui/styles';
import { routes } from '@/i18n/routes';

interface SearchFormProps {
  /** "header": üst menü için kompakt; "hero": ana sayfa için büyük; "light": sayfa içi */
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
          Firma, iş ilanı veya ürün ara
        </label>
        <Search
          aria-hidden="true"
          className={`pointer-events-none absolute left-3 text-graphite-500 ${isHero ? 'h-5 w-5' : 'h-4 w-4'}`}
        />
        <input
          id={id}
          name="q"
          type="search"
          defaultValue={defaultValue}
          autoFocus={autoFocus}
          autoComplete="off"
          enterKeyHint="search"
          placeholder={isHero ? 'Meslek, makine, firma' : 'Firma, iş ilanı, ürün ara'}
          className={
            isHeader
              ? inputClasses({ size: 'sm', className: 'pl-9 pr-3' })
              : inputClasses({
                  size: 'xl',
                  className: isHero ? 'pl-11 pr-24 sm:text-lg' : 'pl-9 pr-24',
                })
          }
        />
        {!isHeader && (
          // Konum kapsayıcıda: düğmenin kendi "relative" sınıfıyla çakışmasın
          <div className="absolute right-1.5 top-1.5">
            <Button type="submit">Ara</Button>
          </div>
        )}
      </div>
    </Form>
  );
}
