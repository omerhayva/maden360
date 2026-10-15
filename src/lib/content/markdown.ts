import type { Element, ElementContent, Root as HastRoot } from 'hast';
import { toString as hastToString } from 'hast-util-to-string';
import type { PhrasingContent, Root as MdastRoot } from 'mdast';
import { findAndReplace } from 'mdast-util-find-and-replace';
import { toString as mdastToString } from 'mdast-util-to-string';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { slugify } from '@/lib/text';

export interface TocEntry {
  id: string;
  text: string;
  depth: 2 | 3;
}

export interface RenderedMarkdown {
  html: string;
  toc: TocEntry[];
  plainText: string;
  /** Gövdede [@kaynak-id] ile atıf yapılan kaynaklar (ilk geçiş sırasıyla). */
  citedSourceIds: string[];
  /** Gövdede bulunan site içi bağlantılar (doğrulama için). */
  internalLinks: string[];
}

export interface RenderOptions {
  /** Kaynak kimliği → kaynak listesindeki sıra numarası (1'den başlar). */
  citationNumbers?: Map<string, number>;
  /** Kaynak kimliği → erişilebilir etiket ("Wills ve Finch, 2016"). */
  citationLabels?: Map<string, string>;
  /**
   * Dış bağlantılara eklenecek rel değerleri. Kullanıcıların gönderdiği metinlerde
   * (ilanlar, fuar standları) arama motorlarına "nofollow ugc" bildirilir.
   */
  externalRel?: string[];
}

/** [@id] veya [@id1; @id2] biçimindeki atıflar */
const CITATION_PATTERN = /\[@([a-z0-9-]+(?:\s*;\s*@[a-z0-9-]+)*)\]/g;

export function sourceAnchorId(sourceId: string): string {
  return `kaynak-${sourceId}`;
}

function remarkCitations(options: RenderOptions & { cited: string[] }) {
  return (tree: MdastRoot) => {
    findAndReplace(tree, [
      [
        CITATION_PATTERN,
        (_match: string, group: string) => {
          const ids = group.split(';').map((part) => part.trim().replace(/^@/, ''));
          const children: PhrasingContent[] = [{ type: 'text', value: '[' }];
          ids.forEach((id, index) => {
            if (!options.cited.includes(id)) options.cited.push(id);
            const number = options.citationNumbers?.get(id);
            const label = options.citationLabels?.get(id);
            if (index > 0) children.push({ type: 'text', value: ', ' });
            children.push({
              type: 'link',
              url: `#${sourceAnchorId(id)}`,
              data: {
                hProperties: {
                  'aria-label': label ? `Kaynak ${number ?? ''}: ${label}` : `Kaynak: ${id}`,
                  dataCite: id,
                },
              },
              children: [{ type: 'text', value: number ? String(number) : '?' }],
            });
          });
          children.push({ type: 'text', value: ']' });
          return {
            type: 'emphasis',
            data: { hName: 'sup', hProperties: { className: ['cite'] } },
            children,
          };
        },
      ],
    ]);
  };
}

/** Başlıklara ASCII kimlik ekler ve içindekiler listesini toplar. */
function rehypeHeadings(toc: TocEntry[]) {
  return (tree: HastRoot) => {
    const used = new Map<string, number>();
    visit(tree, 'element', (node: Element) => {
      if (!/^h[1-6]$/.test(node.tagName)) return;
      const text = hastToString(node).trim();
      const base = slugify(text) || 'bolum';
      const count = used.get(base) ?? 0;
      used.set(base, count + 1);
      const id = count === 0 ? base : `${base}-${count + 1}`;
      node.properties = { ...node.properties, id };
      if (node.tagName === 'h2' || node.tagName === 'h3') {
        toc.push({ id, text, depth: node.tagName === 'h2' ? 2 : 3 });
      }
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

/** KaTeX blok formülleri dar ekranda kayar; klavyeyle de kaydırılabilmeleri için odaklanabilir yapılır. */
function rehypeFocusableMath() {
  return (tree: HastRoot) => {
    visit(tree, 'element', (node: Element) => {
      const classes = node.properties?.className;
      if (Array.isArray(classes) && classes.includes('katex-display')) {
        node.properties = { ...node.properties, tabIndex: 0 };
      }
    });
  };
}

export function renderMarkdown(markdown: string, options: RenderOptions = {}): RenderedMarkdown {
  const toc: TocEntry[] = [];
  const cited: string[] = [];
  const internalLinks: string[] = [];
  let plainText = '';

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(() => (tree: MdastRoot) => {
      plainText = mdastToString(tree, { includeHtml: false });
    })
    .use(remarkCitations, { ...options, cited })
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeHeadings, toc)
    .use(rehypeResponsiveTables)
    .use(rehypeLinks, { internalLinks, rel: options.externalRel ?? ['noopener', 'noreferrer'] })
    .use(rehypeKatex, { strict: 'ignore', output: 'htmlAndMathml' })
    .use(rehypeFocusableMath)
    .use(rehypeStringify);

  const html = String(processor.processSync(markdown));
  return {
    html,
    toc,
    plainText: plainText.replace(/\[@[^\]]+\]/g, '').replace(/\s+/g, ' ').trim(),
    citedSourceIds: cited,
    internalLinks,
  };
}

/** Gövdedeki atıfları HTML üretmeden toplar (doğrulama için hızlı yol). */
export function extractCitationIds(markdown: string): string[] {
  const ids: string[] = [];
  for (const match of markdown.matchAll(CITATION_PATTERN)) {
    for (const part of (match[1] ?? '').split(';')) {
      const id = part.trim().replace(/^@/, '');
      if (id && !ids.includes(id)) ids.push(id);
    }
  }
  return ids;
}
