import { ListTree } from 'lucide-react';
import type { TocEntry } from '@/lib/content/markdown';

function TocList({ entries }: { entries: TocEntry[] }) {
  return (
    <ol className="space-y-1 text-sm">
      {entries.map((entry) => (
        <li key={entry.id} className={entry.depth === 3 ? 'pl-4' : ''}>
          <a
            href={`#${entry.id}`}
            className="block rounded px-2 py-1.5 text-graphite-700 hover:bg-stone-100 hover:text-copper-700"
          >
            {entry.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

/** Masaüstünde yapışkan kenar menüsü */
export function TableOfContents({ entries }: { entries: TocEntry[] }) {
  if (entries.length < 2) return null;
  return (
    <nav aria-label="İçindekiler" className="no-print">
      <p className="mb-2 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wide text-graphite-500">
        <ListTree aria-hidden="true" className="h-4 w-4" />
        İçindekiler
      </p>
      <TocList entries={entries} />
    </nav>
  );
}

/** Mobilde açılır kapanır içindekiler */
export function MobileTableOfContents({ entries }: { entries: TocEntry[] }) {
  if (entries.length < 2) return null;
  return (
    <details className="no-print group rounded-lg border border-stone-200 bg-white lg:hidden">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-2 px-4 font-semibold text-graphite-900">
        <span className="flex items-center gap-2">
          <ListTree aria-hidden="true" className="h-4 w-4 text-copper-600" />
          İçindekiler
        </span>
        <span aria-hidden="true" className="text-graphite-400 transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <nav aria-label="İçindekiler (mobil)" className="border-t border-stone-200 px-2 py-2">
        <TocList entries={entries} />
      </nav>
    </details>
  );
}
