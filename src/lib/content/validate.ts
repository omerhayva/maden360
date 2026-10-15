import { daysBetween } from '@/lib/format';
import { extractCitationIds } from './markdown';
import type { ContentStore, EditorialEntry } from './repository';

/**
 * İçerik doğrulama kuralları (yayın iş akışının otomatik kontrolü).
 *
 * "error" seviyesindeki sorunlar CI'da birleştirmeyi engeller; "warning"
 * seviyesindekiler editörün dikkatine sunulur. Kuralların açıklaması:
 * docs/icerik-is-akisi.md
 */

export type IssueLevel = 'error' | 'warning';

export interface Issue {
  level: IssueLevel;
  file: string;
  message: string;
}

export interface ValidateOptions {
  /** Bugünün tarihi (YYYY-AA-GG) */
  today: string;
  /** Kayıtlı hesap motoru kimlikleri */
  calculatorSlugs: readonly string[];
  /** Yayımlanan içerikte gözden geçirmenin eskimiş sayılacağı gün sayısı */
  reviewMaxAgeDays?: number;
  /** Mevzuat metninin yeniden kontrol edilmesi gereken gün sayısı */
  legalCheckMaxAgeDays?: number;
}

export const REQUIRED_PAGES = ['hakkimizda', 'kaynak-politikasi', 'duzeltme-politikasi', 'iletisim'] as const;

const STATIC_ROUTES = new Set([
  '/',
  '/bilgi',
  '/konular',
  '/hesaplamalar',
  '/rehber',
  '/sozluk',
  '/ara',
  '/hakkimizda',
  '/kaynak-politikasi',
  '/duzeltme-politikasi',
  '/iletisim',
]);

function entryTitle(entry: EditorialEntry): string {
  return entry.kind === 'term' ? entry.term : entry.title;
}

