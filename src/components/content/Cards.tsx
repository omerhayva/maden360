import Link from 'next/link';
import { ArrowRight, BookOpen, Calculator } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/format';
import type { ContentStatus } from '@/lib/content/schemas';

const cardBase =
  'group relative flex h-full flex-col rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition-colors hover:border-copper-300 has-[a:focus-visible]:outline-3 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-copper-500';
const stretchedLink = 'after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none';

interface ArticleCardProps {
  title: string;
  summary: string;
  url: string;
  categoryName?: string;
  status: ContentStatus;
  readingMinutes: number;
  reviewedAt?: string;
  headingLevel?: 'h2' | 'h3';
}

export function ArticleCard({
  title,
  summary,
  url,
  categoryName,
  status,
  readingMinutes,
  reviewedAt,
  headingLevel: Heading = 'h3',
}: ArticleCardProps) {
  return (
    <article className={cardBase}>
      <div className="flex flex-wrap items-center gap-2">
        {categoryName && (
          <span className="text-xs font-semibold uppercase tracking-wide text-copper-700">{categoryName}</span>
        )}
        {status !== 'published' && <StatusBadge status={status} />}
      </div>
      <Heading className="mt-2 text-lg font-semibold leading-snug text-graphite-950 group-hover:text-copper-800">
        <Link href={url} className={stretchedLink}>
          {title}
        </Link>
      </Heading>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-graphite-600">{summary}</p>
      <p className="mt-auto flex flex-wrap items-center gap-x-3 pt-4 text-xs text-graphite-500">
        <span className="inline-flex items-center gap-1">
          <BookOpen aria-hidden="true" className="h-3.5 w-3.5" />
          {readingMinutes} dk okuma
        </span>
        <span>{reviewedAt ? `İnceleme: ${formatDate(reviewedAt)}` : 'İnceleme bekleniyor'}</span>
      </p>
    </article>
  );
}

interface CalculatorCardProps {
  title: string;
  summary: string;
  url: string;
  status: ContentStatus;
  categoryName?: string;
  headingLevel?: 'h2' | 'h3';
}

export function CalculatorCard({ title, summary, url, status, categoryName, headingLevel: Heading = 'h3' }: CalculatorCardProps) {
  return (
    <article className={cardBase}>
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-graphite-900 text-copper-400">
          <Calculator aria-hidden="true" className="h-5 w-5" />
        </span>
        {status !== 'published' && <StatusBadge status={status} />}
      </div>
      {categoryName && (
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-copper-700">{categoryName}</p>
      )}
      <Heading className={`${categoryName ? 'mt-1' : 'mt-4'} text-lg font-semibold leading-snug text-graphite-950 group-hover:text-copper-800`}>
        <Link href={url} className={stretchedLink}>
          {title}
        </Link>
      </Heading>
      <p className="mt-2 text-sm leading-6 text-graphite-600">{summary}</p>
      <p aria-hidden="true" className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-copper-700">
        Hesapla
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </p>
    </article>
  );
}

interface TermCardProps {
  term: string;
  english?: string;
  definition: string;
  url: string;
  status: ContentStatus;
}

export function TermCard({ term, english, definition, url, status }: TermCardProps) {
  return (
    <article className={cardBase}>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <h3 className="text-base font-semibold text-graphite-950 group-hover:text-copper-800">
          <Link href={url} className={stretchedLink}>
            {term}
          </Link>
        </h3>
        {english && (
          <span lang="en" className="text-sm italic text-graphite-500">
            {english}
          </span>
        )}
        {status !== 'published' && <StatusBadge status={status} />}
      </div>
      <p className="mt-1.5 line-clamp-3 text-sm leading-6 text-graphite-600">{definition}</p>
    </article>
  );
}
