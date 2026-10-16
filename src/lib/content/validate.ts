import fs from 'node:fs';
import path from 'node:path';
import { siteConfig } from '@/config/site';
import { optionalPageFiles } from '@/i18n/routes';
import { isSubmissionType } from '@/lib/submissions/types';
import type { ContentStore } from './repository';
import { validateListings } from './validate-listings';

/**
 * İçerik doğrulama kuralları (yayın iş akışının otomatik kontrolü).
 *
 * "error" seviyesindeki sorunlar CI'da birleştirmeyi engeller; "warning"
 * seviyesindekiler editörün dikkatine sunulur. İlan kurallarının açıklaması:
 * docs/ilanlar-ve-fuar.md
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
  /** Mevzuat atıflarının yeniden kontrol edilmesi gereken gün sayısı */
  legalCheckMaxAgeDays?: number;
  /** public/ altındaki dosyanın boyutu (bayt); yoksa null. Testlerde değiştirilebilir. */
  publicFileSize?: (publicPath: string) => number | null;
  /** Başvuruların gideceği adres (varsayılan: src/config/site.ts → listingsEmail) */
  listingsEmail?: string;
}

/** Her zaman yayımlanmış olması gereken güven sayfaları */
export const REQUIRED_PAGES = ['hakkimizda', 'iletisim'] as const;

const STATIC_ROUTES = new Set([
  '/',
  '/ara',
  '/hakkimizda',
  '/iletisim',
  '/fuar',
  '/is-ilanlari',
  '/is-arayanlar',
  '/market',
  '/ilan-ver',
  '/iletisim-talebi',
]);

/** Doldurulması gereken alanlar: [VERİ SORUMLUSUNUN ADI] (bağlantı metinleri hariç) */
const PLACEHOLDER_PATTERN = /\[[A-ZÇĞİÖŞÜ][A-ZÇĞİÖŞÜ0-9 ./-]{3,}\](?!\()/u;

function defaultPublicFileSize(publicPath: string): number | null {
  const file = path.join(process.cwd(), 'public', ...publicPath.split('/').filter(Boolean));
  try {
    const stat = fs.statSync(file);
    return stat.isFile() ? stat.size : null;
  } catch {
    return null;
  }
}

export function validateStore(store: ContentStore, options: ValidateOptions): Issue[] {
  const issues: Issue[] = [];
  const error = (file: string, message: string) => issues.push({ level: 'error', file, message });
  const warn = (file: string, message: string) => issues.push({ level: 'warning', file, message });
  const { today } = options;

  /* ---------------- Kişiler ---------------- */
  const seenPeople = new Set<string>();
  for (const person of store.people) {
    if (seenPeople.has(person.id)) error('content/kisiler.yaml', `Yinelenen kişi kimliği: "${person.id}".`);
    seenPeople.add(person.id);
  }
  const people = new Map(store.people.map((p) => [p.id, p]));

  /* ---------------- Rota ve bağlantı yardımcıları ---------------- */
  type Target = { status: string } | undefined;
  const stands = new Map(store.stands.map((s) => [s.slug, s]));
  const jobs = new Map(store.jobs.map((j) => [j.slug, j]));
  const candidates = new Map(store.candidates.map((c) => [c.slug, c]));
  const marketListings = new Map(store.marketListings.map((m) => [m.slug, m]));
  const pages = new Map(store.pages.map((p) => [p.slug, p]));
  const halls = new Set(store.halls.map((h) => h.slug));
  const marketCategories = new Set(store.marketCategories.map((c) => c.slug));

  const resolveRoute = (href: string): { exists: boolean; target?: Target } => {
    const pathOnly = href.split(/[?#]/)[0]!.replace(/\/+$/, '') || '/';
    if (STATIC_ROUTES.has(pathOnly)) return { exists: true };
    const [, section, slug, extra, more] = pathOnly.split('/');
    if (more) return { exists: false };
    if (!slug) {
      // Yayın durumuna bağlı sayfalar: /ilan-kurallari, /kvkk
      if (section && Object.values(optionalPageFiles).includes(section)) {
        return { exists: pages.has(section), target: pages.get(section) };
      }
      return { exists: false };
    }
    if (extra) {
      if (section === 'fuar' && slug === 'salonlar') return { exists: halls.has(extra) };
      if (section === 'market' && slug === 'kategori') return { exists: marketCategories.has(extra) };
      return { exists: false };
    }
    switch (section) {
      case 'fuar':
        return { exists: stands.has(slug), target: stands.get(slug) };
      case 'is-ilanlari':
        return { exists: jobs.has(slug), target: jobs.get(slug) };
      case 'is-arayanlar':
        return { exists: candidates.has(slug), target: candidates.get(slug) };
      case 'market':
        return { exists: marketListings.has(slug), target: marketListings.get(slug) };
      case 'ilan-ver':
        return { exists: isSubmissionType(slug) };
      default:
        return { exists: false };
    }
  };

  const checkInternalLink = (file: string, href: string, isPublished: boolean) => {
    const { exists, target } = resolveRoute(href);
    if (!exists) error(file, `Kırık site içi bağlantı: ${href}`);
    else if (isPublished && target && target.status !== 'published') {
      warn(file, `Bağlantı verilen sayfa (${href}) henüz yayımlanmadı.`);
    }
  };

  /* ---------------- Sayfalar ---------------- */
  for (const slug of REQUIRED_PAGES) {
    const page = pages.get(slug);
    if (!page) error(`content/sayfalar/${slug}.md`, 'Zorunlu sayfa eksik.');
    else if (page.status !== 'published') error(page.file, 'Güven sayfaları her zaman yayımlanmış olmalı.');
  }
  for (const slug of Object.values(optionalPageFiles)) {
    if (!pages.has(slug)) error(`content/sayfalar/${slug}.md`, 'Sayfa eksik (ilan formları bu sayfaya bağlıdır).');
  }
  const formsOpen = Object.values(optionalPageFiles).every((slug) => pages.get(slug)?.status === 'published');
  if (formsOpen && (options.listingsEmail ?? siteConfig.listingsEmail).endsWith('.example')) {
    error(
      'src/config/site.ts',
      'İlan kuralları ve KVKK metni yayımlandığı için başvuru formları açılacak, ancak listingsEmail hâlâ örnek adres (.example). Gerçek adresi yazın.',
    );
  }
  for (const page of store.pages) {
    for (const href of page.internalLinks) checkInternalLink(page.file, href, page.status === 'published');
    if (page.status === 'published' && (PLACEHOLDER_PATTERN.test(page.body) || page.body.includes('Yayımlamadan önce'))) {
      error(
        page.file,
        'Sayfada doldurulmamış yer tutucu ([VERİ SORUMLUSU] gibi) veya "Yayımlamadan önce" notu varken yayımlanamaz.',
      );
    }
    if (page.updatedAt > today) error(page.file, `updatedAt gelecekte olamaz (${page.updatedAt}).`);
  }

  /* ---------------- İlanlar ---------------- */
  validateListings(store, {
    today,
    error,
    warn,
    people,
    checkInternalLink,
    publicFileSize: options.publicFileSize ?? defaultPublicFileSize,
    legalCheckMaxAgeDays: options.legalCheckMaxAgeDays ?? 180,
  });

  return issues;
}
