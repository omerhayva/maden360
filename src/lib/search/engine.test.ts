import { describe, expect, it } from 'vitest';
import {
  createSearchIndex,
  hasSearchableTerms,
  indexTerm,
  queryTerm,
  runSearch,
  SEARCH_DOC_TYPES,
  withoutExpired,
  type SearchDocument,
} from './engine';

const doc = (
  partial: Partial<SearchDocument> & Pick<SearchDocument, 'id' | 'title'>,
): SearchDocument => ({
  type: 'market',
  url: `/${partial.id.replace(':', '/')}`,
  summary: '',
  keywords: '',
  headings: '',
  body: '',
  ...partial,
});

const documents: SearchDocument[] = [
  doc({
    id: 'market:cene',
    title: 'Kırıcı Çene Plakaları',
    keywords: 'yedek parça jaw crusher mangan',
  }),
  doc({
    id: 'market:ekskavator',
    title: 'Satılık 30 Ton Paletli Ekskavatör',
    keywords: 'iş makinesi excavator',
  }),
  doc({
    id: 'is:nezaretci',
    type: 'is-ilani',
    title: 'Daimi Nezaretçi (Taş Ocağı)',
    body: 'Kömür ve taş ocağı işletmelerinde deneyimli maden mühendisi aranıyor.',
  }),
  doc({
    id: 'market:saha',
    title: 'IV-C Grubu Saha Rödövansa Verilecek',
    keywords: 'royalty ruhsat',
    body: 'İşletme ruhsatlı saha için rödövans teklifleri değerlendirilecektir.',
  }),
  doc({
    id: 'stand:sondaj',
    type: 'stand',
    title: 'Örnek Karot Sondaj',
    summary: 'Karotlu sondaj ve maden arama hizmetleri.',
  }),
];

const index = createSearchIndex(documents);
const ids = (query: string) => runSearch(index, query).hits.map((hit) => hit.id);

describe('Türkçe arama', () => {
  it('terimleri katlar ve F5 köküyle genişletir', () => {
    expect(indexTerm('Ekskavatörü')).toEqual(['ekskavatoru', 'ekska']);
    expect(indexTerm('ve')).toBeNull();
    expect(queryTerm('EKSKAVATÖRLER')).toBe('ekska');
    expect(queryTerm('kova')).toBe('kova');
  });

  it('Türkçe karakter kullanılmadan da bulur', () => {
    expect(ids('kirici')).toContain('market:cene');
    expect(ids('komur')).toContain('is:nezaretci');
    expect(ids('isletme')).toContain('market:saha');
  });

  it('çekimli biçimleri bulur', () => {
    expect(ids('kırıcının plakası')[0]).toBe('market:cene');
    expect(ids('ekskavatörler')).toContain('market:ekskavator');
    expect(ids('rödövansı')).toContain('market:saha');
  });

  it('anahtar kelime ve İngilizce karşılıklarla bulur', () => {
    expect(ids('jaw crusher')[0]).toBe('market:cene');
    expect(ids('excavator')).toContain('market:ekskavator');
  });

  it('tam eşleşme varken bulanık eşleşmeyle ilgisiz sonuç eklemez', () => {
    const local = createSearchIndex([
      doc({ id: 'market:a', title: 'Kiralık loder' }),
      doc({ id: 'is:b', type: 'is-ilani', title: 'Vardiya lideri' }),
    ]);
    expect(runSearch(local, 'loder').hits.map((hit) => hit.id)).toEqual(['market:a']);
  });

  it('küçük yazım hatalarını tolere eder', () => {
    expect(ids('ekskvatör')).toContain('market:ekskavator');
  });

  it('tüm kelimeler eşleşmezse gevşetilmiş aramaya geçer', () => {
    const outcome = runSearch(index, 'sondaj bilmemne');
    expect(outcome.relaxed).toBe(true);
    expect(outcome.hits[0]?.id).toBe('stand:sondaj');
  });

  it('sonuç yoksa boş döner', () => {
    expect(runSearch(index, 'zzzzqqq').hits).toEqual([]);
    expect(runSearch(index, '   ').hits).toEqual([]);
  });

  it('yalnızca dolgu kelimeleri içeren sorguları ayırt eder', () => {
    expect(hasSearchableTerms('nedir ve')).toBe(false);
    expect(hasSearchableTerms('kırıcı nedir')).toBe(true);
  });
});

describe('ilanlar aramada', () => {
  it('yalnızca fuar standı, iş ilanı ve market ilanı türleri vardır', () => {
    expect(SEARCH_DOC_TYPES).toEqual(['stand', 'is-ilani', 'market']);
  });

  it('süresi dolan ilanlar sonuçlardan çıkarılır; bitiş günü dahildir', () => {
    const local = createSearchIndex([
      doc({ id: 'market:a', title: 'Satılık ekskavatör', expiresAt: '2026-10-20' }),
      doc({ id: 'market:b', title: 'Kiralık ekskavatör', expiresAt: '2026-10-01' }),
      doc({ id: 'market:c', title: 'Ekskavatör kovası', expiresAt: '2026-10-16' }),
      doc({ id: 'stand:d', type: 'stand', title: 'Ekskavatör servisi' }),
    ]);
    const live = withoutExpired(runSearch(local, 'ekskavatör').hits, '2026-10-16').map(
      (hit) => hit.id,
    );
    expect(live.sort()).toEqual(['market:a', 'market:c', 'stand:d']);
  });
});
