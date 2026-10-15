import { describe, expect, it } from 'vitest';
import {
  createSearchIndex,
  hasSearchableTerms,
  indexTerm,
  queryTerm,
  runSearch,
  type SearchDocument,
} from './engine';

const doc = (
  partial: Partial<SearchDocument> & Pick<SearchDocument, 'id' | 'title'>,
): SearchDocument => ({
  type: 'makale',
  url: `/${partial.id}`,
  summary: '',
  keywords: '',
  headings: '',
  body: '',
  ...partial,
});

const documents: SearchDocument[] = [
  doc({
    id: 'hesaplama:kutle',
    type: 'hesaplama',
    title: 'Kütle Verimi ve Metal Kazanımı Hesaplayıcı',
    keywords: 'recovery flotasyon',
  }),
  doc({
    id: 'hesaplama:dekapaj',
    type: 'hesaplama',
    title: 'Dekapaj Oranı Hesaplayıcı',
    keywords: 'stripping ratio örtü kazısı',
  }),
  doc({
    id: 'makale:komur',
    title: 'Linyit ve Taşkömürü Üretimi',
    body: 'Kömür ocaklarında havalandırma önemlidir.',
  }),
  doc({ id: 'terim:grizu', type: 'terim', title: 'Grizu', summary: 'Metanın havayla karışımı.' }),
  doc({
    id: 'makale:isletme',
    title: 'İşletme Ruhsatı Süreci',
    body: 'MAPEG başvuruları e-Maden üzerinden yapılır.',
  }),
];

const index = createSearchIndex(documents);
const ids = (query: string) => runSearch(index, query).hits.map((hit) => hit.id);

describe('Türkçe arama', () => {
  it('terimleri katlar ve F5 köküyle genişletir', () => {
    expect(indexTerm('Kazanımı')).toEqual(['kazanimi', 'kazan']);
    expect(indexTerm('ve')).toBeNull();
    expect(queryTerm('KAZANIMLARI')).toBe('kazan');
    expect(queryTerm('oran')).toBe('oran');
  });

  it('Türkçe karakter kullanılmadan da bulur', () => {
    expect(ids('kazanim')).toContain('hesaplama:kutle');
    expect(ids('komur')).toContain('makale:komur');
    expect(ids('isletme')).toContain('makale:isletme');
  });

  it('çekimli biçimleri bulur', () => {
    expect(ids('dekapajın oranı')[0]).toBe('hesaplama:dekapaj');
    expect(ids('kömürün')).toContain('makale:komur');
  });

  it('anahtar kelime ve İngilizce karşılıklarla bulur', () => {
    expect(ids('stripping ratio')[0]).toBe('hesaplama:dekapaj');
    expect(ids('recovery')).toContain('hesaplama:kutle');
  });

  it('tam eşleşme varken bulanık eşleşmeyle ilgisiz sonuç eklemez', () => {
    const docs = [
      doc({ id: 'a', title: 'Metal kazanımı' }),
      doc({ id: 'b', title: 'Kalan vardiya sayısı' }),
    ];
    const local = createSearchIndex(docs);
    expect(runSearch(local, 'kazanim').hits.map((hit) => hit.id)).toEqual(['a']);
  });

  it('küçük yazım hatalarını tolere eder', () => {
    expect(ids('havalandrma')).toContain('makale:komur');
  });

  it('tüm kelimeler eşleşmezse gevşetilmiş aramaya geçer', () => {
    const outcome = runSearch(index, 'grizu bilmemne');
    expect(outcome.relaxed).toBe(true);
    expect(outcome.hits[0]?.id).toBe('terim:grizu');
  });

  it('sonuç yoksa boş döner', () => {
    expect(runSearch(index, 'zzzzqqq').hits).toEqual([]);
    expect(runSearch(index, '   ').hits).toEqual([]);
  });

  it('yalnızca dolgu kelimeleri içeren sorguları ayırt eder', () => {
    expect(hasSearchableTerms('nedir ve')).toBe(false);
    expect(hasSearchableTerms('tenör nedir')).toBe(true);
  });
});
