import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import { routes } from '@/i18n/routes';
import { turkishCollator } from '@/lib/text';
import {
  citationLabel,
  loadContentStore,
  type Article,
  type CalculatorContent,
  type ContentStore,
  type StaticPage,
  type Term,
} from './repository';
import type { Category, Person, Source, SourceRef, Tag } from './schemas';
import { isVisible } from './visibility';

export type { Article, CalculatorContent, EditorialEntry, StaticPage, Term } from './repository';

let cache: { store: ContentStore; signature: string } | undefined;

/** content/ klasöründeki dosya sayısı ve en son değişiklik zamanı (geliştirmede önbellek anahtarı). */
function contentSignature(): string {
  let latest = 0;
  let count = 0;
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else {
        count += 1;
        latest = Math.max(latest, fs.statSync(full).mtimeMs);
      }
    }
  };
  walk(path.join(process.cwd(), 'content'));
  return `${count}:${latest}`;
}

/**
 * İçerik deposunu yükler. Üretim derlemesinde bir kez okunur; geliştirmede
 * içerik dosyaları değiştiğinde otomatik olarak yeniden yüklenir.
 */
export function getStore(): ContentStore {
  const isProduction = process.env.NODE_ENV === 'production';
  if (cache && isProduction) return cache.store;
  const signature = isProduction ? 'uretim' : contentSignature();
  if (cache && cache.signature === signature) return cache.store;
  const { store, errors } = loadContentStore();
  if (errors.length > 0) {
    const details = errors.map((error) => `\n• ${error.message}`).join('');
    throw new Error(
      `İçerik dosyalarında ${errors.length} hata var. Ayrıntılar için "npm run content:check" çalıştırın.${details}`,
    );
  }
  cache = { store, signature };
  return store;
}

const byDateDesc = (a: Article, b: Article) =>
  (b.publishedAt ?? b.updatedAt ?? '').localeCompare(a.publishedAt ?? a.updatedAt ?? '') ||
  turkishCollator.compare(a.title, b.title);

/* --------------------------- Kayıtlar --------------------------- */

export function getCategories(): Category[] {
  return getStore().categories;
}

export function getCategory(slug: string): Category | undefined {
  return getStore().categories.find((category) => category.slug === slug);
}

export function getTag(slug: string): Tag | undefined {
  return getStore().tags.find((tag) => tag.slug === slug);
}

export function getPerson(id: string): Person | undefined {
  return getStore().people.find((person) => person.id === id);
}

export function getSource(id: string): Source | undefined {
  return getStore().sources.find((source) => source.id === id);
}

/* --------------------------- Makaleler --------------------------- */

export function getArticles(): Article[] {
  return getStore()
    .articles.filter((article) => isVisible(article.status))
    .sort(byDateDesc);
}

export function getArticle(slug: string): Article | undefined {
  const article = getStore().articles.find((entry) => entry.slug === slug);
  return article && isVisible(article.status) ? article : undefined;
}

export function getArticlesByCategory(categorySlug: string): Article[] {
  return getArticles().filter((article) => article.category === categorySlug);
}

/* --------------------------- Sözlük --------------------------- */

export function getTerms(): Term[] {
  return getStore()
    .terms.filter((term) => isVisible(term.status))
    .sort((a, b) => turkishCollator.compare(a.term, b.term));
}

export function getTerm(slug: string): Term | undefined {
  const term = getStore().terms.find((entry) => entry.slug === slug);
  return term && isVisible(term.status) ? term : undefined;
}

/* --------------------------- Hesaplayıcılar --------------------------- */

export function getCalculators(): CalculatorContent[] {
  return getStore()
    .calculators.filter((calculator) => isVisible(calculator.status))
    .sort((a, b) => a.order - b.order || turkishCollator.compare(a.title, b.title));
}

export function getCalculator(slug: string): CalculatorContent | undefined {
  const calculator = getStore().calculators.find((entry) => entry.slug === slug);
  return calculator && isVisible(calculator.status) ? calculator : undefined;
}

/* --------------------------- Statik sayfalar --------------------------- */

