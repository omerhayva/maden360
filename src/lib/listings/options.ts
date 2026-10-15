/**
 * Sanal fuar, iş ilanı, aday profili ve market ilanı alanlarının seçenekleri.
 *
 * Aynı listeler içerik şemalarında (zod), sayfalarda ve başvuru formlarında
 * kullanılır. Bu dosya tarayıcıda da çalışır; sunucuya özgü bir şey içe aktarmaz.
 */

export type Option<T extends string = string> = { value: T; label: string };

function options<T extends string>(labels: Record<T, string>): Option<T>[] {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));
}

/* ------------------------------ İlan türleri ------------------------------ */

export const LISTING_KINDS = ['stand', 'job', 'candidate', 'market'] as const;
export type ListingKind = (typeof LISTING_KINDS)[number];

/** Yayın süresi üst sınırı (gün). İlan kuralları sayfasında da bu süreler yazılıdır. */
export const LISTING_MAX_DAYS: Record<ListingKind, number> = {
  stand: 365,
  job: 60,
  candidate: 60,
  market: 90,
};

export const listingKindLabels: Record<ListingKind, string> = {
  stand: 'Fuar standı',
  job: 'İş ilanı',
  candidate: 'Aday profili',
  market: 'Market ilanı',
};

/** Başvuru numarası önekleri: MKT-20261016-K7QX */
export const REF_PREFIXES = {
  stand: 'FRM',
  job: 'IS',
  candidate: 'ADY',
  market: 'MKT',
  contact: 'ILT',
} as const;
export type RefPrefix = (typeof REF_PREFIXES)[keyof typeof REF_PREFIXES];

export const REF_PATTERN = /^(FRM|IS|ADY|MKT|ILT)-\d{8}-[A-Z2-9]{4}$/;

/* ------------------------------ İş ilanları ------------------------------ */

export const siteTypeLabels = {
  'acik-ocak': 'Açık ocak',
  yeralti: 'Yeraltı',
  tesis: 'Tesis',
  saha: 'Saha / arama',
  ofis: 'Ofis',
  karma: 'Karma',
} as const;
export type SiteType = keyof typeof siteTypeLabels;
export const SITE_TYPES = Object.keys(siteTypeLabels) as [SiteType, ...SiteType[]];
export const siteTypeOptions = options(siteTypeLabels);

export const employmentTypeLabels = {
  'tam-zamanli': 'Tam zamanlı',
  'yari-zamanli': 'Yarı zamanlı',
  sozlesmeli: 'Sözleşmeli',
  proje: 'Proje bazlı',
  sezonluk: 'Sezonluk',
  staj: 'Staj',
} as const;
export type EmploymentType = keyof typeof employmentTypeLabels;
export const EMPLOYMENT_TYPES = Object.keys(employmentTypeLabels) as [
  EmploymentType,
  ...EmploymentType[],
];
export const employmentTypeOptions = options(employmentTypeLabels);

export const availabilityLabels = {
  hemen: 'Hemen başlayabilir',
  '2-hafta': '2 hafta içinde',
  '1-ay': '1 ay içinde',
  '3-ay': '3 ay içinde',
  belirtilmedi: 'Belirtilmedi',
} as const;
export type Availability = keyof typeof availabilityLabels;
export const AVAILABILITY = Object.keys(availabilityLabels) as [Availability, ...Availability[]];
export const availabilityOptions = options(availabilityLabels);

export const salaryPeriodLabels = {
  aylik: 'aylık',
  gunluk: 'günlük',
  saatlik: 'saatlik',
  yillik: 'yıllık',
} as const;
export type SalaryPeriod = keyof typeof salaryPeriodLabels;
export const SALARY_PERIODS = Object.keys(salaryPeriodLabels) as [SalaryPeriod, ...SalaryPeriod[]];

export const salaryBasisLabels = { net: 'net', brut: 'brüt' } as const;
export type SalaryBasis = keyof typeof salaryBasisLabels;
export const SALARY_BASES = Object.keys(salaryBasisLabels) as [SalaryBasis, ...SalaryBasis[]];