export function validateStore(store: ContentStore, options: ValidateOptions): Issue[] {
  const issues: Issue[] = [];
  const error = (file: string, message: string) => issues.push({ level: 'error', file, message });
  const warn = (file: string, message: string) => issues.push({ level: 'warning', file, message });
  const { today } = options;
  const reviewMaxAge = options.reviewMaxAgeDays ?? 365;
  const legalMaxAge = options.legalCheckMaxAgeDays ?? 180;

  /* ---------------- Kayıt dosyalarında yinelenen kimlikler ---------------- */
  const checkDuplicates = (ids: string[], file: string, label: string) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) error(file, `Yinelenen ${label} kimliği: "${id}".`);
      seen.add(id);
    }
  };
  checkDuplicates(store.categories.map((c) => c.slug), 'content/konular.yaml', 'konu');
  checkDuplicates(store.tags.map((t) => t.slug), 'content/etiketler.yaml', 'etiket');
  checkDuplicates(store.people.map((p) => p.id), 'content/kisiler.yaml', 'kişi');
  checkDuplicates(store.sources.map((s) => s.id), 'content/kaynaklar.yaml', 'kaynak');
  checkDuplicates(store.guide.map((g) => g.id), 'content/rehber.yaml', 'rehber bölümü');

  const categories = new Set(store.categories.map((c) => c.slug));
  const tags = new Set(store.tags.map((t) => t.slug));
  const people = new Map(store.people.map((p) => [p.id, p]));
  const sources = new Map(store.sources.map((s) => [s.id, s]));
  const articles = new Map(store.articles.map((a) => [a.slug, a]));
  const terms = new Map(store.terms.map((t) => [t.slug, t]));
  const calculators = new Map(store.calculators.map((c) => [c.slug, c]));

  /* ---------------- Kaynak kayıtları ---------------- */
  for (const source of store.sources) {
    const file = 'content/kaynaklar.yaml';
    if (source.url && !source.accessedAt) {
      error(file, `"${source.id}": URL'si olan kaynakta erişim tarihi (accessedAt) zorunlu.`);
    }
    if (source.accessedAt && source.accessedAt > today) {
      error(file, `"${source.id}": erişim tarihi gelecekte olamaz (${source.accessedAt}).`);
    }
    if (source.type === 'mevzuat' && !source.identifier) {
      warn(file, `"${source.id}": mevzuat kaynağında Resmî Gazete tarih ve sayısı (identifier) belirtilmeli.`);
    }
    if (!source.url && !source.identifier) {
      warn(file, `"${source.id}": kaynağın bulunabilmesi için url veya identifier (ISBN, DOI vb.) ekleyin.`);
    }
  }

  /* ---------------- Rota ve bağlantı yardımcıları ---------------- */
  type Target = { status: string } | undefined;
  const resolveRoute = (href: string): { exists: boolean; target?: Target } => {
    const pathOnly = href.split(/[?#]/)[0]!.replace(/\/+$/, '') || '/';
    if (STATIC_ROUTES.has(pathOnly)) return { exists: true };
    const [, section, slug, extra] = pathOnly.split('/');
    if (!slug || extra) return { exists: false };
    switch (section) {
      case 'bilgi':
        return { exists: articles.has(slug), target: articles.get(slug) };
      case 'sozluk':
        return { exists: terms.has(slug), target: terms.get(slug) };
      case 'hesaplamalar':
        return { exists: calculators.has(slug), target: calculators.get(slug) };
      case 'konular':
        return { exists: categories.has(slug) };
      default:
        return { exists: false };
    }
  };

  /* ---------------- İçerik dosyaları ---------------- */
  const entries: EditorialEntry[] = [...store.articles, ...store.terms, ...store.calculators];

  for (const entry of entries) {
    const file = entry.file;
    const isPublished = entry.status === 'published';

    if (entry.category && !categories.has(entry.category)) {
      error(file, `Tanımsız konu: "${entry.category}" (content/konular.yaml).`);
    }
    for (const tag of entry.tags) {
      if (!tags.has(tag)) error(file, `Tanımsız etiket: "${tag}" (content/etiketler.yaml).`);
    }
    for (const id of entry.authors) {
      if (!people.has(id)) error(file, `Tanımsız yazar: "${id}" (content/kisiler.yaml).`);
    }
    for (const id of entry.reviewers) {
      const person = people.get(id);
      if (!person) error(file, `Tanımsız inceleyici: "${id}" (content/kisiler.yaml).`);
      else if (!person.canReview) error(file, `"${id}" teknik inceleme yetkisine sahip değil (canReview: true olmalı).`);
    }

    /* Kaynaklar ve atıflar */
    const refIds = entry.sources.map((ref) => ref.id);
    const seenRefs = new Set<string>();
    for (const id of refIds) {
      if (seenRefs.has(id)) error(file, `"${id}" kaynağı sources listesinde birden fazla kez geçiyor.`);
      seenRefs.add(id);
      if (!sources.has(id)) error(file, `Tanımsız kaynak: "${id}" (content/kaynaklar.yaml).`);
    }
    const cited = extractCitationIds(entry.body);
    for (const id of cited) {
      if (!refIds.includes(id)) {
        error(file, `Metinde [@${id}] atfı var ama "${id}" ön bilgideki sources listesinde yok.`);
      }
    }
    if (entry.kind === 'article') {
      for (const id of refIds) {
        if (!cited.includes(id)) {
          warn(file, `"${id}" kaynağı listede var ama metinde [@${id}] ile hiçbir iddiaya bağlanmamış.`);
        }
      }
    }

    /* İlişkiler */
    const checkRelated = (slugs: string[], map: Map<string, { status: string }>, label: string) => {
      for (const slug of slugs) {
        const target = map.get(slug);
        if (!target) error(file, `İlgili ${label} bulunamadı: "${slug}".`);
        else if (isPublished && target.status !== 'published') {
          warn(file, `İlgili ${label} "${slug}" henüz yayımlanmadı; yayında görünmeyecek.`);
        }
      }
    };
    if (entry.kind !== 'calculator') checkRelated(entry.relatedCalculators, calculators, 'hesaplayıcı');
    checkRelated(entry.relatedArticles, articles, 'makale');
    checkRelated(entry.relatedTerms, terms, 'terim');
    if (entry.kind === 'term' && entry.relatedTerms.includes(entry.slug)) {
      warn(file, 'Terim kendisini ilgili terim olarak gösteriyor.');
    }

    /* Metin içi site bağlantıları */
    for (const href of entry.internalLinks) {
      const { exists, target } = resolveRoute(href);
      if (!exists) error(file, `Kırık site içi bağlantı: ${href}`);
      else if (isPublished && target && target.status !== 'published') {
        warn(file, `Bağlantı verilen sayfa (${href}) henüz yayımlanmadı.`);
      }
    }

    /* Tarihler */
    for (const [field, value] of [
      ['publishedAt', entry.publishedAt],
      ['reviewedAt', entry.reviewedAt],
      ['updatedAt', entry.updatedAt],
    ] as const) {
      if (value && value > today) error(file, `${field} gelecekte olamaz (${value}).`);
    }
    if (entry.publishedAt && entry.updatedAt && entry.updatedAt < entry.publishedAt) {
      warn(file, 'updatedAt, publishedAt tarihinden önce görünüyor.');
    }
    for (const correction of entry.corrections) {
      if (correction.date > today) error(file, `Düzeltme tarihi gelecekte olamaz (${correction.date}).`);
    }

    /* Yayın koşulları */
    if (isPublished) {
      if (!entry.publishedAt) error(file, 'Yayımlanan içerikte publishedAt (ilk yayın tarihi) zorunlu.');
      if (!entry.reviewedAt) error(file, 'Yayımlanan içerikte reviewedAt (son teknik inceleme tarihi) zorunlu.');
      if (entry.reviewers.length === 0) error(file, 'Yayımlanan içerikte en az bir teknik inceleyici (reviewers) zorunlu.');
      if (entry.sources.length === 0) error(file, 'Yayımlanan içerikte en az bir kaynak (sources) zorunlu.');
      if (entry.aiAssisted && !entry.reviewers.some((id) => people.get(id)?.kind === 'kisi')) {
        error(file, 'Yapay zekâ destekli içerik, gerçek bir kişi tarafından teknik incelemeden geçmeden yayımlanamaz.');
      }
      if (entry.reviewers.length > 0 && entry.reviewers.every((id) => entry.authors.includes(id))) {
        warn(file, 'İnceleyici ile yazar aynı; bağımsız teknik inceleme önerilir.');
      }
      if (entry.reviewedAt && daysBetween(entry.reviewedAt, today) > reviewMaxAge) {
        warn(file, `Son teknik inceleme ${entry.reviewedAt}; ${Math.round(reviewMaxAge / 30)} aydan eski, yeniden gözden geçirin.`);
      }
    }

    /* Mevzuat */
    if (entry.kind === 'article') {
      if (entry.category === 'mevzuat' && (!entry.legal || entry.legal.length === 0)) {
        error(file, 'Mevzuat konusundaki makalelerde legal alanı (yürürlük ve değişiklik bilgisi) zorunlu.');
      }
      for (const instrument of entry.legal ?? []) {
        if (instrument.checkedAt > today) error(file, `${instrument.instrument}: checkedAt gelecekte olamaz.`);
        if (isPublished && daysBetween(instrument.checkedAt, today) > legalMaxAge) {
          warn(file, `${instrument.instrument}: resmî metin ${Math.round(legalMaxAge / 30)} aydan uzun süredir kontrol edilmedi.`);
        }
      }
    }

    /* SEO */
    const pageTitle = entry.seoTitle ?? entryTitle(entry);
    if (pageTitle.length > 60) {
      warn(file, `Sayfa başlığı ${pageTitle.length} karakter; arama sonuçlarında kesilebilir (öneri ≤ 60, seoTitle ile kısaltın).`);
    }
    const description = entry.seoDescription ?? (entry.kind === 'term' ? entry.definition : entry.summary);
    if (description.length > 160) {
      warn(file, `Açıklama ${description.length} karakter; arama sonuçlarında kesilebilir (öneri ≤ 160, seoDescription ekleyin).`);
    }

    /* Hesaplayıcı – motor eşleşmesi */
    if (entry.kind === 'calculator' && !options.calculatorSlugs.includes(entry.slug)) {
      error(file, `"${entry.slug}" için kayıtlı hesap motoru yok (src/calculators/registry.ts).`);
    }
  }

  for (const slug of options.calculatorSlugs) {
    if (!calculators.has(slug)) {
      error('src/calculators/registry.ts', `"${slug}" hesap motorunun açıklama dosyası yok: content/hesaplamalar/${slug}.md`);
    }
  }

  /* ---------------- Rehber ---------------- */
  for (const section of store.guide) {
    for (const ref of section.items) {
      const [type, slug] = ref.split(':') as [string, string];
      const map = type === 'makale' ? articles : type === 'sozluk' ? terms : calculators;
      if (!map.has(slug)) error('content/rehber.yaml', `"${section.id}" bölümünde bulunamayan öğe: ${ref}`);
    }
  }

  /* ---------------- Zorunlu sayfalar ---------------- */
  for (const slug of REQUIRED_PAGES) {
    const page = store.pages.find((p) => p.slug === slug);
    if (!page) error(`content/sayfalar/${slug}.md`, 'Zorunlu sayfa eksik.');
    else if (page.status !== 'published') error(page.file, 'Güven sayfaları her zaman yayımlanmış olmalı.');
  }

  /* ---------------- Kullanılmayan kayıtlar (bilgi amaçlı) ---------------- */
  const usedSources = new Set(entries.flatMap((entry) => entry.sources.map((ref) => ref.id)));
  for (const source of store.sources) {
    if (!usedSources.has(source.id)) warn('content/kaynaklar.yaml', `"${source.id}" kaynağı hiçbir içerikte kullanılmıyor.`);
  }

  const termNames = new Map<string, string>();
  for (const term of store.terms) {
    const key = term.term.toLocaleLowerCase('tr-TR');
    const existing = termNames.get(key);
    if (existing) warn(term.file, `"${term.term}" terimi ${existing} dosyasında da tanımlı.`);
    termNames.set(key, term.file);
  }

  return issues;
}
