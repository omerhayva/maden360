/**
 * Metin içinde iletişim bilgisi (e-posta, telefon, web adresi) arar.
 *
 * Aday profillerinde iletişim bilgisi yayımlanmaz; talepler editör aracılığıyla
 * iletilir. Bu denetim, adayın serbest metnine yanlışlıkla yazılmış telefon veya
 * e-postanın herkese açık depoya ve siteye girmesini önlemek içindir.
 */

const EMAIL_PATTERN = /[\p{L}0-9._%+-]+@[\p{L}0-9.-]+\.[a-z]{2,}/giu;

/**
 * Türkiye telefon numaraları: 0532 123 45 67, +90 (532) 123-4567, (0312) 555 55 55,
 * 05321234567. On haneli (alan kodu + numara) dizilerle eşleşir; fiyat
 * (1.250.000), yıl (2014) veya çalışma saati (12.500) gibi sayılarla eşleşmez.
 */
const PHONE_PATTERN =
  /(?<![\d.,])(?:\+?\s?90[\s.-]*)?\(?0?\s?[2-5]\d{2}\)?[\s.-]*\d{3}[\s.-]*\d{2}[\s.-]*\d{2}(?![\d.,]\d)/g;

const URL_PATTERN = /\b(?:https?:\/\/|www\.)[^\s)>\]]+/gi;

export interface ContactMatch {
  kind: 'eposta' | 'telefon' | 'web';
  text: string;
}

export function findContactInfo(text: string): ContactMatch[] {
  const matches: ContactMatch[] = [];
  for (const match of text.matchAll(EMAIL_PATTERN))
    matches.push({ kind: 'eposta', text: match[0] });
  for (const match of text.matchAll(URL_PATTERN)) matches.push({ kind: 'web', text: match[0] });
  // E-posta ve adres içindeki rakamlar telefon sayılmasın
  const withoutOthers = text.replace(EMAIL_PATTERN, ' ').replace(URL_PATTERN, ' ');
  for (const match of withoutOthers.matchAll(PHONE_PATTERN)) {
    matches.push({ kind: 'telefon', text: match[0].trim() });
  }
  return matches;
}

export function containsContactInfo(text: string): boolean {
  return findContactInfo(text).length > 0;
}

/** Geçerli bir Türkiye veya uluslararası telefon numarası biçimi mi? (form ve şema denetimi) */
export function isPhoneNumber(value: string): boolean {
  const trimmed = value.trim();
  if (!/^\+?[0-9 ().-]+$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

/** tel: bağlantısı için sadeleştirilmiş numara: "0532 123 45 67" → "+905321234567" */
export function telHref(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (value.trim().startsWith('+')) return `tel:+${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `tel:+90${digits.slice(1)}`;
  if (digits.length === 10) return `tel:+90${digits}`;
  return `tel:${digits}`;
}
