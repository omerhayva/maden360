import { describe, expect, it } from 'vitest';
import { loadContentStore, type ContentStore } from './repository';
import { validateStore } from './validate';

const TODAY = '2026-10-16';
const { store, errors: loadErrors } = loadContentStore();

const clone = (value: ContentStore): ContentStore => structuredClone(value);
const issuesOf = (s: ContentStore) => validateStore(s, { today: TODAY });
const errorsOf = (s: ContentStore) => issuesOf(s).filter((issue) => issue.level === 'error');

describe('depodaki içerik', () => {
  it('tüm dosyalar şemaya uygun yüklenir', () => {
    expect(loadErrors.map((error) => error.message)).toEqual([]);
  });

  it('doğrulama kurallarından hata çıkmaz', () => {
    expect(errorsOf(store).map((issue) => `${issue.file}: ${issue.message}`)).toEqual([]);
  });

  it('güven sayfaları (hakkımızda, iletişim) yayımlanmış durumdadır', () => {
    const published = store.pages.filter((page) => page.status === 'published').map((page) => page.slug).sort();
    expect(published).toEqual(['hakkimizda', 'iletisim']);
  });

  it('kaldırılan bölümlerin (bilgi, sözlük, hesaplamalar) içerik klasörleri yüklenmez', () => {
    expect(Object.keys(store).sort()).toEqual(
      ['candidates', 'halls', 'jobs', 'marketCategories', 'marketListings', 'pages', 'people', 'positions', 'stands'].sort(),
    );
  });
});

describe('sayfa kuralları', () => {
  it('güven sayfası yayından kaldırılamaz veya silinemez', () => {
    const s = clone(store);
    s.pages.find((page) => page.slug === 'iletisim')!.status = 'review';
    s.pages = s.pages.filter((page) => page.slug !== 'hakkimizda');
    const messages = errorsOf(s).map((issue) => `${issue.file}: ${issue.message}`).join('\n');
    expect(messages).toContain('content/sayfalar/hakkimizda.md: Zorunlu sayfa eksik.');
    expect(messages).toContain('Güven sayfaları her zaman yayımlanmış olmalı.');
  });

  it('kaldırılan bölümlere ve olmayan ilanlara verilen bağlantılar kırık sayılır', () => {
    const s = clone(store);
    const page = s.pages.find((item) => item.slug === 'hakkimizda')!;
    page.internalLinks.push('/bilgi/dekapaj-orani', '/sozluk', '/hesaplamalar/tonaj-hacim', '/market/olmayan-ilan');
    const messages = errorsOf(s).map((issue) => issue.message).join('\n');
    for (const href of ['/bilgi/dekapaj-orani', '/sozluk', '/hesaplamalar/tonaj-hacim', '/market/olmayan-ilan']) {
      expect(messages).toContain(`Kırık site içi bağlantı: ${href}`);
    }
  });

  it('bölüm, salon, kategori ve form bağlantıları geçerlidir', () => {
    const s = clone(store);
    const page = s.pages.find((item) => item.slug === 'hakkimizda')!;
    page.internalLinks.push('/fuar', '/fuar/salonlar/is-makineleri', '/market/kategori/yedek-parca', '/ilan-ver/market-ilani', '/ara?q=kirici');
    expect(errorsOf(s).filter((issue) => issue.file === page.file)).toEqual([]);
  });

  it('gelecek tarihli sayfa güncellemesi reddedilir', () => {
    const s = clone(store);
    const page = s.pages.find((item) => item.slug === 'iletisim')!;
    page.updatedAt = '2099-01-01';
    expect(errorsOf(s).some((issue) => issue.file === page.file && issue.message.includes('gelecekte'))).toBe(true);
  });
});

describe('market kategorisi notlarındaki mevzuat atıfları', () => {
  const withReference = (checkedAt: string) => {
    const s = clone(store);
    const category = s.marketCategories.find((item) => item.notice?.references.length)!;
    category.notice!.references[0]!.checkedAt = checkedAt;
    return issuesOf(s).filter((issue) => issue.file === 'content/market-kategorileri.yaml');
  };

  it('depodaki atıfların resmî adresi ve kontrol tarihi vardır', () => {
    const references = store.marketCategories.flatMap((category) => category.notice?.references ?? []);
    expect(references.length).toBeGreaterThan(0);
    for (const reference of references) {
      expect(reference.url).toMatch(/^https:\/\/www\.resmigazete\.gov\.tr\//);
      expect(reference.checkedAt <= TODAY).toBe(true);
    }
  });

  it('gelecek tarihli kontrol hata verir', () => {
    const issues = withReference('2099-01-01');
    expect(issues.some((issue) => issue.level === 'error' && issue.message.includes('gelecekte'))).toBe(true);
  });

  it('6 aydan eski kontrol tarihi uyarı verir, güncel tarih vermez', () => {
    expect(withReference('2026-01-02').some((issue) => issue.level === 'warning' && issue.message.includes('kontrol edilmedi'))).toBe(true);
    expect(withReference('2026-10-01')).toEqual([]);
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
    s.people.push({ id: 'uzman', name: 'Uzman', kind: 'kisi', canModerate: false });
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
    const warnings = validateStore(s, { today: TODAY })
      .filter((issue) => issue.level === 'warning' && issue.file === job.file)
      .map((issue) => issue.message);
    expect(warnings.join('\n')).toContain('süresi');
  });

  it('formlar açılırken başvuru adresi örnek adres olamaz', () => {
    const s = clone(store);
    for (const page of s.pages) if (page.slug === 'ilan-kurallari' || page.slug === 'kvkk') page.status = 'published';
    const open = (email: string) =>
      validateStore(s, { today: TODAY, listingsEmail: email })
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
