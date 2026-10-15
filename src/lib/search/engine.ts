import MiniSearch, { type SearchResult } from 'minisearch';
import { foldTurkish } from '@/lib/text';

/**
 * Yerel (tarayıcı içi) arama motoru.
 *
 * Türkçe sondan eklemeli bir dil olduğu için "kazanım", "kazanımı",
 * "kazanımın" gibi biçimlerin birbirini bulması gerekir. Basit ve etkili bir
 * yöntem olarak her kelime hem tam hâliyle hem de ilk 5 harfiyle (F5 kökü)
 * dizine eklenir; aramada uzun kelimeler 5 harfe kısaltılıp önek araması yapılır.
 * Ayrıca Türkçe karakterler katlanır: "kömür" = "komur", "İşletme" = "isletme".
 */

export type SearchDocType = 'hesaplama' | 'makale' | 'terim' | 'stand' | 'is-ilani' | 'market';

export interface SearchDocument {
  id: string;
  type: SearchDocType;
  title: string;
  url: string;
  summary: string;
  category?: string;
  /** Anahtar kelimeler, eş anlamlılar, İngilizce karşılıklar, etiketler */
  keywords: string;
  headings: string;
  body: string;
  /** İlanlarda bitiş tarihi: süresi dolan ilan tarayıcıda sonuçlardan çıkarılır. */
  expiresAt?: string;
}

export type SearchHit = SearchResult &
  Pick<SearchDocument, 'type' | 'title' | 'url' | 'summary' | 'category' | 'expiresAt'>;

export const typeLabels: Record<SearchDocType, string> = {
  hesaplama: 'Hesaplayıcı',
  makale: 'Makale',
  terim: 'Sözlük',
  stand: 'Fuar standı',
  'is-ilani': 'İş ilanı',
  market: 'Market ilanı',
};

export const SEARCH_DOC_TYPES = Object.keys(typeLabels) as SearchDocType[];

/** İlan türleri teknik içerikle eşit puanda biraz geride sıralanır. */
const LISTING_TYPES = new Set<SearchDocType>(['stand', 'is-ilani', 'market']);

const STOPWORDS = new Set([
  've',
  'ile',
  'bir',
  'bu',
  'da',
  'de',
  'ki',
  'mi',
  'mu',
  'icin',
  'gibi',
  'daha',
  'en',
  'ya',
  'veya',
  'ne',
  'nedir',
  'nasil',
  'hangi',
  'olan',
  'olarak',
  'her',
  'cok',
  'ama',
  'fakat',
  'ise',
  'kadar',
  'sonra',
  'once',
  'in',
  'nin',
  'nun',
  'un',
  'den',
  'dan',
  'ten',
  'tan',
  'te',
  'ta',
  'ye',
  'le',
  'la',
  'dir',
  'tir',
  'the',
  'of',
  'and',
  'to',
  'in',
  'is',
]);

const STEM_LENGTH = 5;

/** Dizinleme: kelime + F5 kökü */
export function indexTerm(term: string): string[] | null {
  const folded = foldTurkish(term);
  if (folded.length < 2 || STOPWORDS.has(folded)) return null;
  return folded.length > STEM_LENGTH ? [folded, folded.slice(0, STEM_LENGTH)] : [folded];
}

/** Sorgu: uzun kelimeler köküne indirgenir, önek ve hata toleranslı arama yapılır. */
export function queryTerm(term: string): string | null {
  const folded = foldTurkish(term);
  if (folded.length < 2 || STOPWORDS.has(folded)) return null;
  return folded.length > STEM_LENGTH ? folded.slice(0, STEM_LENGTH) : folded;
}

export function createSearchIndex(documents: SearchDocument[]): MiniSearch<SearchDocument> {
  const index = new MiniSearch<SearchDocument>({
    fields: ['title', 'keywords', 'summary', 'headings', 'body'],
    storeFields: ['type', 'title', 'url', 'summary', 'category', 'expiresAt'],
    processTerm: indexTerm,
    searchOptions: {
      processTerm: queryTerm,
      boost: { title: 4, keywords: 3, summary: 1.5, headings: 1.5, body: 1 },
      prefix: true,
      fuzzy: (term) => (term.length >= STEM_LENGTH ? 0.2 : false),
      combineWith: 'AND',
      // Hesaplayıcılar platformun ana ürünü olduğu için hafifçe öne çıkarılır;
      // ilanlar teknik içerikle eşit puanda geride kalır.
      boostDocument: (_id, _term, stored) =>
        stored?.type === 'hesaplama'
          ? 1.15
          : LISTING_TYPES.has(stored?.type as SearchDocType)
            ? 0.9
            : 1,
    },
  });
  index.addAll(documents);
  return index;
}

export interface SearchOutcome {
  hits: SearchHit[];
  /** Tüm kelimeleri içeren sonuç bulunamadığı için gevşetilmiş (VEYA) arama yapıldı mı? */
  relaxed: boolean;
}

/**
 * Kademeli arama:
 *  1. Tüm kelimeler, tam veya önek eşleşmesiyle (en isabetli sonuçlar),
 *  2. sonuç yoksa yazım hatası toleransıyla (ör. "havalandrma"),
 *  3. yine sonuç yoksa kelimelerden herhangi biriyle (gevşetilmiş arama).
 */
export function runSearch(index: MiniSearch<SearchDocument>, query: string): SearchOutcome {
  const trimmed = query.trim();
  if (trimmed.length === 0) return { hits: [], relaxed: false };
  let hits = index.search(trimmed, { fuzzy: false }) as SearchHit[];
  if (hits.length === 0) hits = index.search(trimmed) as SearchHit[];
  let relaxed = false;
  if (hits.length === 0) {
    hits = index.search(trimmed, { combineWith: 'OR' }) as SearchHit[];
    relaxed = hits.length > 0;
  }
  return { hits, relaxed };
}

/** Süresi dolmuş ilanları sonuçlardan çıkarır (statik dizin bir sonraki derlemeye kadar eskiyebilir). */
export function withoutExpired(hits: SearchHit[], today: string): SearchHit[] {
  return hits.filter((hit) => !hit.expiresAt || hit.expiresAt >= today);
}

/** Sorgunun aranabilir en az bir kelime içerip içermediği */
export function hasSearchableTerms(query: string): boolean {
  return query.split(/[\s\p{P}]+/u).some((word) => queryTerm(word) !== null);
}
