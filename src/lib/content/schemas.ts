import { z } from 'zod';

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
