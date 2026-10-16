import fs from 'node:fs';
import path from 'node:path';
import type { z } from 'zod';
import { routes } from '@/i18n/routes';
import { SLUG_PATTERN } from '@/lib/text';
import { ContentError, parseFrontmatter, parseYamlFile } from './frontmatter';
import { renderMarkdown, type RenderedMarkdown, type RenderOptions } from './markdown';
import {
  candidateFrontmatterSchema,
  hallsFileSchema,
  jobFrontmatterSchema,
  marketCategoriesFileSchema,
  marketFrontmatterSchema,
  pageFrontmatterSchema,
  peopleFileSchema,
  positionsFileSchema,
  standFrontmatterSchema,
  type CandidateFrontmatter,
  type Hall,
  type JobFrontmatter,
  type MarketCategory,
  type MarketFrontmatter,
  type PageFrontmatter,
  type Person,
  type Position,
  type StandFrontmatter,
} from './schemas';

interface BaseEntry extends RenderedMarkdown {
  slug: string;
  url: string;
  /** Depo köküne göre dosya yolu (hata mesajları için) */
  file: string;
  body: string;
}

export interface StaticPage extends PageFrontmatter, BaseEntry {
  kind: 'page';
}

/* İlanlar: başvuru formuyla gönderilen, editör onayıyla yayımlanan içerikler */
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
  people: Person[];
  halls: Hall[];
  marketCategories: MarketCategory[];
  positions: Position[];
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
  pages: 'sayfalar',
  stands: 'fuar',
  jobs: 'is-ilanlari',
  candidates: 'is-arayanlar',
  marketListings: 'market',
} as const;

export const REGISTRY_FILES = {
  people: 'kisiler.yaml',
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

  const people = readRegistry(REGISTRY_FILES.people, peopleFileSchema);
  const halls = readRegistry(REGISTRY_FILES.halls, hallsFileSchema).sort((a, b) => a.order - b.order);
  const marketCategories = readRegistry(
    REGISTRY_FILES.marketCategories,
    marketCategoriesFileSchema,
  ).sort((a, b) => a.order - b.order);
  const positions = readRegistry(REGISTRY_FILES.positions, positionsFileSchema);

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
        const rendered = renderMarkdown(body, renderOptions);
        entries.push(build(parsed.data, { ...rendered, slug, url: urlFor(slug), file: display, body }));
      } catch (error) {
        errors.push(error instanceof ContentError ? error : new ContentError(display, String(error)));
      }
    }
    return entries;
  }

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
    store: { people, halls, marketCategories, positions, pages, stands, jobs, candidates, marketListings },
    errors,
  };
}
