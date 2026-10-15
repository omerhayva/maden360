import 'katex/dist/katex.min.css';

/**
 * Derleme sırasında Markdown'dan üretilen HTML'i gösterir.
 * Ham HTML Markdown içinde devre dışıdır (allowDangerousHtml: false); içerik
 * yalnızca depodaki dosyalardan gelir.
 */
export function Prose({ html, className = '' }: { html: string; className?: string }) {
  return (
    <div
      className={`prose prose-maden prose-lg max-w-none prose-headings:tracking-tight prose-h2:mt-10 prose-h2:text-2xl prose-h3:text-xl prose-table:text-base ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
