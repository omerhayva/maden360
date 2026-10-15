import { describe, expect, it } from 'vitest';
import { calculatorSlugs } from '@/calculators/registry';
import { loadContentStore, type ContentStore } from './repository';
import { validateStore } from './validate';

const TODAY = '2026-10-16';
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
    s.people.push({ id: 'ekip-inceleme', name: 'Ekip', kind: 'ekip', canReview: true, canModerate: false });
    const article = s.articles[0]!;
    Object.assign(article, { status: 'published', publishedAt: TODAY, reviewedAt: TODAY, reviewers: ['ekip-inceleme'], aiAssisted: true });
    expect(errorsOf(s).some((issue) => issue.message.includes('gerçek bir kişi'))).toBe(true);

    s.people.push({ id: 'uzman', name: 'Uzman Kişi', kind: 'kisi', title: 'Maden Mühendisi', canReview: true, canModerate: false });
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

describe('ilan kuralları (fuar, iş, aday, market)', () => {
  const approve = <T extends object>(entry: T, extra: Record<string, unknown> = {}) =>
    Object.assign(entry, {
      status: 'published',
      example: false,
      postedAt: '2026-10-10',
      expiresAt: '2026-11-10',
      moderatedBy: 'maden360-editorluk',
      moderatedAt: '2026-10-10',
      ...extra,
    });
  const messagesFor = (s: ContentStore, file: string) =>
    errorsOf(s)
      .filter((issue) => issue.file === file)
      .map((issue) => issue.message)
      .join('\n');

  it('depodaki örnek ilanların tamamı taslaktır ve kurallara uyar', () => {
    for (const entry of [...store.stands, ...store.jobs, ...store.candidates, ...store.marketListings]) {
      expect(entry.example).toBe(true);
      expect(entry.status).not.toBe('published');
    }
  });

  it('kurallara uygun onaylanmış ilan hatasız yayımlanır', () => {
    const s = clone(store);
    const job = approve(s.jobs[0]!);
    expect(messagesFor(s, job.file)).toBe('');
  });

  it('örnek içerik yayımlanamaz; onaylayan ve tarihler zorunludur', () => {
    const s = clone(store);
    const listing = s.marketListings[0]!;
    Object.assign(listing, { status: 'published' });
    const messages = messagesFor(s, listing.file);
    expect(messages).toContain('Örnek içerik');
    expect(messages).toContain('moderatedBy');
    expect(messages).toContain('moderatedAt');
  });

  it('ilan onaylama yetkisi olmayan kişi onaylayamaz', () => {
    const s = clone(store);
    s.people.push({ id: 'uzman', name: 'Uzman', kind: 'kisi', canReview: true, canModerate: false });
    const stand = approve(s.stands[0]!, { moderatedBy: 'uzman' });
    expect(messagesFor(s, stand.file)).toContain('canModerate');
  });

  it('yayın süresi sınırı aşılamaz (iş ilanı en fazla 60 gün)', () => {
    const s = clone(store);
    const job = approve(s.jobs[0]!, { postedAt: '2026-10-01', expiresAt: '2026-12-01' });
    expect(messagesFor(s, job.file)).toContain('en fazla 60 gün');
  });

  it('aday profilinde iletişim bilgisi ve kişisel dosya adı reddedilir', () => {
    const s = clone(store);
    const candidate = s.candidates[0]!;
    candidate.body += '\n\nBana 0532 123 45 67 numarasından ulaşabilirsiniz.';
    candidate.slug = 'ahmet-yilmaz';
    const messages = messagesFor(s, candidate.file);
    expect(messages).toContain('iletişim bilgisi bulunamaz');
    expect(messages).toContain('Dosya adı başvuru numarasıyla aynı olmalı');
  });

  it('cevher ilanında ore, saha ilanında license bloğu zorunludur', () => {
    const s = clone(store);
    const ore = s.marketListings.find((listing) => listing.category === 'cevher-urun')!;
    ore.ore = undefined;
    const site = s.marketListings.find((listing) => listing.category === 'saha-ruhsat')!;
    site.license = undefined;
    expect(messagesFor(s, ore.file)).toContain('ore bloğu');
    expect(messagesFor(s, site.file)).toContain('license bloğu');
  });

  it('aracılı (gizli) iletişimde telefon ve e-posta dosyaya yazılamaz', () => {
    const s = clone(store);
    const listing = s.marketListings.find((item) => item.contact.mode === 'aracili')!;
    listing.contact.phone = '0312 123 45 67';
    expect(messagesFor(s, listing.file)).toContain('Aracılı');
  });

  it('tanımsız salon, meslek, kategori ve bulunmayan görsel hata verir', () => {
    const s = clone(store);
    s.stands[0]!.halls = ['olmayan-salon'];
    s.jobs[0]!.position = 'olmayan-meslek';
    s.marketListings[0]!.category = 'olmayan-kategori';
    s.marketListings[1]!.images = [{ src: '/market/olmayan.webp', alt: 'Olmayan görsel' }];
    const all = errorsOf(s).map((issue) => issue.message).join('\n');
    expect(all).toContain('olmayan-salon');
    expect(all).toContain('olmayan-meslek');
    expect(all).toContain('olmayan-kategori');
    expect(all).toContain('/market/olmayan.webp');
  });

  it('süresi dolan yayımlanmış ilan uyarı verir', () => {
    const s = clone(store);
    const job = approve(s.jobs[0]!, { postedAt: '2026-08-01', expiresAt: '2026-09-15', moderatedAt: '2026-08-01' });
    const warnings = validateStore(s, { today: TODAY, calculatorSlugs })
      .filter((issue) => issue.level === 'warning' && issue.file === job.file)
      .map((issue) => issue.message);
    expect(warnings.join('\n')).toContain('süresi');
  });

  it('formlar açılırken başvuru adresi örnek adres olamaz', () => {
    const s = clone(store);
    for (const page of s.pages) if (page.slug === 'ilan-kurallari' || page.slug === 'kvkk') page.status = 'published';
    const open = (email: string) =>
      validateStore(s, { today: TODAY, calculatorSlugs, listingsEmail: email })
        .filter((issue) => issue.level === 'error' && issue.file === 'src/config/site.ts')
        .map((issue) => issue.message);
    expect(open('ilan@maden360.example').join('\n')).toContain('listingsEmail');
    expect(open('ilan@gercek-alan-adi.com.tr')).toEqual([]);
  });

  it('doldurulmamış yer tutucu içeren KVKK metni yayımlanamaz', () => {
    const s = clone(store);
    const page = s.pages.find((item) => item.slug === 'kvkk')!;
    page.status = 'published';
    expect(messagesFor(s, page.file)).toContain('yer tutucu');
  });
});

describe('ilan görünürlüğü', () => {
  it('üretimde yalnızca yayımlanmış, süresi dolmamış ve örnek olmayan ilan görünür', async () => {
    const { isListingVisible } = await import('./visibility');
    const today = '2026-10-16';
    expect(isListingVisible({ status: 'published', expiresAt: '2026-10-16' }, today)).toBe(true);
    expect(isListingVisible({ status: 'published', expiresAt: '2026-10-15' }, today)).toBe(false);
    expect(isListingVisible({ status: 'published', expiresAt: '2026-11-01', example: true }, today)).toBe(false);
    expect(isListingVisible({ status: 'review', expiresAt: '2026-11-01' }, today)).toBe(false);
    process.env.CONTENT_PREVIEW = '1';
    try {
      expect(isListingVisible({ status: 'draft', expiresAt: '2026-01-01', example: true }, today)).toBe(true);
    } finally {
      delete process.env.CONTENT_PREVIEW;
    }
  });
});
