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
    fair: 'fuar',
    fairHalls: 'salonlar',
    jobs: 'is-ilanlari',
    candidates: 'is-arayanlar',
    market: 'market',
    marketCategories: 'kategori',
    postListing: 'ilan-ver',
    contactRequest: 'iletisim-talebi',
    listingRules: 'ilan-kurallari',
    privacy: 'kvkk',
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
    fair: 'expo',
    fairHalls: 'halls',
    jobs: 'jobs',
    candidates: 'candidates',
    market: 'market',
    marketCategories: 'category',
    postListing: 'post-listing',
    contactRequest: 'contact-request',
    listingRules: 'listing-rules',
    privacy: 'privacy',
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

  /* Sanal fuar: /fuar, /fuar/salonlar/[salon], /fuar/[firma] */
  fair: (locale: Locale = defaultLocale) => section('fair', locale),
  hall: (slug: string, locale: Locale = defaultLocale) =>
    `${section('fair', locale)}/${segments[locale].fairHalls}/${slug}`,
  stand: (slug: string, locale: Locale = defaultLocale) => `${section('fair', locale)}/${slug}`,

  /* İş ilanları (işçi arayanlar) ve aday profilleri (iş arayanlar) */
  jobs: (locale: Locale = defaultLocale) => section('jobs', locale),
  job: (slug: string, locale: Locale = defaultLocale) => `${section('jobs', locale)}/${slug}`,
  candidates: (locale: Locale = defaultLocale) => section('candidates', locale),
  candidate: (slug: string, locale: Locale = defaultLocale) =>
    `${section('candidates', locale)}/${slug}`,

  /* Market: /market, /market/kategori/[kategori], /market/[ilan] */
  market: (locale: Locale = defaultLocale) => section('market', locale),
  marketCategory: (slug: string, locale: Locale = defaultLocale) =>
    `${section('market', locale)}/${segments[locale].marketCategories}/${slug}`,
  marketListing: (slug: string, locale: Locale = defaultLocale) =>
    `${section('market', locale)}/${slug}`,

  /* Başvuru formları */
  postListing: (type?: string, locale: Locale = defaultLocale) =>
    type ? `${section('postListing', locale)}/${type}` : section('postListing', locale),
  contactRequest: (ref?: string, locale: Locale = defaultLocale) =>
    ref
      ? `${section('contactRequest', locale)}?ilan=${encodeURIComponent(ref)}`
      : section('contactRequest', locale),
  listingRules: (locale: Locale = defaultLocale) => section('listingRules', locale),
  privacy: (locale: Locale = defaultLocale) => section('privacy', locale),
} as const;

/**
 * Bölüm köklerinde içerik slug'ı olarak kullanılamayacak adlar
 * (/fuar/salonlar ve /market/kategori alt yollarıyla çakışmasın diye).
 */
export const reservedSlugs = {
  stands: [segments.tr.fairHalls],
  marketListings: [segments.tr.marketCategories],
} as const;

export type StaticPageKey = 'about' | 'sourcePolicy' | 'correctionPolicy' | 'contact';

/** Statik sayfa içerik dosyası adı (content/sayfalar/<ad>.md) ile rota eşlemesi. */
export const staticPageFiles: Record<StaticPageKey, string> = {
  about: 'hakkimizda',
  sourcePolicy: 'kaynak-politikasi',
  correctionPolicy: 'duzeltme-politikasi',
  contact: 'iletisim',
};

/**
 * Yayın durumuna bağlı sayfalar: yalnızca "published" olduklarında (veya önizlemede)
 * üretilir. İlan formları bu iki sayfa yayımlanınca açılır.
 */
export type OptionalPageKey = 'listingRules' | 'privacy';

export const optionalPageFiles: Record<OptionalPageKey, string> = {
  listingRules: 'ilan-kurallari',
  privacy: 'kvkk',
};
