import { describe, expect, it } from 'vitest';
import { parseFrontmatter } from './frontmatter';
import { extractCitationIds, renderMarkdown } from './markdown';

describe('Markdown işleme', () => {
  it('[@id] atıflarını numaralı üst simge bağlantılara çevirir', () => {
    const { html, citedSourceIds } = renderMarkdown('Kazanım tanımı [@wills-2016]. İki kaynak [@a; @wills-2016].', {
      citationNumbers: new Map([
        ['wills-2016', 1],
        ['a', 2],
      ]),
      citationLabels: new Map([['wills-2016', 'Wills ve Finch, 2016']]),
    });
    expect(html).toContain('<sup class="cite">');
    expect(html).toContain('href="#kaynak-wills-2016"');
    expect(html).toContain('aria-label="Kaynak 1: Wills ve Finch, 2016"');
    expect(html).toMatch(/>2<\/a>, <a[^>]*>1<\/a>\]/);
    expect(citedSourceIds).toEqual(['wills-2016', 'a']);
  });

  it('başlıklara ASCII kimlik verir ve içindekiler listesini toplar', () => {
    const { html, toc } = renderMarkdown('## Dekapaj Oranı Nedir?\n\nMetin\n\n### Ağırlık bazı\n\n## Dekapaj Oranı Nedir?');
    expect(html).toContain('id="dekapaj-orani-nedir"');
    expect(html).toContain('id="dekapaj-orani-nedir-2"');
    expect(toc).toEqual([
      { id: 'dekapaj-orani-nedir', text: 'Dekapaj Oranı Nedir?', depth: 2 },
      { id: 'agirlik-bazi', text: 'Ağırlık bazı', depth: 3 },
      { id: 'dekapaj-orani-nedir-2', text: 'Dekapaj Oranı Nedir?', depth: 2 },
    ]);
  });

  it('tabloları kaydırılabilir kapsayıcıya alır, dış bağlantılara rel ekler, ham HTML’i atar', () => {
    const { html, internalLinks } = renderMarkdown(
      '| A | B |\n|---|---|\n| 1 | 2 |\n\n[MAPEG](https://www.mapeg.gov.tr/) ve [hesap](/hesaplamalar/tonaj-hacim)\n\n<script>alert(1)</script>',
    );
    expect(html).toMatch(/<div class="table-wrap"[^>]*><table>/);
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).not.toContain('<script>');
    expect(internalLinks).toEqual(['/hesaplamalar/tonaj-hacim']);
  });

  it('formülleri KaTeX ile işler', () => {
    const { html } = renderMarkdown('$$\nT = V \\times \\rho\n$$\n\nSatır içi $Y = C/F$.');
    expect(html).toContain('class="katex-display"');
    expect(html).toContain('<math');
  });

  it('extractCitationIds atıfları tekrarsız toplar', () => {
    expect(extractCitationIds('a [@x] b [@y; @x] c [@z]')).toEqual(['x', 'y', 'z']);
  });
});

describe('Ön bilgi (frontmatter)', () => {
  it('Windows satır sonlarını (CRLF) ve BOM’u tolere eder; tarihler metin kalır', () => {
    const raw = '\uFEFF---\r\ntitle: Deneme\r\npublishedAt: 2026-10-15\r\n---\r\nGövde\r\n';
    const { data, body } = parseFrontmatter(raw, 'deneme.md');
    expect(data).toEqual({ title: 'Deneme', publishedAt: '2026-10-15' });
    expect(body).toBe('Gövde\n');
  });

  it('ön bilgisi olmayan dosyada açıklayıcı hata verir', () => {
    expect(() => parseFrontmatter('# Başlık', 'x.md')).toThrow(/ön bilgi/);
  });
});
