import { describe, expect, it } from 'vitest';
import { calculatorSlugs } from '@/calculators/registry';
import { loadContentStore, type ContentStore } from './repository';
import { validateStore } from './validate';

const TODAY = '2026-10-15';
const { store, errors: loadErrors } = loadContentStore();

const clone = (value: ContentStore): ContentStore => structuredClone(value);
const errorsOf = (s: ContentStore) =>
  validateStore(s, { today: TODAY, calculatorSlugs }).filter((issue) => issue.level === 'error');

describe('depodaki içerik', () => {
  it('tüm dosyalar şemaya uygun yüklenir', () => {
    expect(loadErrors.map((error) => error.message)).toEqual([]);
  });

  it('doğrulama kurallarından hata çıkmaz', () => {
    expect(errorsOf(store).map((issue) => `${issue.file}: ${issue.message}`)).toEqual([]);
  });

  it('her hesap motorunun açıklama sayfası, her sayfanın hesap motoru vardır', () => {
    expect(store.calculators.map((calculator) => calculator.slug).sort()).toEqual([...calculatorSlugs].sort());
  });

  it('dört güven sayfası yayımlanmış durumdadır', () => {
    const published = store.pages.filter((page) => page.status === 'published').map((page) => page.slug).sort();
    expect(published).toEqual(['duzeltme-politikasi', 'hakkimizda', 'iletisim', 'kaynak-politikasi']);
  });

  it('yapay zekâ destekli içeriklerin hiçbiri incelemesiz yayımlanmamıştır', () => {
    const people = new Map(store.people.map((person) => [person.id, person]));
    for (const entry of [...store.articles, ...store.terms, ...store.calculators]) {
      if (entry.aiAssisted && entry.status === 'published') {
        expect(entry.reviewers.some((id) => people.get(id)?.kind === 'kisi')).toBe(true);
      }
    }
  });
});

describe('doğrulama kuralları', () => {
  it('inceleyici, inceleme tarihi ve yayın tarihi olmadan yayımlanamaz', () => {
    const s = clone(store);
    s.articles[0]!.status = 'published';
    const messages = errorsOf(s).map((issue) => issue.message).join('\n');
    expect(messages).toContain('publishedAt');
    expect(messages).toContain('reviewedAt');
    expect(messages).toContain('teknik inceleyici');
  });

  it('yapay zekâ destekli içerik, gerçek kişi incelemesi olmadan yayımlanamaz', () => {
    const s = clone(store);
    s.people.push({ id: 'ekip-inceleme', name: 'Ekip', kind: 'ekip', canReview: true });
    const article = s.articles[0]!;
    Object.assign(article, { status: 'published', publishedAt: TODAY, reviewedAt: TODAY, reviewers: ['ekip-inceleme'], aiAssisted: true });
    expect(errorsOf(s).some((issue) => issue.message.includes('gerçek bir kişi'))).toBe(true);

    s.people.push({ id: 'uzman', name: 'Uzman Kişi', kind: 'kisi', title: 'Maden Mühendisi', canReview: true });
    article.reviewers = ['uzman'];
    expect(errorsOf(s).filter((issue) => issue.file === article.file)).toEqual([]);
  });

  it('inceleme yetkisi olmayan kişi inceleyici olamaz', () => {
    const s = clone(store);
    s.articles[0]!.reviewers = ['maden360-editorluk'];
    expect(errorsOf(s).some((issue) => issue.message.includes('canReview'))).toBe(true);
  });

  it('kaynak listesinde olmayan atıf hata verir', () => {
    const s = clone(store);
    s.articles[0]!.body += '\n\nEk bilgi [@olmayan-kaynak].';
    expect(errorsOf(s).some((issue) => issue.message.includes('olmayan-kaynak'))).toBe(true);
  });

  it('mevzuat konusundaki makalede yürürlük bilgisi zorunludur', () => {
    const s = clone(store);
    const article = s.articles.find((entry) => entry.category === 'mevzuat')!;
    article.legal = undefined;
    expect(errorsOf(s).some((issue) => issue.message.includes('legal'))).toBe(true);
  });

  it('kırık site içi bağlantı ve tanımsız ilişki hata verir', () => {
    const s = clone(store);
    s.articles[0]!.internalLinks.push('/bilgi/olmayan-makale');
    s.articles[0]!.relatedTerms.push('olmayan-terim');
    const messages = errorsOf(s).map((issue) => issue.message).join('\n');
    expect(messages).toContain('/bilgi/olmayan-makale');
    expect(messages).toContain('olmayan-terim');
  });

  it('gelecek tarihli inceleme reddedilir', () => {
    const s = clone(store);
    s.terms[0]!.reviewedAt = '2099-01-01';
    expect(errorsOf(s).some((issue) => issue.message.includes('gelecekte'))).toBe(true);
  });

  it('URL’si olan kaynakta erişim tarihi zorunludur', () => {
    const s = clone(store);
    const source = s.sources.find((item) => item.url)!;
    source.accessedAt = undefined;
    expect(errorsOf(s).some((issue) => issue.message.includes('accessedAt'))).toBe(true);
  });
});
