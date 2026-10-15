import fs from 'node:fs';
import path from 'node:path';
import type { z } from 'zod';
import { routes } from '@/i18n/routes';
import { readingMinutes, SLUG_PATTERN } from '@/lib/text';
import { ContentError, parseFrontmatter, parseYamlFile } from './frontmatter';
import { renderMarkdown, type RenderedMarkdown, type RenderOptions } from './markdown';
import {
  articleFrontmatterSchema,
  calculatorFrontmatterSchema,
  candidateFrontmatterSchema,
  categoriesFileSchema,
  guideFileSchema,
  hallsFileSchema,
  jobFrontmatterSchema,
  marketCategoriesFileSchema,
  marketFrontmatterSchema,
  pageFrontmatterSchema,
  peopleFileSchema,
  positionsFileSchema,
  sourcesFileSchema,
  standFrontmatterSchema,
  tagsFileSchema,
  termFrontmatterSchema,
  type ArticleFrontmatter,
  type CalculatorFrontmatter,
  type CandidateFrontmatter,
  type Category,
  type GuideSection,
  type Hall,
  type JobFrontmatter,
  type MarketCategory,
  type MarketFrontmatter,
  type PageFrontmatter,
  type Person,
  type Position,
  type Source,
  type StandFrontmatter,
  type Tag,
  type TermFrontmatter,
} from './schemas';

interface BaseEntry extends RenderedMarkdown {
  slug: string;
  url: string;
  /** Depo köküne göre dosya yolu (hata mesajları ve "düzenle" bağlantıları için) */
  file: string;
  body: string;
  readingMinutes: number;
}

export interface Article extends ArticleFrontmatter, BaseEntry {
  kind: 'article';
}
export interface Term extends TermFrontmatter, BaseEntry {
  kind: 'term';
}
export interface CalculatorContent extends CalculatorFrontmatter, BaseEntry {
  kind: 'calculator';
}
export interface StaticPage extends PageFrontmatter, BaseEntry {
  kind: 'page';
}

export type EditorialEntry = Article | Term | CalculatorContent;

/* İlanlar: kullanıcıların başvuru formuyla gönderdiği, editör onayıyla yayımlanan içerikler */
export interface Stand extends StandFrontmatter, BaseEntry {
  kind: 'stand';
}
export interface JobPosting extends JobFrontmatter, BaseEntry {
  kind: 'job';
}
export interface Candidate extends CandidateFrontmatter, BaseEntry {
  kind: 'candidate';
}
export interface MarketListing extends MarketFrontmatter, BaseEntry {
  kind: 'market';
}

export type ListingEntry = Stand | JobPosting | Candidate | MarketListing;

export interface ContentStore {
  categories: Category[];
  tags: Tag[];
  people: Person[];
  sources: Source[];
  guide: GuideSection[];
  halls: Hall[];
  marketCategories: MarketCategory[];
  positions: Position[];
  articles: Article[];
  terms: Term[];
  calculators: CalculatorContent[];
  pages: StaticPage[];
  stands: Stand[];
  jobs: JobPosting[];
  candidates: Candidate[];
  marketListings: MarketListing[];
}

export interface LoadResult {
  store: ContentStore;
  errors: ContentError[];
}

export const CONTENT_DIRS = {
  articles: 'makaleler',
  terms: 'sozluk',
  calculators: 'hesaplamalar',
  pages: 'sayfalar',
  stands: 'fuar',
  jobs: 'is-ilanlari',
  candidates: 'is-arayanlar',
  marketListings: 'market',
} as const;

export const REGISTRY_FILES = {
  categories: 'konular.yaml',
  tags: 'etiketler.yaml',
  people: 'kisiler.yaml',
  sources: 'kaynaklar.yaml',
  guide: 'rehber.yaml',
  halls: 'fuar-salonlari.yaml',
  marketCategories: 'market-kategorileri.yaml',
  positions: 'meslekler.yaml',
} as const;

/** Kullanıcı içeriğindeki dış bağlantılar arama motorlarına "nofollow ugc" olarak bildirilir. */
const UGC_RENDER: RenderOptions = { externalRel: ['nofollow', 'ugc', 'noopener', 'noreferrer'] };

function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const where = issue.path.length > 0 ? issue.path.join('.') : '(kök)';
      return `  • ${where}: ${issue.message}`;
    })
    .join('\n');
}

/** Kaynak için kısa, okunur atıf etiketi: "Wills ve Finch, 2016" */
export function citationLabel(source: Source): string {
  const year = source.published.slice(0, 4);
  if (source.authors) {
    const surnames = source.authors
      .split(';')
      .map((author) => author.split(',')[0]?.trim())
      .filter((name): name is string => Boolean(name));
    const who =
      surnames.length === 1
        ? surnames[0]
        : surnames.length === 2
          ? `${surnames[0]} ve ${surnames[1]}`
          : `${surnames[0]} vd.`;
    return `${who}, ${year}`;
  }
  return `${source.publisher}, ${year}`;
}