export const applyMethodLabels = {
  eposta: 'E-posta',
  url: 'Başvuru sayfası',
  telefon: 'Telefon',
} as const;
export type ApplyMethod = keyof typeof applyMethodLabels;
export const APPLY_METHODS = Object.keys(applyMethodLabels) as [ApplyMethod, ...ApplyMethod[]];

export const positionGroupLabels = {
  muhendis: 'Mühendislik',
  teknik: 'Teknik personel',
  saha: 'Saha ve operatör',
  isg: 'İş sağlığı ve güvenliği',
  idari: 'İdari ve destek',
} as const;
export type PositionGroup = keyof typeof positionGroupLabels;
export const POSITION_GROUPS = Object.keys(positionGroupLabels) as [
  PositionGroup,
  ...PositionGroup[],
];

/* ------------------------------ Market ------------------------------ */

export const marketTypeLabels = {
  satilik: 'Satılık',
  kiralik: 'Kiralık',
  aranan: 'Aranıyor',
  hizmet: 'Hizmet',
} as const;
export type MarketType = keyof typeof marketTypeLabels;
export const MARKET_TYPES = Object.keys(marketTypeLabels) as [MarketType, ...MarketType[]];
export const marketTypeOptions = options(marketTypeLabels);

/** Market kategorisinin türü; ilanda hangi alanların zorunlu olduğunu belirler. */
export const marketKindLabels = {
  ekipman: 'Ekipman ve makine',
  parca: 'Yedek parça',
  hizmet: 'Hizmet',
  cevher: 'Cevher ve ürün',
  saha: 'Saha ve ruhsat',
} as const;
export type MarketKind = keyof typeof marketKindLabels;
export const MARKET_KINDS = Object.keys(marketKindLabels) as [MarketKind, ...MarketKind[]];

export const conditionLabels = {
  yeni: 'Sıfır',
  'ikinci-el': 'İkinci el',
  yenilenmis: 'Yenilenmiş',
} as const;
export type Condition = keyof typeof conditionLabels;
export const CONDITIONS = Object.keys(conditionLabels) as [Condition, ...Condition[]];
export const conditionOptions = options(conditionLabels);

export const CURRENCIES = ['TRY', 'USD', 'EUR'] as const;
export type Currency = (typeof CURRENCIES)[number];

export const vatLabels = { dahil: 'KDV dahil', haric: '+ KDV' } as const;
export type Vat = keyof typeof vatLabels;
export const VAT_OPTIONS = Object.keys(vatLabels) as [Vat, ...Vat[]];

export const quantityUnitLabels = {
  adet: 'adet',
  t: 'ton',
  m3: 'm³',
  't-ay': 'ton/ay',
  't-yil': 'ton/yıl',
} as const;
export type QuantityUnit = keyof typeof quantityUnitLabels;
export const QUANTITY_UNITS = Object.keys(quantityUnitLabels) as [QuantityUnit, ...QuantityUnit[]];

/** Cevher ilanında tenör/kalite beyanının dayanağı */
export const analysisBasisLabels = {
  'akredite-laboratuvar': 'Akredite laboratuvar analizi',
  laboratuvar: 'Laboratuvar analizi (akreditasyon belirtilmedi)',
  beyan: 'İlan sahibinin beyanı',
  yok: 'Analiz yok',
} as const;
export type AnalysisBasis = keyof typeof analysisBasisLabels;
export const ANALYSIS_BASES = Object.keys(analysisBasisLabels) as [
  AnalysisBasis,
  ...AnalysisBasis[],
];
export const analysisBasisOptions = options(analysisBasisLabels);

/** 3213 sayılı Maden Kanunu md. 2'deki maden grupları */
export const MINE_GROUPS = [
  'I(a)',
  'I(b)',
  'II(a)',
  'II(b)',
  'II(c)',
  'III',
  'IV(a)',
  'IV(b)',
  'IV(c)',
  'IV(ç)',
  'V',
] as const;
export type MineGroup = (typeof MINE_GROUPS)[number];

