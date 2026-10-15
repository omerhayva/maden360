/**
 * URL yapısı tek yerden yönetilir.
 *
 * Türkçe içerik kök dizinde (/bilgi, /hesaplamalar ...) yayımlanır. İngilizce
 * eklendiğinde aynı içerik /en/... altında, kendi segment adlarıyla
 * (/en/knowledge, /en/calculators ...) yayımlanacak; mevcut Türkçe URL'ler
 * değişmeyecek. Bağlantı üretirken her zaman bu yardımcıları kullanın.
 */

export type Locale = 'tr' | 'en';

export const defaultLocale: Locale = 'tr';

/** Yayında olan diller. İngilizce hazır olduğunda 'en' eklenecek. */
export const activeLocales: readonly Locale[] = ['tr'];

const segments = {
  tr: {
    articles: 'bilgi',
    topics: 'konular',
    calculators: 'hesaplamalar',
    glossary: 'sozluk',
    guide: 'rehber',
    search: 'ara',
    about: 'hakkimizda',
    sourcePolicy: 'kaynak-politikasi',
    correctionPolicy: 'duzeltme-politikasi',
    contact: 'iletisim',
  },
  en: {
    articles: 'knowledge',
    topics: 'topics',
    calculators: 'calculators',
    glossary: 'glossary',
    guide: 'guide',
    search: 'search',
    about: 'about',
    sourcePolicy: 'source-policy',
    correctionPolicy: 'corrections-policy',
    contact: 'contact',
  },
} as const satisfies Record<Locale, Record<string, string>>;

type SegmentKey = keyof (typeof segments)['tr'];

function prefix(locale: Locale): string {
  return locale === defaultLocale ? '' : `/${locale}`;
}

function section(key: SegmentKey, locale: Locale): string {
  return `${prefix(locale)}/${segments[locale][key]}`;
}

export const routes = {
  home: (locale: Locale = defaultLocale) => prefix(locale) || '/',
  articles: (locale: Locale = defaultLocale) => section('articles', locale),
  article: (slug: string, locale: Locale = defaultLocale) =>
    `${section('articles', locale)}/${slug}`,
  topics: (locale: Locale = defaultLocale) => section('topics', locale),
  topic: (slug: string, locale: Locale = defaultLocale) => `${section('topics', locale)}/${slug}`,
  calculators: (locale: Locale = defaultLocale) => section('calculators', locale),
  calculator: (slug: string, locale: Locale = defaultLocale) =>
    `${section('calculators', locale)}/${slug}`,
  glossary: (locale: Locale = defaultLocale) => section('glossary', locale),
  term: (slug: string, locale: Locale = defaultLocale) => `${section('glossary', locale)}/${slug}`,
  guide: (locale: Locale = defaultLocale) => section('guide', locale),
  search: (query?: string, locale: Locale = defaultLocale) =>
    query
      ? `${section('search', locale)}?q=${encodeURIComponent(query)}`
      : section('search', locale),
  about: (locale: Locale = defaultLocale) => section('about', locale),
  sourcePolicy: (locale: Locale = defaultLocale) => section('sourcePolicy', locale),
  correctionPolicy: (locale: Locale = defaultLocale) => section('correctionPolicy', locale),
  contact: (locale: Locale = defaultLocale) => section('contact', locale),
} as const;

export type StaticPageKey = 'about' | 'sourcePolicy' | 'correctionPolicy' | 'contact';

/** Statik sayfa içerik dosyası adı (content/sayfalar/<ad>.md) ile rota eşlemesi. */
export const staticPageFiles: Record<StaticPageKey, string> = {
  about: 'hakkimizda',
  sourcePolicy: 'kaynak-politikasi',
  correctionPolicy: 'duzeltme-politikasi',
  contact: 'iletisim',
};
