import 'server-only';
import { getArticles, getCalculators, getCategory, getTag, getTerms } from '@/lib/content';
import { truncate } from '@/lib/text';
import type { SearchDocument } from './engine';

const BODY_LIMIT = 6000;

const tagNames = (slugs: string[]) => slugs.map((slug) => getTag(slug)?.name ?? slug).join(' ');

/** Yayımlanabilir tüm içeriklerden arama dizini belgelerini üretir. */
export function buildSearchDocuments(): SearchDocument[] {
  const calculators: SearchDocument[] = getCalculators().map((calculator) => ({
    id: `hesaplama:${calculator.slug}`,
    type: 'hesaplama',
    title: calculator.title,
    url: calculator.url,
    summary: calculator.summary,
    category: getCategory(calculator.category)?.name,
    keywords: [calculator.shortTitle, ...calculator.keywords, tagNames(calculator.tags)].join(' '),
    headings: calculator.toc.map((entry) => entry.text).join(' '),
    body: truncate(calculator.plainText, BODY_LIMIT),
  }));

  const articles: SearchDocument[] = getArticles().map((article) => ({
    id: `makale:${article.slug}`,
    type: 'makale',
    title: article.title,
    url: article.url,
    summary: article.summary,
    category: getCategory(article.category)?.name,
    keywords: [...article.keywords, tagNames(article.tags)].join(' '),
    headings: article.toc.map((entry) => entry.text).join(' '),
    body: truncate(article.plainText, BODY_LIMIT),
  }));

  const terms: SearchDocument[] = getTerms().map((term) => ({
    id: `terim:${term.slug}`,
    type: 'terim',
    title: term.term,
    url: term.url,
    summary: term.definition,
    category: term.category ? getCategory(term.category)?.name : undefined,
    keywords: [
      term.english ?? '',
      term.abbreviation ?? '',
      ...term.aliases,
      tagNames(term.tags),
    ].join(' '),
    headings: '',
    body: truncate(term.plainText, BODY_LIMIT),
  }));

  return [...calculators, ...articles, ...terms];
}
