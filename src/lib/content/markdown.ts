import type { Element, ElementContent, Root as HastRoot } from 'hast';
import { toString as hastToString } from 'hast-util-to-string';
import type { Root as MdastRoot } from 'mdast';
import { toString as mdastToString } from 'mdast-util-to-string';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { slugify } from '@/lib/text';

export interface RenderedMarkdown {
  html: string;
  plainText: string;
  /** Gövdede bulunan site içi bağlantılar (doğrulama için). */
  internalLinks: string[];
}

export interface RenderOptions {
  /**
   * Dış bağlantılara eklenecek rel değerleri. Kullanıcıların gönderdiği metinlerde
   * (ilanlar, fuar standları) arama motorlarına "nofollow ugc" bildirilir.
   */
  externalRel?: string[];
}

/** Başlıklara ASCII kimlik ekler (sayfa içi bağlantılar için). */
function rehypeHeadings() {
  return (tree: HastRoot) => {
    const used = new Map<string, number>();
    visit(tree, 'element', (node: Element) => {
      if (!/^h[1-6]$/.test(node.tagName)) return;
      const base = slugify(hastToString(node).trim()) || 'bolum';
      const count = used.get(base) ?? 0;
      used.set(base, count + 1);
      node.properties = { ...node.properties, id: count === 0 ? base : `${base}-${count + 1}` };
    });
  };
}

/** Tabloları yatay kaydırılabilir bir kapsayıcıya alır (mobilde taşmayı önler). */
function rehypeResponsiveTables() {
  return (tree: HastRoot) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName !== 'table' || !parent || index === undefined) return;
      const wrapper: Element = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['table-wrap'], tabIndex: 0, role: 'region', ariaLabel: 'Tablo' },
        children: [node as ElementContent],
      };
      parent.children[index] = wrapper;
    });
  };
}

/** Dış bağlantılara güvenli rel ekler, site içi bağlantıları toplar. */
function rehypeLinks(options: { internalLinks: string[]; rel: string[] }) {
  const { internalLinks, rel } = options;
  return (tree: HastRoot) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'a') return;
      const href = String(node.properties?.href ?? '');
      if (/^https?:\/\//.test(href)) {
        node.properties = { ...node.properties, rel, className: ['external'] };
      } else if (href.startsWith('/')) {
        internalLinks.push(href);
      }
    });
  };
}

/**
 * Markdown'ı HTML'e çevirir. Ham HTML devre dışıdır (kullanıcı içeriğinde betik
 * çalıştırılamaz); GitHub biçimli tablolar ve listeler desteklenir.
 */
export function renderMarkdown(markdown: string, options: RenderOptions = {}): RenderedMarkdown {
  const internalLinks: string[] = [];
  let plainText = '';

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(() => (tree: MdastRoot) => {
      plainText = mdastToString(tree, { includeHtml: false });
    })
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeHeadings)
    .use(rehypeResponsiveTables)
    .use(rehypeLinks, { internalLinks, rel: options.externalRel ?? ['noopener', 'noreferrer'] })
    .use(rehypeStringify);

  const html = String(processor.processSync(markdown));
  return { html, plainText: plainText.replace(/\s+/g, ' ').trim(), internalLinks };
}