export const licenseKindLabels = { arama: 'Arama ruhsatı', isletme: 'İşletme ruhsatı' } as const;
export type LicenseKind = keyof typeof licenseKindLabels;
export const LICENSE_KINDS = Object.keys(licenseKindLabels) as [LicenseKind, ...LicenseKind[]];
export const licenseKindOptions = options(licenseKindLabels);

export const licenseOfferLabels = {
  devir: 'Ruhsat devri',
  rodovans: 'Rödövans',
  ortaklik: 'Ortaklık / yatırımcı',
} as const;
export type LicenseOffer = keyof typeof licenseOfferLabels;
export const LICENSE_OFFERS = Object.keys(licenseOfferLabels) as [LicenseOffer, ...LicenseOffer[]];
export const licenseOfferOptions = options(licenseOfferLabels);

export const reserveBasisLabels = {
  'umrek-raporu': 'UMREK koduna uygun rapor',
  'teknik-rapor': 'Teknik rapor (UMREK dışı)',
  yok: 'Rezerv raporu yok',
} as const;
export type ReserveBasis = keyof typeof reserveBasisLabels;
export const RESERVE_BASES = Object.keys(reserveBasisLabels) as [ReserveBasis, ...ReserveBasis[]];
export const reserveBasisOptions = options(reserveBasisLabels);

export const sellerKindLabels = { firma: 'Firma', kisi: 'Bireysel' } as const;
export type SellerKind = keyof typeof sellerKindLabels;
export const SELLER_KINDS = Object.keys(sellerKindLabels) as [SellerKind, ...SellerKind[]];

export const contactModeLabels = {
  dogrudan: 'İletişim bilgileri ilanda görünsün',
  aracili: 'İletişim bilgilerim gizli kalsın; talepler Maden360 üzerinden iletilsin',
} as const;
export type ContactMode = keyof typeof contactModeLabels;
export const CONTACT_MODES = Object.keys(contactModeLabels) as [ContactMode, ...ContactMode[]];

/* ------------------------------ Yardımcılar ------------------------------ */

/** Türkiye'nin 81 ili (filtre ve form seçenekleri için). */
export const PROVINCES = [
  'Adana',
  'Adıyaman',
  'Afyonkarahisar',
  'Ağrı',
  'Aksaray',
  'Amasya',
  'Ankara',
  'Antalya',
  'Ardahan',
  'Artvin',
  'Aydın',
  'Balıkesir',
  'Bartın',
  'Batman',
  'Bayburt',
  'Bilecik',
  'Bingöl',
  'Bitlis',
  'Bolu',
  'Burdur',
  'Bursa',
  'Çanakkale',
  'Çankırı',
  'Çorum',
  'Denizli',
  'Diyarbakır',
  'Düzce',
  'Edirne',
  'Elazığ',
  'Erzincan',
  'Erzurum',
  'Eskişehir',
  'Gaziantep',
  'Giresun',
  'Gümüşhane',
  'Hakkâri',
  'Hatay',
  'Iğdır',
  'Isparta',
  'İstanbul',
  'İzmir',
  'Kahramanmaraş',
  'Karabük',
  'Karaman',
  'Kars',
  'Kastamonu',
  'Kayseri',
  'Kilis',
  'Kırıkkale',
  'Kırklareli',
  'Kırşehir',
  'Kocaeli',
  'Konya',
  'Kütahya',
  'Malatya',
  'Manisa',
  'Mardin',
  'Mersin',
  'Muğla',
  'Muş',
  'Nevşehir',
  'Niğde',
  'Ordu',
  'Osmaniye',
  'Rize',
  'Sakarya',
  'Samsun',
  'Siirt',
  'Sinop',
  'Sivas',
  'Şanlıurfa',
  'Şırnak',
  'Tekirdağ',
  'Tokat',
  'Trabzon',
  'Tunceli',
  'Uşak',
  'Van',
  'Yalova',
  'Yozgat',
  'Zonguldak',
] as const;

/** İl yerine kullanılabilecek genel bölge ifadeleri (aday tercihleri, hizmet bölgeleri). */
export const REGION_WILDCARDS = ['Türkiye geneli', 'Yurt dışı'] as const;