export function getPage(slug: string): StaticPage {
  const page = getStore().pages.find((entry) => entry.slug === slug);
  if (!page) throw new Error(`content/sayfalar/${slug}.md bulunamadı.`);
  return page;
}

/* --------------------------- İlişkiler --------------------------- */

export interface ResolvedSource {
  number: number;
  ref: SourceRef;
  source: Source;
  label: string;
}

export function resolveSources(entry: { sources: SourceRef[] }): ResolvedSource[] {
  return entry.sources.flatMap((ref, index) => {
    const source = getSource(ref.id);
    return source ? [{ number: index + 1, ref, source, label: citationLabel(source) }] : [];
  });
}

export function resolvePeople(ids: string[]): Person[] {
  return ids.map((id) => getPerson(id)).filter((person): person is Person => Boolean(person));
}

export function resolveArticles(slugs: string[]): Article[] {
  return slugs.map((slug) => getArticle(slug)).filter((a): a is Article => Boolean(a));
}

export function resolveTerms(slugs: string[]): Term[] {
  return slugs.map((slug) => getTerm(slug)).filter((t): t is Term => Boolean(t));
}

export function resolveCalculators(slugs: string[]): CalculatorContent[] {
  return slugs
    .map((slug) => getCalculator(slug))
    .filter((c): c is CalculatorContent => Boolean(c));
}

/**
 * İlgili makaleler: önce elle seçilenler, ardından ortak etiket ve kategoriye göre
 * puanlanan diğer makaleler.
 */
export function relatedArticlesFor(
  entry: { slug?: string; kind?: string; category?: string; tags: string[]; relatedArticles: string[] },
  limit = 3,
): Article[] {
  const explicit = resolveArticles(entry.relatedArticles);
  const chosen = new Set(explicit.map((article) => article.slug));
  if (entry.kind === 'article' && entry.slug) chosen.add(entry.slug);
  const scored = getArticles()
    .filter((article) => !chosen.has(article.slug))
    .map((article) => {
      const sharedTags = article.tags.filter((tag) => entry.tags.includes(tag)).length;
      const sameCategory = entry.category && article.category === entry.category ? 1 : 0;
      return { article, score: sharedTags * 2 + sameCategory };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ article }) => article);
  return [...explicit, ...scored].slice(0, limit);
}

/** Bir terime bağlantı veren makale ve hesaplayıcılar (ters ilişki). */
export function backlinksForTerm(slug: string): { articles: Article[]; calculators: CalculatorContent[] } {
  return {
    articles: getArticles().filter((article) => article.relatedTerms.includes(slug)),
    calculators: getCalculators().filter((calculator) => calculator.relatedTerms.includes(slug)),
  };
}

/* --------------------------- Rehber --------------------------- */

export interface GuideItem {
  type: 'makale' | 'sozluk' | 'hesaplama';
  slug: string;
  title: string;
  summary: string;
  url: string;
}

export interface ResolvedGuideSection {
  id: string;
  title: string;
  description: string;
  items: GuideItem[];
}

export function getGuide(): ResolvedGuideSection[] {
  return getStore().guide.map((section) => ({
    id: section.id,
    title: section.title,
    description: section.description,
    items: section.items.flatMap((ref): GuideItem[] => {
      const [type, slug] = ref.split(':') as [GuideItem['type'], string];
      if (type === 'makale') {
        const article = getArticle(slug);
        return article
          ? [{ type, slug, title: article.title, summary: article.summary, url: article.url }]
          : [];
      }
      if (type === 'sozluk') {
        const term = getTerm(slug);
        return term ? [{ type, slug, title: term.term, summary: term.definition, url: term.url }] : [];
      }
      const calculator = getCalculator(slug);
      return calculator
        ? [{ type, slug, title: calculator.title, summary: calculator.summary, url: calculator.url }]
        : [];
    }),
  }));
}

/* --------------------------- Sayılar --------------------------- */

export function categoryCounts(slug: string) {
  return {
    articles: getArticlesByCategory(slug).length,
    calculators: getCalculators().filter((calculator) => calculator.category === slug).length,
    terms: getTerms().filter((term) => term.category === slug).length,
  };
}

export const contentUrls = routes;