export function loadContentStore(rootDir = path.join(process.cwd(), 'content')): LoadResult {
  const errors: ContentError[] = [];
  const relative = (file: string) => path.relative(process.cwd(), file).split(path.sep).join('/');

  function readRegistry<T>(fileName: string, schema: z.ZodType<T[]>): T[] {
    const file = path.join(rootDir, fileName);
    const display = relative(file);
    if (!fs.existsSync(file)) {
      errors.push(new ContentError(display, 'Dosya bulunamadı.'));
      return [];
    }
    try {
      const raw = parseYamlFile(fs.readFileSync(file, 'utf8'), display) ?? [];
      const parsed = schema.safeParse(raw);
      if (!parsed.success) {
        errors.push(new ContentError(display, `Geçersiz kayıt:\n${formatZodError(parsed.error)}`));
        return [];
      }
      return parsed.data;
    } catch (error) {
      errors.push(error instanceof ContentError ? error : new ContentError(display, String(error)));
      return [];
    }
  }

  const categories = readRegistry(REGISTRY_FILES.categories, categoriesFileSchema).sort(
    (a, b) => a.order - b.order,
  );
  const tags = readRegistry(REGISTRY_FILES.tags, tagsFileSchema);
  const people = readRegistry(REGISTRY_FILES.people, peopleFileSchema);
  const sources = readRegistry(REGISTRY_FILES.sources, sourcesFileSchema);
  const guide = readRegistry(REGISTRY_FILES.guide, guideFileSchema);
  const halls = readRegistry(REGISTRY_FILES.halls, hallsFileSchema).sort((a, b) => a.order - b.order);
  const marketCategories = readRegistry(REGISTRY_FILES.marketCategories, marketCategoriesFileSchema).sort(
    (a, b) => a.order - b.order,
  );
  const positions = readRegistry(REGISTRY_FILES.positions, positionsFileSchema);
  const sourceMap = new Map(sources.map((source) => [source.id, source]));

  function readCollection<F extends object, E>(
    dirName: string,
    schema: z.ZodType<F>,
    build: (frontmatter: F, base: BaseEntry) => E,
    urlFor: (slug: string) => string,
    renderOptions: RenderOptions = {},
  ): E[] {
    const dir = path.join(rootDir, dirName);
    if (!fs.existsSync(dir)) return [];
    const entries: E[] = [];
    const files = fs
      .readdirSync(dir)
      .filter((name) => name.endsWith('.md') && !name.startsWith('_'))
      .sort();
    for (const name of files) {
      const file = path.join(dir, name);
      const display = relative(file);
      const slug = name.replace(/\.md$/, '');
      try {
        if (!SLUG_PATTERN.test(slug)) {
          throw new ContentError(
            display,
            'Dosya adı geçerli bir slug olmalı (küçük harf, rakam, tire; Türkçe karakter yok).',
          );
        }
        const { data, body } = parseFrontmatter(fs.readFileSync(file, 'utf8'), display);
        const parsed = schema.safeParse(data);
        if (!parsed.success) {
          throw new ContentError(display, `Ön bilgi geçersiz:\n${formatZodError(parsed.error)}`);
        }
        const frontmatter = parsed.data;
        const citationNumbers = new Map<string, number>();
        const citationLabels = new Map<string, string>();
        const refs = 'sources' in frontmatter ? ((frontmatter as { sources?: { id: string }[] }).sources ?? []) : [];
        refs.forEach((ref, index) => {
          citationNumbers.set(ref.id, index + 1);
          const source = sourceMap.get(ref.id);
          if (source) citationLabels.set(ref.id, citationLabel(source));
        });
        const rendered = renderMarkdown(body, { ...renderOptions, citationNumbers, citationLabels });
        entries.push(
          build(frontmatter, {
            ...rendered,
            slug,
            url: urlFor(slug),
            file: display,
            body,
            readingMinutes: readingMinutes(rendered.plainText),
          }),
        );
      } catch (error) {
        errors.push(error instanceof ContentError ? error : new ContentError(display, String(error)));
      }
    }
    return entries;
  }

  const articles = readCollection(
    CONTENT_DIRS.articles,
    articleFrontmatterSchema,
    (fm, base): Article => ({ ...fm, ...base, kind: 'article' }),
    (slug) => routes.article(slug),
  );
  const terms = readCollection(
    CONTENT_DIRS.terms,
    termFrontmatterSchema,
    (fm, base): Term => ({ ...fm, ...base, kind: 'term' }),
    (slug) => routes.term(slug),
  );
  const calculators = readCollection(
    CONTENT_DIRS.calculators,
    calculatorFrontmatterSchema,
    (fm, base): CalculatorContent => ({ ...fm, ...base, kind: 'calculator' }),
    (slug) => routes.calculator(slug),
  );
  const pages = readCollection(
    CONTENT_DIRS.pages,
    pageFrontmatterSchema,
    (fm, base): StaticPage => ({ ...fm, ...base, kind: 'page' }),
    (slug) => `/${slug}`,
  );

  const stands = readCollection(
    CONTENT_DIRS.stands,
    standFrontmatterSchema,
    (fm, base): Stand => ({ ...fm, ...base, kind: 'stand' }),
    (slug) => routes.stand(slug),
    UGC_RENDER,
  );
  const jobs = readCollection(
    CONTENT_DIRS.jobs,
    jobFrontmatterSchema,
    (fm, base): JobPosting => ({ ...fm, ...base, kind: 'job' }),
    (slug) => routes.job(slug),
    UGC_RENDER,
  );
  const candidates = readCollection(
    CONTENT_DIRS.candidates,
    candidateFrontmatterSchema,
    (fm, base): Candidate => ({ ...fm, ...base, kind: 'candidate' }),
    (slug) => routes.candidate(slug),
    UGC_RENDER,
  );
  const marketListings = readCollection(
    CONTENT_DIRS.marketListings,
    marketFrontmatterSchema,
    (fm, base): MarketListing => ({ ...fm, ...base, kind: 'market' }),
    (slug) => routes.marketListing(slug),
    UGC_RENDER,
  );

  return {
    store: {
      categories,
      tags,
      people,
      sources,
      guide,
      halls,
      marketCategories,
      positions,
      articles,
      terms,
      calculators,
      pages,
      stands,
      jobs,
      candidates,
      marketListings,
    },
    errors,
  };
}
