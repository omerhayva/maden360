import { z } from 'zod';
import { isPhoneNumber } from '@/lib/listings/contact';
import {
  ANALYSIS_BASES,
  APPLY_METHODS,
  AVAILABILITY,
  CONDITIONS,
  CONTACT_MODES,
  CURRENCIES,
  EMPLOYMENT_TYPES,
  LICENSE_KINDS,
  LICENSE_OFFERS,
  MARKET_KINDS,
  MARKET_TYPES,
  MINE_GROUPS,
  POSITION_GROUPS,
  QUANTITY_UNITS,
  REF_PATTERN,
  RESERVE_BASES,
  SALARY_BASES,
  SALARY_PERIODS,
  SELLER_KINDS,
  SITE_TYPES,
  VAT_OPTIONS,
} from '@/lib/listings/options';

/**
 * İçerik şemaları.
 *
 * Markdown dosyalarının ön bilgileri (frontmatter) ve YAML kayıt dosyaları bu
 * şemalarla doğrulanır. Hatalı alan adı (ör. "reviwers") veya eksik zorunlu alan
 * derlemeyi durdurur; böylece yanlış biçimli içerik yayına çıkamaz.
 */

export const slugSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Yalnızca küçük harf (a-z), rakam ve tire kullanın; Türkçe karakter ve boşluk kullanmayın.',
  );

export const isoDateSchema = z.iso.date('Tarih YYYY-AA-GG biçiminde olmalı (ör. 2026-10-15).');

export const contentStatusSchema = z.enum(['draft', 'review', 'published'], {
  error: 'Durum (status) "draft", "review" veya "published" olmalı.',
});
export type ContentStatus = z.infer<typeof contentStatusSchema>;

export const languageSchema = z.enum(['tr', 'en']);
export type ContentLanguage = z.infer<typeof languageSchema>;

/** İçerikten kaynağa bağlantı (plan: ARTICLE_SOURCE / CALCULATOR_SOURCE + claim_note). */
export const sourceRefSchema = z.strictObject({
  id: slugSchema,
  /** Kaynağın ilgili bölümü: "Bölüm 1", "Madde 2", "s. 45-47" */
  locator: z.string().min(1).optional(),
  /** Bu kaynağın içerikteki hangi iddiayı desteklediği. */
  note: z.string().min(5).optional(),
});
export type SourceRef = z.infer<typeof sourceRefSchema>;

export const correctionSchema = z.strictObject({
  date: isoDateSchema,
  note: z.string().min(10, 'Düzeltme notu en az 10 karakter olmalı.'),
});
export type Correction = z.infer<typeof correctionSchema>;

const editorialFields = {
  status: contentStatusSchema,
  language: languageSchema.default('tr'),
  /** İçeriği hazırlayan kişi/ekip kimlikleri (content/kisiler.yaml). */
  authors: z.array(slugSchema).min(1, 'En az bir yazar (authors) belirtilmeli.'),
  /** Teknik incelemeyi yapan kişi kimlikleri. Yayımlanan içerikte zorunlu. */
  reviewers: z.array(slugSchema).default([]),
  publishedAt: isoDateSchema.optional(),
  updatedAt: isoDateSchema.optional(),
  reviewedAt: isoDateSchema.optional(),
  sources: z.array(sourceRefSchema).default([]),
  corrections: z.array(correctionSchema).default([]),
  /** Taslak yapay zekâ desteğiyle hazırlandıysa true. İnsan incelemesi olmadan yayımlanamaz. */
  aiAssisted: z.boolean().default(false),
  /** İleride çeviriler arasında eşleştirme için (varsayılan: dosya adı). */
  translationKey: slugSchema.optional(),
};

const seoFields = {
  seoTitle: z.string().min(10).max(70).optional(),
  seoDescription: z.string().min(50).max(170).optional(),
};

const legalInstrumentSchema = z.strictObject({
  /** "3213 sayılı Maden Kanunu" */
  instrument: z.string().min(3),
  /** Resmî Gazete tarihi ve sayısı vb. */
  publication: z.string().min(3),
  /** Yürürlük tarihi */
  effectiveDate: isoDateSchema,
  lastAmendment: z
    .strictObject({
      date: isoDateSchema,
      description: z.string().min(5),
    })
    .optional(),
  officialUrl: z.url('Geçerli bir URL girin.'),
  /** Metnin resmî kaynaktan en son kontrol edildiği tarih */
  checkedAt: isoDateSchema,
});
export type LegalInstrument = z.infer<typeof legalInstrumentSchema>;

