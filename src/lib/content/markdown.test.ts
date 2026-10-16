import { describe, expect, it } from 'vitest';
import { parseFrontmatter } from './frontmatter';
import { renderMarkdown } from './markdown';

describe('Markdown işleme', () => {
  it('başlıklara ASCII kimlik verir; aynı başlıklar numaralanır', () => {
    const { html } = renderMarkdown('## Ödeme ve Teslimat\n\nMetin\n\n### Çalışma şartları\n\n## Ödeme ve Teslimat');
    expect(html).toContain('id="odeme-ve-teslimat"');
    expect(html).toContain('id="calisma-sartlari"');
    expect(html).toContain('id="odeme-ve-teslimat-2"');
  });

  it('tabloları kaydırılabilir kapsayıcıya alır, dış bağlantılara rel ekler, ham HTML’i atar', () => {
    const { html, internalLinks, plainText } = renderMarkdown(
      '| A | B |\n|---|---|\n| 1 | 2 |\n\n[MAPEG](https://www.mapeg.gov.tr/) ve [ilan](/market/ornek-ilan)\n\n<script>alert(1)</script>',
    );
    expect(html).toMatch(/<div class="table-wrap"[^>]*><table>/);
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).not.toContain('<script>');
    expect(internalLinks).toEqual(['/market/ornek-ilan']);
    expect(plainText).not.toContain('alert');
  });

  it('kullanıcı içeriğinde dış bağlantılar "nofollow ugc" olarak işaretlenir', () => {
    const { html } = renderMarkdown('[Firma sitesi](https://ornek-firma.com.tr)', {
      externalRel: ['nofollow', 'ugc', 'noopener', 'noreferrer'],
    });
    expect(html).toContain('rel="nofollow ugc noopener noreferrer"');
    expect(html).toContain('class="external"');
  });

  it('formül sözdizimi düz metin olarak kalır (KaTeX yok)', () => {
    const { html } = renderMarkdown('Fiyat $100 ile $200 arası.');
    expect(html).toContain('$100 ile $200');
    expect(html).not.toContain('katex');
  });
});

describe('Ön bilgi (frontmatter)', () => {
  it('Windows satır sonlarını (CRLF) ve BOM’u tolere eder; tarihler metin kalır', () => {
    const raw = '\uFEFF---\r\ntitle: Deneme\r\npostedAt: 2026-10-15\r\n---\r\nGövde\r\n';
    const { data, body } = parseFrontmatter(raw, 'deneme.md');
    expect(data).toEqual({ title: 'Deneme', postedAt: '2026-10-15' });
    expect(body).toBe('Gövde\n');
  });

  it('ön bilgisi olmayan dosyada açıklayıcı hata verir', () => {
    expect(() => parseFrontmatter('# Başlık', 'x.md')).toThrow(/ön bilgi/);
  });
});
