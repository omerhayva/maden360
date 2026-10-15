import { siteConfig } from '@/config/site';
import { routes } from '@/i18n/routes';
import type { Article, CalculatorContent, Term } from '@/lib/content';
import type { Person, Source } from '@/lib/content/schemas';
import { absoluteUrl } from './metadata';

const organization = () => ({
  '@type': 'Organization',
  '@id': `${siteConfig.url}/#organization`,
  name: siteConfig.name,
  url: siteConfig.url,
  logo: absoluteUrl('/icon-512.png'),
});

export function websiteSchema() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${siteConfig.url}/#website`,
      name: siteConfig.name,
      url: siteConfig.url,
      inLanguage: 'tr-TR',
      description: siteConfig.description,
      publisher: { '@id': `${siteConfig.url}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${absoluteUrl(routes.search())}?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    { '@context': 'https://schema.org', ...organization() },
  ];
}

export interface Crumb {
  name: string;
  href: string;
}

export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.href),
    })),
  };
}

const personSchema = (person: Person) => ({
  '@type': person.kind === 'kisi' ? 'Person' : 'Organization',
  name: person.name,
  ...(person.title ? { jobTitle: person.title } : {}),
  ...(person.url ? { url: person.url } : {}),
});

const citationSchema = (source: Source) => ({
  '@type': 'CreativeWork',
  name: source.title,
  ...(source.authors ? { author: source.authors } : {}),
  publisher: source.publisher,
  datePublished: source.published,
  ...(source.url ? { url: source.url } : {}),
});

export function articleSchema(
  article: Article,
  authors: Person[],
  reviewers: Person[],
  sources: Source[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: article.title,
    description: article.summary,
    inLanguage: 'tr-TR',
    url: absoluteUrl(article.url),
    mainEntityOfPage: absoluteUrl(article.url),
    ...(article.publishedAt ? { datePublished: article.publishedAt } : {}),
    dateModified: article.updatedAt ?? article.reviewedAt ?? article.publishedAt,
    ...(article.reviewedAt ? { lastReviewed: article.reviewedAt } : {}),
    author: authors.map(personSchema),
    ...(reviewers.length > 0 ? { reviewedBy: reviewers.map(personSchema) } : {}),
    publisher: organization(),
    image: absoluteUrl('/og-image.png'),
    keywords: article.keywords.join(', ') || undefined,
    citation: sources.map(citationSchema),
  };
}

export function termSchema(term: Term) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: term.term,
    description: term.definition,
    url: absoluteUrl(term.url),
    inLanguage: 'tr-TR',
    ...(term.english || term.aliases.length > 0
      ? { alternateName: [term.english, term.abbreviation, ...term.aliases].filter(Boolean) }
      : {}),
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: `${siteConfig.name} Madencilik Sözlüğü`,
      url: absoluteUrl(routes.glossary()),
    },
  };
}

export function calculatorSchema(calculator: CalculatorContent) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: calculator.title,
    description: calculator.summary,
    url: absoluteUrl(calculator.url),
    inLanguage: 'tr-TR',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Tüm tarayıcılar',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY' },
    publisher: organization(),
  };
}