export const articleFrontmatterSchema = z.strictObject({
  title: z.string().min(5).max(110),
  summary: z.string().min(40).max(280),
  category: slugSchema,
  tags: z.array(slugSchema).default([]),
  /** Aramada eşleşmesi istenen eş anlamlılar ve alternatif yazımlar. */
  keywords: z.array(z.string().min(2)).default([]),
  relatedArticles: z.array(slugSchema).default([]),
  relatedCalculators: z.array(slugSchema).default([]),
  relatedTerms: z.array(slugSchema).default([]),
  /** Mevzuat içeriğinde yürürlük ve değişiklik bilgisi. */
  legal: z.array(legalInstrumentSchema).optional(),
  featured: z.boolean().default(false),
  ...editorialFields,
  ...seoFields,
});
export type ArticleFrontmatter = z.infer<typeof articleFrontmatterSchema>;

export const termFrontmatterSchema = z.strictObject({
  term: z.string().min(2).max(80),
  /** İngilizce karşılığı */
  english: z.string().min(2).optional(),
  abbreviation: z.string().min(1).optional(),
  /** Eş anlamlılar / sahada kullanılan diğer adlar */
  aliases: z.array(z.string().min(2)).default([]),
  /** Kısa tanım: sözlük listesinde ve arama sonuçlarında gösterilir. */
  definition: z.string().min(30).max(320),
  category: slugSchema.optional(),
  tags: z.array(slugSchema).default([]),
  relatedTerms: z.array(slugSchema).default([]),
  relatedArticles: z.array(slugSchema).default([]),
  relatedCalculators: z.array(slugSchema).default([]),
  ...editorialFields,
  ...seoFields,
});
export type TermFrontmatter = z.infer<typeof termFrontmatterSchema>;

export const calculatorFrontmatterSchema = z.strictObject({
  title: z.string().min(5).max(110),
  /** Kartlarda görünen kısa ad */
  shortTitle: z.string().min(3).max(40),
  summary: z.string().min(40).max(280),
  category: slugSchema,
  tags: z.array(slugSchema).default([]),
  keywords: z.array(z.string().min(2)).default([]),
  order: z.number().int().default(100),
  relatedArticles: z.array(slugSchema).default([]),
  relatedTerms: z.array(slugSchema).default([]),
  ...editorialFields,
  ...seoFields,
});
export type CalculatorFrontmatter = z.infer<typeof calculatorFrontmatterSchema>;

export const pageFrontmatterSchema = z.strictObject({
  title: z.string().min(3).max(110),
  summary: z.string().min(40).max(280),
  status: contentStatusSchema,
  updatedAt: isoDateSchema,
  ...seoFields,
});
export type PageFrontmatter = z.infer<typeof pageFrontmatterSchema>;

/* ------------------------------------------------------------------ */
/* YAML kayıt dosyaları                                                */
/* ------------------------------------------------------------------ */

export const categoryIconSchema = z.enum([
  'pickaxe',
  'layers',
  'wind',
  'truck',
  'mountain',
  'flask',
  'chart',
  'scale',
  // Sanal fuar salonları ve market kategorileri
  'drill',
  'hard-hat',
  'cog',
  'factory',
  'compass',
  'leaf',
  'zap',
  'gem',
  'map',
  'wrench',
  'microscope',
  'briefcase',
]);
export type CategoryIcon = z.infer<typeof categoryIconSchema>;

export const categorySchema = z.strictObject({
  slug: slugSchema,
  name: z.string().min(3),
  description: z.string().min(20),
  icon: categoryIconSchema,
  order: z.number().int(),
});
export type Category = z.infer<typeof categorySchema>;

export const tagSchema = z.strictObject({
  slug: slugSchema,
  name: z.string().min(2),
});
export type Tag = z.infer<typeof tagSchema>;

export const personSchema = z.strictObject({
  id: slugSchema,
  name: z.string().min(2),
  /** "kisi": gerçek kişi, "ekip": yayın ekibi/kurumsal imza */
  kind: z.enum(['kisi', 'ekip']),
  /** Unvan / uzmanlık: "Maden Mühendisi", "Cevher Hazırlama Mühendisi" */
  title: z.string().optional(),
  affiliation: z.string().optional(),
  bio: z.string().optional(),
  url: z.url().optional(),
  /** Teknik inceleme yapmaya yetkili mi? */
  canReview: z.boolean().default(false),
  /** Fuar standı, iş ilanı, aday profili ve market ilanlarını onaylayıp yayımlayabilir mi? */
  canModerate: z.boolean().default(false),
});
export type Person = z.infer<typeof personSchema>;

