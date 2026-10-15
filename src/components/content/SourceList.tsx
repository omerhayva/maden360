import { ExternalLink, Library } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatPartialDate } from '@/lib/format';
import type { ResolvedSource } from '@/lib/content';
import { sourceTypeLabels } from '@/lib/content/labels';
import { sourceAnchorId } from '@/lib/content/markdown';

/**
 * Numaralı kaynak listesi. Metindeki [n] atıfları buradaki öğelere bağlanır.
 * Her kaynakta yayıncı, belge tarihi, erişim tarihi ve kaynak türü gösterilir;
 * varsa kaynağın desteklediği iddia da belirtilir.
 */
export function SourceList({ sources, title = 'Kaynaklar' }: { sources: ResolvedSource[]; title?: string }) {
  if (sources.length === 0) {
    return (
      <section aria-labelledby="kaynaklar" className="mt-12">
        <h2 id="kaynaklar" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-graphite-950">
          <Library aria-hidden="true" className="h-6 w-6 text-copper-600" />
          {title}
        </h2>
        <p className="mt-3 text-graphite-600">Bu içerik için henüz kaynak eklenmedi.</p>
      </section>
    );
  }
  return (
    <section aria-labelledby="kaynaklar" className="mt-12">
      <h2 id="kaynaklar" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-graphite-950">
        <Library aria-hidden="true" className="h-6 w-6 text-copper-600" />
        {title}
      </h2>
      <ol className="mt-4 space-y-4">
        {sources.map(({ number, ref, source }) => (
          <li
            key={source.id}
            id={sourceAnchorId(source.id)}
            className="flex gap-3 rounded-lg border border-stone-200 bg-white p-4"
          >
            <span className="mt-0.5 flex h-7 min-w-7 items-center justify-center rounded-md bg-graphite-900 px-1.5 text-sm font-bold text-copper-400">
              {number}
            </span>
            <div className="min-w-0 text-sm leading-6 text-graphite-800">
              <p>
                {source.authors && <span>{source.authors} </span>}
                <span>({formatPartialDate(source.published)}). </span>
                <cite className="font-semibold not-italic text-graphite-950">{source.title}</cite>
                {source.edition && <span>, {source.edition}</span>}
                <span>. {source.publisher}.</span>
                {source.identifier && <span className="text-graphite-600"> {source.identifier}.</span>}
              </p>
              {(ref.locator || ref.note) && (
                <p className="mt-1 text-graphite-700">
                  {ref.locator && <span className="font-medium">{ref.locator}</span>}
                  {ref.locator && ref.note && <span> — </span>}
                  {ref.note && <span>{ref.note}</span>}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-graphite-600">
                <Badge tone="neutral">{sourceTypeLabels[source.type]}</Badge>
                {source.language !== 'tr' && <span>Dil: {source.language.toUpperCase()}</span>}
                {source.accessedAt && <span>Erişim: {formatDate(source.accessedAt)}</span>}
                {source.url && (
                  <a
                    href={source.url}
                    rel="noopener noreferrer"
                    className="inline-flex min-h-8 items-center gap-1 font-semibold text-copper-700 hover:underline"
                  >
                    Kaynağa git
                    <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                    <span className="sr-only">(dış bağlantı: {source.title})</span>
                  </a>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
