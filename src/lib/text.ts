/**
 * Türkçe metin yardımcıları.
 *
 * Arama ve sıralamada "İ/i", "I/ı" ve şapkalı/noktalı harfler doğru ele alınmalı.
 * Kullanıcılar çoğu zaman Türkçe karakter kullanmadan yazar ("kazanim",
 * "dekapaj orani"), bu yüzden karşılaştırmalar katlanmış (ASCII) biçimde yapılır.
 */

/** Türkçe kurallarıyla küçük harfe çevirir ve aksanları kaldırır: "İŞLETME" → "isletme". */
export function foldTurkish(input: string): string {
  return input
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** URL'de kullanılacak ASCII slug üretir: "Dekapaj Oranı Nedir?" → "dekapaj-orani-nedir". */
export function slugify(input: string): string {
  return foldTurkish(input)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Türk alfabesi (sözlük harf dizini için). */
export const TURKISH_ALPHABET = [
  'A',
  'B',
  'C',
  'Ç',
  'D',
  'E',
  'F',
  'G',
  'Ğ',
  'H',
  'I',
  'İ',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'Ö',
  'P',
  'R',
  'S',
  'Ş',
  'T',
  'U',
  'Ü',
  'V',
  'Y',
  'Z',
] as const;

/** Türkçe sıralama için karşılaştırıcı. */
export const turkishCollator = new Intl.Collator('tr', { sensitivity: 'base', numeric: true });

/** Terimin sözlükteki harf başlığını döndürür (alfabe dışı karakterler "#"). */
export function initialLetter(term: string): string {
  const first = term.trim().charAt(0).toLocaleUpperCase('tr-TR');
  return (TURKISH_ALPHABET as readonly string[]).includes(first) ? first : '#';
}

/** Harfi URL parçası (anchor) olarak güvenli hale getirir: "Ç" → "c-", "İ" → "i-". */
export function letterAnchor(letter: string): string {
  const map: Record<string, string> = {
    Ç: 'c-cedilla',
    Ğ: 'g-breve',
    I: 'i-dotless',
    İ: 'i-dotted',
    Ö: 'o-umlaut',
    Ş: 's-cedilla',
    Ü: 'u-umlaut',
    '#': 'diger',
  };
  return `harf-${map[letter] ?? letter.toLowerCase()}`;
}

/** Yaklaşık okuma süresi (dakika). Türkçe teknik metinde ~180 kelime/dk varsayılır. */
export function readingMinutes(plainText: string, wordsPerMinute = 180): number {
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / wordsPerMinute));
}

/** Uzun metni kelime sınırında kısaltır. */
export function truncate(input: string, maxLength: number): string {
  if (input.length <= maxLength) return input;
  const cut = input.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