export const sourceTypeSchema = z.enum([
  'resmi-kurum',
  'mevzuat',
  'akademik',
  'kitap',
  'standart',
  'kilavuz',
  'sektor',
]);
export type SourceType = z.infer<typeof sourceTypeSchema>;

export const sourceSchema = z.strictObject({
  id: slugSchema,
  type: sourceTypeSchema,
  title: z.string().min(3),
  authors: z.string().optional(),
  /** Yayıncı / kurum */
  publisher: z.string().min(2),
  /** Belge tarihi: YYYY, YYYY-AA veya YYYY-AA-GG */
  published: z.coerce
    .string()
    .regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, 'Belge tarihi YYYY, YYYY-AA veya YYYY-AA-GG olmalı.'),
  edition: z.string().optional(),
  /** ISBN, DOI, Resmî Gazete tarih/sayı vb. */
  identifier: z.string().optional(),
  url: z.url('Geçerli bir URL girin.').optional(),
  /** Erişim (son kontrol) tarihi; URL varsa zorunlu. */
  accessedAt: isoDateSchema.optional(),
  language: z.enum(['tr', 'en', 'de', 'fr']).default('tr'),
  note: z.string().optional(),
});
export type Source = z.infer<typeof sourceSchema>;

export const guideItemRefSchema = z
  .string()
  .regex(
    /^(makale|sozluk|hesaplama):[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Rehber öğesi "makale:slug", "sozluk:slug" veya "hesaplama:slug" biçiminde olmalı.',
  );

export const guideSectionSchema = z.strictObject({
  id: slugSchema,
  title: z.string().min(3),
  description: z.string().min(20),
  items: z.array(guideItemRefSchema).min(1),
});
export type GuideSection = z.infer<typeof guideSectionSchema>;

export const categoriesFileSchema = z.array(categorySchema);
export const tagsFileSchema = z.array(tagSchema);
export const peopleFileSchema = z.array(personSchema);
export const sourcesFileSchema = z.array(sourceSchema);
export const guideFileSchema = z.array(guideSectionSchema);

/* ------------------------------------------------------------------ */
/* Sanal fuar, iş ilanları ve market                                   */
/* ------------------------------------------------------------------ */

/** Yalnızca http(s) adresleri (javascript: vb. şemalar reddedilir). */
export const httpUrlSchema = z.url({
  protocol: /^https?$/,
  error: 'Geçerli bir http(s) adresi girin (ör. https://www.ornek.com.tr).',
});

export const phoneSchema = z
  .string()
  .refine(isPhoneNumber, 'Telefon numarası 10–15 rakamdan oluşmalı (ör. 0312 123 45 67).');

export const emailSchema = z.email('Geçerli bir e-posta adresi girin.');

/** Sanal fuar salonu (tedarikçi grubu) */
export const hallSchema = z.strictObject({
  slug: slugSchema,
  /** Salon harfi: kartlarda "Salon A" olarak görünür */
  code: z.string().regex(/^[A-Z]$/, 'Salon kodu tek büyük harf olmalı (A, B, C...).'),
  name: z.string().min(3),
  description: z.string().min(20),
  icon: categoryIconSchema,
  order: z.number().int(),
});
export type Hall = z.infer<typeof hallSchema>;

/** Kategori sayfasında ve ilan sayfalarında gösterilen yasal / güvenlik notu */
export const noticeSchema = z.strictObject({
  title: z.string().min(5),
  text: z.string().min(40),
  sources: z.array(sourceRefSchema).default([]),
});
export type Notice = z.infer<typeof noticeSchema>;

export const marketCategorySchema = z.strictObject({
  slug: slugSchema,
  name: z.string().min(3),
  description: z.string().min(20),
  icon: categoryIconSchema,
  order: z.number().int(),
  /** Kategori türü; ilanda hangi alanların zorunlu olduğunu belirler. */
  kind: z.enum(MARKET_KINDS),
  notice: noticeSchema.optional(),
});
export type MarketCategory = z.infer<typeof marketCategorySchema>;

/** Meslek / pozisyon (iş ilanları ve aday profilleri için) */
export const positionSchema = z.strictObject({
  slug: slugSchema,
  name: z.string().min(3),
  group: z.enum(POSITION_GROUPS),
  /** Sözlükte karşılığı varsa terim slug'ı (ör. daimi-nezaretci) */
  term: slugSchema.optional(),
});
export type Position = z.infer<typeof positionSchema>;

/**
 * Tüm ilan türlerinde ortak yayın alanları.
 * draft: başvuru alındı / hazırlanıyor · review: editör onayı bekliyor · published: yayında
 */
const listingFields = {
  status: contentStatusSchema,
  /** Başvuru numarası (formdan gelen referans): MKT-20261016-K7QX */
  ref: z
    .string()
    .regex(REF_PATTERN, 'Başvuru numarası FRM|IS|ADY|MKT-YYYYAAGG-XXXX biçiminde olmalı.')
    .optional(),
  /** İlanın sitede yayımlandığı tarih */
  postedAt: isoDateSchema.optional(),
  /** Yayının sona erdiği gün (o gün dahil). Süresi dolan ilan otomatik olarak gizlenir. */
  expiresAt: isoDateSchema.optional(),
  updatedAt: isoDateSchema.optional(),
  /** Onaylayan editör (content/kisiler.yaml, canModerate: true) */
  moderatedBy: slugSchema.optional(),
  moderatedAt: isoDateSchema.optional(),
  /** Örnek (gösterim amaçlı) içerik: asla yayımlanamaz. */
  example: z.boolean().default(false),
  keywords: z.array(z.string().min(2)).default([]),
  ...seoFields,
};

const offeringSchema = z.strictObject({
  name: z.string().min(2).max(80),
  description: z.string().min(5).max(240).optional(),
});

/** Sanal fuar standı (firma vitrini) */
export const standFrontmatterSchema = z.strictObject({
  name: z.string().min(2).max(90),
  summary: z.string().min(40).max(220),
  halls: z.array(slugSchema).min(1, 'En az bir salon seçin.').max(3, 'En fazla üç salon seçilebilir.'),
  /** Merkezin bulunduğu il */
  city: z.string().min(2),
  /** Hizmet verilen iller / bölgeler ("Türkiye geneli", "Yurt dışı" kullanılabilir) */
  serviceArea: z.array(z.string().min(2)).default([]),
  founded: z.number().int().min(1800).max(2100).optional(),
  website: httpUrlSchema.optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  address: z.string().min(5).optional(),
  /** Ürün ve hizmetler */
  offerings: z.array(offeringSchema).default([]),
  /** Temsil edilen / satılan markalar */
  brands: z.array(z.string().min(1)).default([]),
  certificates: z.array(z.string().min(2)).default([]),
  /** public/fuar/ altındaki logo dosyası: /fuar/firma-adi.svg */
  logo: z
    .string()
    .regex(/^\/fuar\/[a-z0-9-]+\.(svg|png|webp|jpg)$/, 'Logo yolu /fuar/dosya-adi.svg biçiminde olmalı.')
    .optional(),
  /** Editörün firma bilgilerini nasıl doğruladığı (ticaret sicili, web sitesi, telefon görüşmesi vb.) */
  verification: z
    .strictObject({ method: z.string().min(10), checkedAt: isoDateSchema })
    .optional(),
  featured: z.boolean().default(false),
  ...listingFields,
});
export type StandFrontmatter = z.infer<typeof standFrontmatterSchema>;

export const salarySchema = z.strictObject({
  min: z.number().positive().optional(),
  max: z.number().positive().optional(),
  currency: z.enum(CURRENCIES).default('TRY'),
  period: z.enum(SALARY_PERIODS).default('aylik'),
  basis: z.enum(SALARY_BASES).default('net'),
});

/** İş ilanı (işçi arayan işveren) */
export const jobFrontmatterSchema = z.strictObject({
  title: z.string().min(5).max(90),
  summary: z.string().min(30).max(220),
  position: slugSchema,
  employer: z.strictObject({
    name: z.string().min(2),
    /** Firmanın sanal fuar standı varsa slug'ı */
    stand: slugSchema.optional(),
    website: httpUrlSchema.optional(),
  }),
  city: z.string().min(2),
  district: z.string().min(2).optional(),
  siteType: z.enum(SITE_TYPES),
  employmentType: z.enum(EMPLOYMENT_TYPES),
  /** Vardiya düzeni: "3 vardiya, 8 saat" */
  shift: z.string().min(3).optional(),
  openings: z.number().int().min(1).max(500).default(1),
  experienceYears: z.number().int().min(0).max(40).optional(),
  education: z.string().min(2).optional(),
  requirements: z.array(z.string().min(3)).default([]),
  certificates: z.array(z.string().min(2)).default([]),
  benefits: z.array(z.string().min(2)).default([]),
  salary: salarySchema.optional(),
  apply: z.strictObject({
    method: z.enum(APPLY_METHODS),
    value: z.string().min(3),
    note: z.string().min(3).optional(),
  }),
  ...listingFields,
});
export type JobFrontmatter = z.infer<typeof jobFrontmatterSchema>;

/**
 * Aday profili (iş arayan). Kimlik ve iletişim bilgisi içermez; işverenlerin
 * talepleri editör aracılığıyla adaya iletilir.
 */
export const candidateFrontmatterSchema = z.strictObject({
  headline: z.string().min(5).max(90),
  summary: z.string().min(30).max(220),
  position: slugSchema,
  experienceYears: z.number().int().min(0).max(50),
  education: z.string().min(2).optional(),
  certificates: z.array(z.string().min(2)).default([]),
  skills: z.array(z.string().min(2)).default([]),
  languages: z.array(z.string().min(2)).default([]),
  preferredCities: z.array(z.string().min(2)).min(1, 'En az bir tercih edilen il veya "Türkiye geneli" yazın.'),
  siteTypes: z.array(z.enum(SITE_TYPES)).default([]),
  employmentTypes: z.array(z.enum(EMPLOYMENT_TYPES)).default([]),
  availability: z.enum(AVAILABILITY).default('belirtilmedi'),
  /** Adayın profilinin yayımlanmasına açık rıza verdiği tarih */
  consentAt: isoDateSchema,
  ...listingFields,
});
export type CandidateFrontmatter = z.infer<typeof candidateFrontmatterSchema>;

export const priceSchema = z.strictObject({
  amount: z.number().positive('Fiyat sıfırdan büyük olmalı.'),
  currency: z.enum(CURRENCIES).default('TRY'),
  per: z.string().min(1).max(20).optional(),
  vat: z.enum(VAT_OPTIONS).optional(),
  negotiable: z.boolean().default(false),
});

/** Market ilanı: ekipman, yedek parça, hizmet, cevher/ürün, saha/ruhsat */
export const marketFrontmatterSchema = z.strictObject({
  title: z.string().min(5).max(90),
  summary: z.string().min(30).max(220),
  category: slugSchema,
  type: z.enum(MARKET_TYPES),
  condition: z.enum(CONDITIONS).optional(),
  // YAML'da sayı olarak yazılabilen metinler (ör. model: 320) metne çevrilir
  brand: z.coerce.string().min(1).optional(),
  model: z.coerce.string().min(1).optional(),
  year: z.number().int().min(1950).max(2100).optional(),
  /** Çalışma saati (iş makineleri) */
  hours: z.number().int().min(0).max(500_000).optional(),
  specs: z
    .array(z.strictObject({ label: z.coerce.string().min(2).max(40), value: z.coerce.string().min(1).max(80) }))
    .default([]),
  quantity: z
    .strictObject({ value: z.number().positive(), unit: z.enum(QUANTITY_UNITS) })
    .optional(),
  price: priceSchema.optional(),
  city: z.string().min(2),
  district: z.string().min(2).optional(),
  seller: z.strictObject({
    name: z.string().min(2),
    kind: z.enum(SELLER_KINDS),
    stand: slugSchema.optional(),
  }),
  contact: z.strictObject({
    mode: z.enum(CONTACT_MODES),
    phone: phoneSchema.optional(),
    email: emailSchema.optional(),
    website: httpUrlSchema.optional(),
  }),
  /** Cevher ve ürün ilanlarında zorunlu */
  ore: z
    .strictObject({
      mineral: z.string().min(2),
      /** Tenör / kalite beyanı: "%40–42 Cr₂O₃" */
      grade: z.coerce.string().min(1).optional(),
      analysis: z.enum(ANALYSIS_BASES),
      /** Teslim şekli: "Ocak başı", "Mersin limanı (FOB)" */
      delivery: z.string().min(2).optional(),
    })
    .optional(),
  /** Saha ve ruhsat ilanlarında zorunlu */
  license: z
    .strictObject({
      group: z.enum(MINE_GROUPS),
      kind: z.enum(LICENSE_KINDS),
      offer: z.enum(LICENSE_OFFERS),
      areaHectares: z.number().positive().optional(),
      reserve: z.enum(RESERVE_BASES).default('yok'),
    })
    .optional(),
  images: z
    .array(
      z.strictObject({
        src: z
          .string()
          .regex(/^\/market\/[a-z0-9-]+\.(webp|jpg|jpeg|png)$/, 'Görsel yolu /market/dosya-adi.webp biçiminde olmalı.'),
        alt: z.string().min(5),
      }),
    )
    .max(4, 'En fazla 4 görsel eklenebilir.')
    .default([]),
  ...listingFields,
});
export type MarketFrontmatter = z.infer<typeof marketFrontmatterSchema>;

export const hallsFileSchema = z.array(hallSchema);
export const marketCategoriesFileSchema = z.array(marketCategorySchema);
export const positionsFileSchema = z.array(positionSchema);
