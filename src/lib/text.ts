/**
 * Türkçe metin yardımcıları.
 *
 * Arama ve sıralamada "İ/i", "I/ı" ve şapkalı/noktalı harfler doğru ele alınmalı.
 * Kullanıcılar çoğu zaman Türkçe karakter kullanmadan yazar ("kirici",
 * "daimi nezaretci"), bu yüzden karşılaştırmalar katlanmış (ASCII) biçimde yapılır.
 */

/** Türkçe kurallarıyla küçük harfe çevirir ve aksanları kaldırır: "İŞLETME" → "isletme". */
export function foldTurkish(input: string): string {
  return input
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** URL'de kullanılacak ASCII slug üretir: "Satılık Mobil Kırıcı" → "satilik-mobil-kirici". */
export function slugify(input: string): string {
  return foldTurkish(input)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Türkçe sıralama için karşılaştırıcı. */
export const turkishCollator = new Intl.Collator('tr', { sensitivity: 'base', numeric: true });

/** Uzun metni kelime sınırında kısaltır. */
export function truncate(input: string, maxLength: number): string {
  if (input.length <= maxLength) return input;
  const cut = input.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
