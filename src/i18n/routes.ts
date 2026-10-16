/**
 * URL yapısı tek yerden yönetilir.
 *
 * Türkçe içerik kök dizinde (/fuar, /is-ilanlari, /market ...) yayımlanır.
 * İngilizce eklendiğinde aynı içerik /en/... altında, kendi segment adlarıyla
 * (/en/expo, /en/jobs ...) yayımlanacak; mevcut Türkçe URL'ler değişmeyecek.
 * Bağlantı üretirken her zaman bu yardımcıları kullanın.
 */

export type Locale = 'tr' | 'en';

export const defaultLocale: Locale = 'tr';

/** Yayında olan diller. İngilizce hazır olduğunda 'en' eklenecek. */
export const activeLocales: readonly Locale[] = ['tr'];

const segments = {
  tr: {
    search: 'ara',
    about: 'hakkimizda',
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
    search: 'search',
    about: 'about',
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
  search: (query?: string, locale: Locale = defaultLocale) =>
    query
      ? `${section('search', locale)}?q=${encodeURIComponent(query)}`
      : section('search', locale),
  about: (locale: Locale = defaultLocale) => section('about', locale),
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

export type StaticPageKey = 'about' | 'contact';

/** Statik sayfa içerik dosyası adı (content/sayfalar/<ad>.md) ile rota eşlemesi. */
export const staticPageFiles: Record<StaticPageKey, string> = {
  about: 'hakkimizda',
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
